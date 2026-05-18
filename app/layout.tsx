import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// 1. Impor NotificationProvider dari folder context yang Anda buat
import { NotificationProvider } from "@/context/NotificationContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aksara Bimbel",
  description: "Website Aksara Bimbel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {/* 2. Bungkus {children} dengan NotificationProvider */}
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
