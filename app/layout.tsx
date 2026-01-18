import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "@/app/globals.css";
import { ThemeProvider } from "@/providers/theme-provider"
import NextAuthProvider from "@/providers/next-auth";
import GlobalLoader from "@/store/loader/GlobalLoader";
import { LoaderContextProvider } from "@/store/loader/use-loader";
import { Viewport } from "next";


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Login",
  description: "Premium Black and White Login Page",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}


export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
      </head>
      <body className={`font-sans antialiased`}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LoaderContextProvider>
              <GlobalLoader loader="LoaderOne" />
              {children}
            </LoaderContextProvider>
          </ThemeProvider>
        </NextAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
