// app/fonts.ts
import { Tajawal } from "next/font/google";

export const arabicFont = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "700"], // حسب الحاجة
  display: "swap",
});
