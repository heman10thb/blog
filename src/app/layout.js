import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: {
    default: "Letuscrack - Master Coding Interview Problems",
    template: "%s | Letuscrack",
  },
  description: "Learn to solve coding problems with clear explanations and solutions in Python, Java, C++, and JavaScript. Perfect for interview preparation.",
  keywords: ["coding tutorials", "algorithm problems", "data structures", "interview prep", "leetcode", "programming"],
  authors: [{ name: "Letuscrack" }],
  creator: "Letuscrack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://letuscrack.com",
    siteName: "Letuscrack",
    title: "Letuscrack - Master Coding Interview Problems",
    description: "Learn to solve coding problems with clear explanations and solutions in multiple programming languages.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Letuscrack - Master Coding Interview Problems",
    description: "Learn to solve coding problems with clear explanations and solutions in multiple programming languages.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
