import type { StaticImageData } from "next/image";
import sizesJson from "../../../Pegasus 43 size and stock list.json";
import sidePhoto from "@/assets/pegasus-43-side.png";

// Read on the server, written by the client.
export const MODE_COOKIE = "pdp-size-mode";
export type SizeMode = "W" | "M" | "EU";

export type StockStatus = "in_stock" | "low_stock" | "sold_out";

export type SizeRow = {
  sku: string;
  style_code: string;
  product_name: string;
  colorway: string;
  price: number;
  size_label: string;
  size_us_men: number;
  size_us_women: number;
  size_eu: string;
  display_order: number;
  in_stock: boolean;
  stock_quantity: number;
  stock_status: StockStatus;
  launch_date: string;
};

export const sizes: SizeRow[] = (sizesJson as SizeRow[])
  .slice()
  .sort((a, b) => a.display_order - b.display_order);

const first = sizes[0];

export const product = {
  name: first.product_name,
  colorway: first.colorway,
  price: first.price,
  launchDate: first.launch_date,
};

export const photos: { src: StaticImageData; alt: string }[] = [
  { src: sidePhoto, alt: "Pegasus 43, side view" },
];

// Specs, rating, fit and reviews below are made up to fill the layout.
// Swap in real product and customer data before launch.
export const specs = [
  { label: "Drop", value: "10 mm" },
  { label: "Weight", value: "≈ 280 g (M 10)" },
  { label: "Cushioning", value: "Responsive foam" },
  { label: "Best for", value: "Daily miles" },
];

export const techCopy = [
  {
    heading: "Ride",
    body: "A balanced, everyday ride with enough bounce for tempo work and enough cushioning for long, easy miles.",
  },
  {
    heading: "Upper",
    body: "Engineered mesh breathes where your foot heats up and holds where you need lockdown. A padded tongue and collar keep the fit snug without pressure points.",
  },
  {
    heading: "Outsole",
    body: "Rubber placed in high-wear zones adds durability and grip on wet roads without adding weight.",
  },
  {
    heading: "Fit",
    body: "Fits true to size for most runners. If you are between sizes, go half a size up.",
  },
];

export const ratingSummary = {
  average: 4.6,
  count: 128,
  /** 0 = runs small, 0.5 = true to size, 1 = runs large */
  fit: 0.48,
};

export type Review = {
  id: string;
  name: string;
  date: string;
  stars: number;
  title: string;
  body: string;
  size: string;
};

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Maya K.",
    date: "12 Nov 2026",
    stars: 5,
    title: "My new daily trainer",
    body: "Ran 40 km in them this week. Comfortable straight out of the box, no hot spots, and the heel holds without rubbing. True to size for me in W 8.",
    size: "W 8",
  },
  {
    id: "r2",
    name: "Daniel R.",
    date: "4 Nov 2026",
    stars: 4,
    title: "Soft but still lively",
    body: "Softer than my last pair but still feels quick at tempo pace. Toe box is a touch narrower, so wide-footed runners might want to try them on first.",
    size: "M 10",
  },
  {
    id: "r3",
    name: "Priya S.",
    date: "29 Oct 2026",
    stars: 5,
    title: "Great for long runs",
    body: "Did a 28 km long run with no foot fatigue at all. Grip on wet pavement was solid.",
    size: "W 9",
  },
  {
    id: "r4",
    name: "Tom H.",
    date: "21 Oct 2026",
    stars: 4,
    title: "Reliable",
    body: "Exactly what I want from a workhorse shoe. Laces are a bit long.",
    size: "M 11",
  },
  {
    id: "r5",
    name: "Ana L.",
    date: "15 Oct 2026",
    stars: 5,
    title: "Fits like my old pair",
    body: "Same size as my previous pair and the fit is spot on.",
    size: "W 7.5",
  },
];
