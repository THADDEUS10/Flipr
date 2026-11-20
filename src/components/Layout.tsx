import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Avatar } from "./Avatar";
import { TEAM } from "../lib/team";
import { FlipLogo } from "./FlipLogo";
import { HistoryIcon, LogoutIcon, MoonIcon, SunIcon, UserIcon, ChevronDownIcon } from "./Icons";

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  if (!user) {
    return <Link to="/signin" className="pill-btn"><UserIcon /> Login</Link>;
  }
  return (
    <div className="menu-wrap" ref={ref}>
      <button className="pill-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <UserIcon /> {user.name.split(" ")[0]} <ChevronDownIcon />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-user"><strong>{user.name}</strong><span>{user.email}</span></div>
          <button className="menu-item" role="menuitem" onClick={() => { setOpen(false); navigate("/history"); }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}><HistoryIcon /> History</span>
          </button>
          <button className="menu-item danger" role="menuitem" onClick={async () => { await signOut(); setOpen(false); navigate("/"); }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}><LogoutIcon /> Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function BgLines() {
  return (
    <div className="bg-lines" aria-hidden>
      {Array.from({ length: 60 }, (_, i) => <span key={i} style={{ ["--i" as string]: i } as CSSProperties} />)}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [rolled, setRolled] = useState(false);
  return (
    <div className="shell">
      <BgLines />
      <header className="header">
        <Link to="/" className="logo" aria-label="Flip home"><FlipLogo height={36} /></Link>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => { setRolled(true); toggle(); }} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <span className={`theme-roll ${theme}${rolled ? " animate" : ""}`} aria-hidden>
              <span className="roll-moon"><MoonIcon /></span>
              <span className="roll-sun"><SunIcon /></span>
            </span>
          </button>
          <UserMenu />
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <span className="rights">All rights reserved ©{new Date().getFullYear()} · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></span>
        <div className="credit">
          <span>{TEAM.map((m, i) => `${i > 0 ? " · " : ""}${m.role} ${m.name}`).join("")}</span>
          <div className="avatars">{TEAM.map((m) => <Avatar key={m.id} member={m} />)}</div>
        </div>
      </footer>
    </div>
  );
}
