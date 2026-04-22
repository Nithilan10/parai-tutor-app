import { Geist, Geist_Mono, Mukta_Malar, Space_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  weight: ["400", "700", "800"],
  subsets: ["latin", "tamil"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Parai Tutor – Learn the Art of Parai Drumming",
    template: "%s | Parai Tutor",
  },
  description:
    "Preserving culture through rhythm. Learn and train Parai drumming from anywhere with guided tutorials and ML feedback.",
  openGraph: {
    title: "Parai Tutor – Learn the Art of Parai Drumming",
    description:
      "Preserving culture through rhythm. Learn and train Parai drumming from anywhere with guided tutorials and ML feedback.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${muktaMalar.variable} ${spaceMono.variable} font-sans antialiased min-h-screen bg-transparent text-slate-900 dark:text-slate-100`}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
