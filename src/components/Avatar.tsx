import type { Member } from "../lib/team";
import { safeLinkedIn } from "../lib/team";

// Two drawn avatars in different styles (glasses and a blue top, cap and beard with a teal top).
function Art({ variant }: { variant: "a" | "b" }) {
  if (variant === "a") {
    return (
      <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
        <rect width="40" height="40" fill="#cfe0ff" />
        <path d="M5 40c1-9 7-13 15-13s14 4 15 13z" fill="#1e4fbc" />
        <rect x="17" y="21" width="6" height="7" rx="2" fill="#a86f4a" />
        <circle cx="20" cy="16" r="8" fill="#b9825b" />
        <path d="M11.5 15.5c0-6.5 4-9.5 8.5-9.5s8.5 3 8.5 9.5c-2-3.2-5-4.5-8.5-4.5s-6.5 1.3-8.5 4.500z" fill="#1b1b1b" />
        <circle cx="16.5" cy="16.5" r="2.6" fill="none" stroke="#1b1b1b" strokeWidth="1.2" />
        <circle cx="23.5" cy="16.5" r="2.6" fill="none" stroke="#1b1b1b" strokeWidth="1.2" />
        <path d="M19.1 16.400h1.8" stroke="#1b1b1b" strokeWidth="1.2" />
        <path d="M17.5 21.500q2.5 1.8 5 0" fill="none" stroke="#5a3520" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">
      <rect width="40" height="40" fill="#ffe3b8" />
      <path d="M5 40c1-9 7-13 15-13s14 4 15 13z" fill="#14b8a6" />
      <rect x="17" y="21" width="6" height="7" rx="2" fill="#6f4529" />
      <circle cx="20" cy="17" r="8" fill="#8a5a3c" />
      <path d="M12.5 20c0 5 3 8 7.5 8s7.5-3 7.5-8c-2 2.5-4.5 3.5-7.5 3.500S14.5 22.5 12.5 20z" fill="#1b1b1b" opacity=".88" />
      <path d="M11 14.500c0-5.5 4-8.5 9-8.500s9 3 9 8.500z" fill="#d97706" />
      <rect x="9" y="13.5" width="22" height="3" rx="1.5" fill="#b45309" />
      <circle cx="17" cy="18" r="1" fill="#1b1b1b" />
      <circle cx="23" cy="18" r="1" fill="#1b1b1b" />
    </svg>
  );
}

export function Avatar({ member }: { member: Member }) {
  const content = member.photo
    ? <img src={member.photo} alt="" width="100%" height="100%" style={{ objectFit: "cover" }} />
    : <Art variant={member.art} />;
  const href = safeLinkedIn(member.linkedin);
  const label = `${member.role} ${member.name}`;

  return href ? (
    <a className="avatar link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}, LinkedIn profile (opens in a new tab)`} title={`${label} on LinkedIn`}>{content}</a>
  ) : (
    <span className="avatar" role="img" aria-label={label} title={label}>{content}</span>
  );
}
