import type { Metadata } from "next";
import { Figtree, Montserrat } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MENTORSCUE - Financial Dashboard",
  description: "Professional financial dashboard for tracking income, expenses, and savings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${montserrat.variable} antialiased`}
        style={{ 
          fontFamily: 'var(--font-figtree), system-ui, sans-serif',
          letterSpacing: '0.025em'
        }}
      >
        {children}
      </body>
    </html>
  );
}
