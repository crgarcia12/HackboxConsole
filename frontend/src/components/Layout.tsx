import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        MicroHacks &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
