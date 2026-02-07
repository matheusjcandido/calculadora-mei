import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calculadora MEI 2025 - Simule seus impostos | Grátis",
  description: "Calcule o DAS do MEI, descubra se vale a pena abrir um CNPJ e compare com outros regimes tributários. Simulador gratuito e atualizado para 2025.",
  keywords: "calculadora mei, simulador mei, das mei 2025, quanto paga mei, vale a pena ser mei, mei impostos, cnpj mei",
  openGraph: {
    title: "Calculadora MEI 2025 - Simule seus impostos",
    description: "Descubra se vale a pena ser MEI e quanto você vai pagar de imposto. Simulador gratuito!",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
