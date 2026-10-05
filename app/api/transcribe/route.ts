import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const allowedTypes = new Set(["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav"]);
const maxAudioBytes = 2_000_000;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in with ChatGPT to use voice input." }, { status: 401 });
  if (!env.DB) return Response.json({ error: "Account storage is unavailable." }, { status: 503 });
  const db = env.DB;
  const registered = await db.prepare("SELECT id FROM users WHERE id=?").bind(user.userId).first();
  if (!registered) return Response.json({ error: "Register your account before using voice input." }, { status: 403 });
  if (!env.OPENAI_API_KEY) return Response.json({ error: "Voice input is awaiting secure server configuration." }, { status: 503 });
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return Response.json({ error: "Invalid audio upload." }, { status: 400 });
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > maxAudioBytes + 100_000) return Response.json({ error: "Recording is too large. Keep it under 45 seconds." }, { status: 413 });

  let audio: FormDataEntryValue | null;
  try { audio = (await request.formData()).get("audio"); }
  catch { return Response.json({ error: "Invalid audio upload." }, { status: 400 }); }
  if (!(audio instanceof File) || audio.size < 1000 || audio.size > maxAudioBytes)
    return Response.json({ error: "Record a short question under 45 seconds." }, { status: 400 });
  const mediaType = audio.type.split(";")[0].toLowerCase();
  if (!allowedTypes.has(mediaType)) return Response.json({ error: "This audio format is not supported." }, { status: 415 });

  const windowStart = new Date(); windowStart.setUTCMinutes(0, 0, 0);
  const allowed = await db.prepare("INSERT INTO chat_rate_limits (user_id,window_start,count) VALUES (?,?,1) ON CONFLICT(user_id,window_start) DO UPDATE SET count=count+1 WHERE count < 20 RETURNING count")
    .bind(user.userId, `voice:${windowStart.toISOString()}`).first();
  if (!allowed) return Response.json({ error: "Voice input limit reached. Try again next hour." }, { status: 429 });

  const upload = new FormData();
  upload.append("model", "gpt-4o-mini-transcribe");
  upload.append("file", new Blob([audio], { type: mediaType }), mediaType === "audio/mp4" ? "question.mp4" : "question.webm");
  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST", headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: upload, signal: AbortSignal.timeout(30000),
    });
  } catch {
    return Response.json({ error: "Voice transcription could not be reached. Try again." }, { status: 503 });
  }
  if (!upstream.ok) {
    console.error("Voice transcription rejected", upstream.status);
    const error = upstream.status === 429 ? "Voice transcription hit an API credit or rate limit." : "Voice transcription is unavailable. Try again later.";
    return Response.json({ error }, { status: 502 });
  }
  let data: { text?: unknown };
  try { data = await upstream.json(); }
  catch { return Response.json({ error: "Voice transcription returned an unreadable result." }, { status: 502 }); }
  const text = typeof data.text === "string" ? data.text.trim() : "";
  if (!text || text.length > 4000) return Response.json({ error: "No short question was recognized. Please try again." }, { status: 422 });
  return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
}
