import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
const AdminViewIndicator = dynamic(
  () => import("@/components/AdminViewIndicator"),
  { ssr: false },
);

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} disable-theme-transition`}
    >
      <body className={inter.className}>
        {/* Inline pre-hydration script: copy transient admin token from URL to sessionStorage and show a minimal banner immediately when ?admin_view=1 is present */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function(){
            try{
              var url = new URL(window.location.href);
              var t = url.searchParams.get('admin_token');
              if (t) {
                try { sessionStorage.setItem('admin_token', t); sessionStorage.setItem('admin_login_ts', String(Date.now())); } catch(e) {}
                url.searchParams.delete('admin_token');
                try { history.replaceState({}, document.title, url.pathname + url.search + url.hash); } catch(e) {}
              }

              if (url.searchParams.get('admin_view')) {
                try { sessionStorage.setItem('admin_view', JSON.stringify({ path: window.location.pathname, ts: Date.now() })); } catch(e) {}

                // Do not insert an inline top banner — UI is rendered by the client-only AdminViewIndicator component (bottom-right pill only).
                // Ensure any previous dismissed flag is cleared so the bottom-right UI shows appropriately.
                try { sessionStorage.removeItem('admin_view_banner_dismissed'); } catch(e) {}

                // Listen for admin_view cleared in other tabs and clear dismissed flag
                window.addEventListener('storage', function(e){
                  if (e.key === 'admin_view' && !sessionStorage.getItem('admin_view')){
                    try { sessionStorage.removeItem('admin_view_banner_dismissed'); } catch(e){}
                  }
                });
              }
            } catch (e) { /* ignore */ }
          })();

          // diagnostics: monitor stylesheets and report potential load failures
          try {
            var links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(function(l){
              try { l.addEventListener('error', function(){ console.warn('Stylesheet failed to load:', l.href); }); } catch(e) {}
            });
            var totalSheets = links.length + document.querySelectorAll('style').length;
            try { console.debug('inline admin: stylesheet count', totalSheets); } catch(e) {}
            setTimeout(function(){
              try {
                var computed = window.getComputedStyle(document.body);
                if (totalSheets === 0 || !computed || !computed.fontFamily) {
                  console.warn('Possible CSS load issue: stylesheet count', totalSheets, 'computed body font', computed && computed.fontFamily);
                }
              } catch (e) {}
            }, 2000);
          } catch (e) {}
        `,
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-0 lg:ml-[28rem] pt-[65px] lg:pt-0 text-[18px]">
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
