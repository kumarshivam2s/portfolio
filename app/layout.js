import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
const AdminViewIndicator = dynamic(() => import("@/components/AdminViewIndicator"), { ssr: false });

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "Portfolio | Kumar Shivam",
  description: "A beautiful, minimalist Shivam's portfolio website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} disable-theme-transition`}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-0 lg:ml-96 pt-[65px] lg:pt-0">
              {children}
            </main>
            {/* Show an admin view indicator overlay when admin_view is set in sessionStorage */}
            <AdminViewIndicator />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
