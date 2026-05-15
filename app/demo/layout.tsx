import { DM_Sans, Space_Mono } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${dmSans.variable} ${spaceMono.variable}`}>
      {children}
    </div>
  );
}
