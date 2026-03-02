import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Parai Tutor – Learn the Art of Parai Drumming",
  description: "Preserving culture through rhythm. Learn and train Parai drumming from anywhere with guided tutorials and ML feedback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark:bg-gray-900 dark:text-gray-100">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
