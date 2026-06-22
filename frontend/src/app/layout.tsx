import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Diep Trong Toan | Senior Digital Performance Manager",
  description: "Full Stack Digital Marketer specializing in full-funnel marketing strategies, paid media, and marketing automation.",
  keywords: ["Digital Marketing", "Performance Marketing", "SEO", "Next.js", "Strapi", "Le Diep Trong Toan"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
