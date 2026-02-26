import type { Metadata } from "next";
import "./globals.css";
import { Saira } from "next/font/google";
import { Providers } from "./providers";
import Script from "next/script";

const saira = Saira({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-saira",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Collect Feedback That Matters Instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${saira.className} antialiased`}>
        <Providers>{children}</Providers>
        <Script
          src="https://orqent-ai.vercel.app/widget/ad31178b-06ef-4d23-857a-90408858050f.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
