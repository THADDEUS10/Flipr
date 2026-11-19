import { useState, type ReactNode } from "react";
import { AlertIcon, EyeIcon, EyeOffIcon } from "./Icons";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: ReactNode;
  type?: "text" | "email" | "password";
  placeholder?: string;
  error?: string | null;
  autoComplete?: string;
  name?: string;
}

export function TextField({ label, value, onChange, icon, type = "text", placeholder, error, autoComplete, name }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const id = `f-${name ?? label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="field-block">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className={`input-row${error ? " invalid" : ""}`}>
        <span className="leading">{icon}</span>
        <input
          id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)}
          type={isPassword && !show ? "password" : type === "email" ? "email" : "text"}
          placeholder={placeholder} autoComplete={autoComplete}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          spellCheck={false} autoCapitalize="none"
        />
        {isPassword && (
          <button type="button" className="trailing" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <div id={`${id}-err`} className="field-error" role="alert"><AlertIcon />{error}</div>}
    </div>
  );
}
