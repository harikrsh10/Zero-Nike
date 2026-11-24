import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ProductPage } from "@/components/ProductPage";
import { MODE_COOKIE, product, type SizeMode } from "@/data/product";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

export default function Page({ searchParams }: { searchParams: Search }) {
  // The fallback has the same layout, so nothing shifts when the real page streams in.
  return (
    <Suspense fallback={<ProductPage prelaunch initialMode="M" ready={false} />}>
      <ResolvedPage searchParams={searchParams} />
    </Suspense>
  );
}

async function ResolvedPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;

  // ?gender= from the incoming link wins, then the saved cookie, then US Men's.
  const gender = typeof params.gender === "string" ? params.gender.toLowerCase() : "";
  const saved = (await cookies()).get(MODE_COOKIE)?.value;
  const initialMode: SizeMode =
    gender === "w" ? "W" : gender === "m" ? "M" : saved === "W" || saved === "M" || saved === "EU" ? saved : "M";

  // ?launched=1 previews the on-sale state before launch day.
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const prelaunch = params.launched !== "1" && today < product.launchDate;

  return <ProductPage prelaunch={prelaunch} initialMode={initialMode} />;
}
