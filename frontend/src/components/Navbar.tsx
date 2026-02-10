import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logout as apiLogout } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Home,
  Trophy,
  BookOpen,
  KeyRound,
  Timer,
  Settings,
  LogOut,
  LogIn,
  Terminal,
} from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  }`;

export function Navbar() {
  const { isAuthenticated, username, role, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiLogout();
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
          <Terminal className="h-6 w-6 text-primary" />
          <span>MicroHacks</span>
        </NavLink>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} end>
            <Home className="h-4 w-4" /> Home
          </NavLink>

          {isAuthenticated && (role === "hacker" || role === "coach") && (
            <>
              <NavLink to="/challenges" className={navLinkClass}>
                <Trophy className="h-4 w-4" /> Challenges
              </NavLink>
              <NavLink to="/credentials" className={navLinkClass}>
                <KeyRound className="h-4 w-4" /> Credentials
              </NavLink>
              <NavLink to="/timer" className={navLinkClass}>
                <Timer className="h-4 w-4" /> Timer
              </NavLink>
            </>
          )}

          {isAuthenticated && role === "coach" && (
            <NavLink to="/solutions" className={navLinkClass}>
              <BookOpen className="h-4 w-4" /> Solutions
            </NavLink>
          )}

          {isAuthenticated && role === "techlead" && (
            <NavLink to="/techlead" className={navLinkClass}>
              <Settings className="h-4 w-4" /> Techlead
            </NavLink>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              <LogIn className="h-4 w-4" /> Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
