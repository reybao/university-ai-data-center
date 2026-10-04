import { env } from "cloudflare:workers";

const allowedSections = new Set(["overview", "demand", "architecture", "location", "economics", "risk-delivery", "scenario-lab"]);

export async function POST(request: Request) {
  let payload: { message?: unknown; context?: { section?: unknown; scenarioInputs?: unknown } };
  try { payload = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message || message.length > 4000) return Response.json({ error: "Enter a question under 4,000 characters." }, { status: 400 });

  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL;
  if (!apiKey || !model) return Response.json({ error: "AI Research Assistant is awaiting secure server configuration." }, { status: 503 });

  const section = typeof payload.context?.section === "string" && allowedSections.has(payload.context.section) ? payload.context.section : "overview";
  // TODO: Replace this client-provided draft context with server-validated research records and saved scenario inputs.
  const draftInputs = payload.context?.scenarioInputs && typeof payload.context.scenarioInputs === "object" ? JSON.stringify(payload.context.scenarioInputs).slice(0, 2000) : "none";
  const instructions = "You assist an investment committee reviewing a proposed university consortium AI data center. The 25 MW figure is a possible expansion boundary, not a validated 2030 base requirement. The five-member example uses unmeasured demand weights of 1.0, 0.75, 0.75, 0.5, and 0.5, totaling 3.5 MIT reference demand units. The current model assigns each GPU-hour to one primary compute activity; biomedical and robotics are nonadditive tags, and coding agents are an inference subtype assumed to have distinct incremental requests. The current 2030 base estimate is about 14 MW and remains an unvalidated scenario. Hardware mapping remains under review. Research data, costs, city rankings, workloads, and conclusions are unverified unless later supplied from a validated server-side research store. Never invent figures. Say TBD when evidence is unavailable. Clearly distinguish user-entered scenario assumptions from sourced findings.";
  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, store: false, instructions, input: `Current section: ${section}\nUnverified draft scenario inputs: ${draftInputs}\nQuestion: ${message}` }) });
    if (!upstream.ok) return Response.json({ error: "AI service is temporarily unavailable." }, { status: 502 });
    const data = await upstream.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const reply = data.output?.flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text || "").join("\n").trim();
    return Response.json({ reply: reply || "No answer was returned." });
  } catch { return Response.json({ error: "AI service is temporarily unavailable." }, { status: 502 }); }
}
