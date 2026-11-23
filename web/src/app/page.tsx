import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ProductPage } from "@/components/ProductPage";
import { MODE_COOKIE, product, type SizeMode } from "@/data/product";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

export default function Page({ searchParams }: { searchParams: Search }) {
  // The fallback is the same page with default settings, so the layout is
  // identical while the per-request bits stream in: nothing shifts.
  return (
    <Suspense fallback={<ProductPage prelaunch initialMode="M" />}>
      <ResolvedPage searchParams={searchParams} />
    </Suspense>
  );
}

async function ResolvedPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;

  // ?gender=w or ?gender=m comes from the link she arrived by (e.g. a women's listing).
  // Otherwise use the size system she picked last time (cookie), else US Men's.
  const gender = typeof params.gender === "string" ? params.gender.toLowerCase() : "";
  const saved = (await cookies()).get(MODE_COOKIE)?.value;
  const initialMode: SizeMode =
    gender === "w" ? "W" : gender === "m" ? "M" : saved === "W" || saved === "M" || saved === "EU" ? saved : "M";

  // Launch check runs per request. ?launched=1 previews the on-sale state early.
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const prelaunch = params.launched !== "1" && today < product.launchDate;

  return <ProductPage prelaunch={prelaunch} initialMode={initialMode} />;
}
