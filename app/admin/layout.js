import { Inter, Space_Grotesk } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "Admin | Portfolio",
};

export default function AdminLayout({ children }) {
  return (
    <div className={`${spaceGrotesk.variable} ${inter.className}`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen p-8 lg:p-16 bg-gray-50 dark:bg-gray-950">
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}
