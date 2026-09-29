import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ResponsiveToaster } from "@/components/hrmis/responsive-toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://integratedemis.vercel.app"),
  title: "Integrated EMIS | Education Management Information System",
  description:
    "Integrated EMIS is an education management portal for schools, employees, attendance, reports, and school profile administration.",
  keywords: ["Integrated EMIS", "education management system", "school management", "school profile", "employee attendance", "student records"],
  authors: [{ name: "Integrated EMIS" }],
  applicationName: "Integrated EMIS",
  alternates: { canonical: "https://integratedemis.vercel.app/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    type: "website",
    url: "https://integratedemis.vercel.app/",
    siteName: "Integrated EMIS",
    title: "Integrated EMIS | Education Management Information System",
    description: "Education management portal for school profiles, employees, attendance, and reports.",
    images: [{ url: "/hrmis/app-icon-192.png", width: 192, height: 192, alt: "Integrated EMIS" }],
  },
  twitter: { card: "summary", title: "Integrated EMIS", description: "Education management portal for schools and education teams." },
  appleWebApp: {
    capable: true,
    title: "Integrated EMIS",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/favicon.ico",
    apple: "/hrmis/app-icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `viewport-fit=cover` lets the header/footer extend under notches and
  // rounded corners; safe-area insets are applied via CSS.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1565c0" },
    { media: "(prefers-color-scheme: dark)", color: "#1565c0" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <noscript>
          <main>
            <h1>Integrated EMIS</h1>
            <p>Education management portal for school profiles, employees, attendance, students, reports, and school administration.</p>
            <p>JavaScript is required to use the secure portal. Return to this page with JavaScript enabled to sign in.</p>
          </main>
        </noscript>
        {children}
        <ResponsiveToaster />
      </body>
    </html>
  );
}
