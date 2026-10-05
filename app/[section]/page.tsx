import { notFound, redirect } from "next/navigation";
import { SiteView } from "@/components/site-view";
import { sections } from "@/lib/sections";

export function generateStaticParams() {
  return sections.filter((item) => item.slug !== "ic-memo").map((item) => ({ section: item.slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "overview") redirect("/");
  if (!sections.some((item) => item.slug === section) || section === "ic-memo") notFound();
  return <SiteView section={section} />;
}
