import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "فارسی ماتریکس | سامانه هوشمند یادگیری و مرور لغات انگلیسی",
  description: "وب‌اپلیکیشن جامع یادگیری و حفظ لغات انگلیسی به فارسی با سیستم جعبه لایتنر، آزمون‌های تعاملی و دسته‌بندی‌های تخصصی",
  keywords: ["دیکشنری", "فلش کارت", "لایتنر", "انگلیسی به فارسی", "یادگیری زبان", "FarsiMatrix"],
};

export const viewport: Viewport = {
  themeColor: "#006874",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
