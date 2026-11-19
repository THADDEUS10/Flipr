import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true
};

export const MoonIcon = () => <svg {...base}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
export const SunIcon = () => <svg {...base}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
export const UserIcon = () => <svg {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
export const MailIcon = () => <svg {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
export const LockIcon = () => <svg {...base}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
export const EyeIcon = () => <svg {...base}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const EyeOffIcon = () => <svg {...base}><path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.1 6.1A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4-.8" /></svg>;
export const SwapIcon = () => <svg {...base}><path d="M7 4v14M7 18l-3-3M7 18l3-3M17 20V6M17 6l-3 3M17 6l3 3" /></svg>;
export const ChevronDownIcon = () => <svg {...base} width={16} height={16}><path d="m6 9 6 6 6-6" /></svg>;
export const CloseIcon = () => <svg {...base} width={16} height={16}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const AlertIcon = () => <svg {...base} width={14} height={14}><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.01" /></svg>;
export const DownloadIcon = () => <svg {...base} width={32} height={32}><path d="M12 3v12M7 11l5 5 5-5M5 21h14" /></svg>;
export const HistoryIcon = () => <svg {...base} width={16} height={16}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" /></svg>;
export const LogoutIcon = () => <svg {...base} width={16} height={16}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
export const SearchIcon = () => <svg {...base} width={16} height={16}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;

interface SizeProps { size?: number }
export const UploadIcon = ({ size = 16 }: SizeProps) => <svg {...base} width={size} height={size}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>;
export const FileIcon = ({ size = 24, color = "#dc3c3c" }: SizeProps & { color?: string }) => (
  <svg {...base} width={size} height={size} stroke={color}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" fill={color} fillOpacity=".15" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
);
export const CheckIcon = ({ size = 14 }: SizeProps) => <svg {...base} width={size} height={size} strokeWidth={3}><path d="m5 12 5 5 9-10" /></svg>;
export const CheckCircleIcon = ({ size = 36 }: SizeProps) => (
  <svg {...base} width={size} height={size} stroke="var(--success)"><circle cx="12" cy="12" r="10" fill="var(--success)" fillOpacity=".15" /><path d="m8 12.5 3 3 5-6" /></svg>
);
export const BookmarkIcon = ({ size = 16, filled = false }: SizeProps & { filled?: boolean }) => (
  <svg {...base} width={size} height={size} stroke={filled ? "var(--success)" : "currentColor"} fill={filled ? "var(--success)" : "none"} fillOpacity={filled ? 0.25 : undefined}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
);
export const TrashIcon = ({ size = 16 }: SizeProps) => <svg {...base} width={size} height={size} stroke="var(--error)"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
export const ClearIcon = ({ size = 16 }: SizeProps) => (
  <svg {...base} width={size} height={size} stroke="none" fill="currentColor"><circle cx="12" cy="12" r="10" opacity=".4" /><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth={2.2} fill="none" /></svg>
);
export const WarningFilledIcon = ({ size = 16 }: SizeProps) => (
  <svg {...base} width={size} height={size} stroke="none" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 7v6M12 16.5v.01" stroke="#fff" strokeWidth={2.4} fill="none" /></svg>
);
export const TriangleDownIcon = ({ size = 14 }: SizeProps) => <svg {...base} width={size} height={size} stroke="none" fill="currentColor"><path d="M7 10l5 6 5-6z" /></svg>;
export const ConvertGlyphIcon = ({ size = 18 }: SizeProps) => (
  <svg {...base} width={size} height={size} strokeWidth={2}>
    <path d="M2.5 8H8M5.8 5.5 8.3 8l-2.5 2.5" />
    <rect x="12" y="5" width="9" height="6" rx="1.5" fill="currentColor" stroke="none" />
    <rect x="3" y="13" width="9" height="6" rx="1.5" fill="currentColor" stroke="none" />
    <path d="M21.5 16H16M18.2 13.5 15.7 16l2.5 2.5" />
  </svg>
);
