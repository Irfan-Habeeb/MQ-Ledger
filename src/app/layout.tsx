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
  icons: {
    icon: [
      { url: "https://i.ibb.co/R8QgThn/favicon-16-16.png", sizes: "16x16", type: "image/png" },
      { url: "https://i.ibb.co/nqF70550/favicon-32-32.png", sizes: "32x32", type: "image/png" },
      { url: "https://i.ibb.co/ksyVpncJ/favicon-48-48.png", sizes: "48x48", type: "image/png" },
      { url: "https://i.ibb.co/60Y3rhvp/favicon-96-96.png", sizes: "96x96", type: "image/png" },
      { url: "https://res.cloudinary.com/dpkfkedoc/image/upload/v1752007322/favicon_eoknod.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "https://i.ibb.co/8FGTCXq/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "https://i.ibb.co/p6yYx2wZ/icon-192-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Browser Favicons */}
        <link rel="icon" type="image/png" sizes="16x16" href="https://i.ibb.co/R8QgThn/favicon-16-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://i.ibb.co/nqF70550/favicon-32-32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="https://i.ibb.co/ksyVpncJ/favicon-48-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="https://i.ibb.co/60Y3rhvp/favicon-96-96.png" />
        
        <link rel="icon" type="image/svg+xml" href="https://res.cloudinary.com/dpkfkedoc/image/upload/v1752007322/favicon_eoknod.svg" />
        
        {/* Apple Touch Icon (for iOS Home Screen) */}
        <link rel="apple-touch-icon" sizes="180x180" href="https://i.ibb.co/8FGTCXq/apple-touch-icon.png" />
        
        {/* Android Icon (for Chrome on Android / PWA) */}
        <link rel="icon" type="image/png" sizes="192x192" href="https://i.ibb.co/p6yYx2wZ/icon-192-192.png" />
      </head>
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
