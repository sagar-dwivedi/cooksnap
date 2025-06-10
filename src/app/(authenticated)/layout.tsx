import { DesktopNavigation } from "@/components/navigations/DesktopNavigation";
import { MobileNavigation } from "@/components/navigations/MobileNavigation";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r">
        <DesktopNavigation />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 px-4 py-6 max-w-4xl w-full mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
        <MobileNavigation />
      </footer>
    </div>
  );
}
