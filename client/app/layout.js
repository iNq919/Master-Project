import { AuthProvider } from "./Providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Image Description",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn("antialiased")}>
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
