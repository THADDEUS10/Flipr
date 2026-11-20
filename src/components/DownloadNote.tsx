import { usePremium } from "../context/PremiumContext";

/** Small line under the download button: how many free downloads are left. Shows nothing while premium is switched off. */
export function DownloadNote() {
  const { enabled, ready, premium, used, limit } = usePremium();
  if (!enabled || !ready) return null;
  const left = Math.max(limit - used, 0);
  const text = premium ? "Unlimited downloads are active."
    : used === 0 ? `You have ${limit} free downloads remaining.`
    : left > 0 ? `${left} of ${limit} free downloads left`
    : "You’ve used all your free downloads.";
  return <span>{text}</span>;
}
