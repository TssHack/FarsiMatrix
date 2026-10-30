import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import { RippleProvider } from "@/components/m3/RippleProvider";
import { SnackbarProvider } from "@/components/m3/Snackbar";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "فارسی ماتریکس | یادگیری هوشمند لغات تخصصی انگلیسی",
  description:
    "یادگیری و مرور هوشمند لغات تخصصی انگلیسی به فارسی با جعبه لایتنر، آزمون تعاملی، تلفظ صوتی و طراحی متریال ۳ — کاملاً آفلاین و رایگان",
  keywords: ["دیکشنری", "فلش کارت", "لایتنر", "انگلیسی به فارسی", "یادگیری زبان", "FarsiMatrix", "احسان فضلی"],
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "فارسی ماتریکس",
  },
  authors: [{ name: "Ehsan Fazli", url: "https://ehsanfazli.ir" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4fbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1514" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans">
        <PWARegister />
        <RippleProvider />
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  );
}
