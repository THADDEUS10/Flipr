// The credit in the footer. To link a profile, paste its full LinkedIn address into `linkedin`.
// To use a real photo instead of the drawn avatar, put the image in the `public/team` folder
// and set `photo`, for example "/team/jude.jpg".

export interface Member {
  id: string;
  name: string;
  role: "Designed by" | "Built by";
  linkedin: string;
  photo?: string;
  art: "a" | "b";
}

export const TEAM: Member[] = [
  { id: "basheer", name: "Basheer", role: "Designed by", linkedin: "https://www.linkedin.com/in/opeyemi-abdulkareem-a7067b89/", art: "b" },
  { id: "jude", name: "Jude", role: "Built by", linkedin: "https://www.linkedin.com/in/jude-stephen-46267b2b4", art: "a" }
];

/** Only real LinkedIn addresses become links */
export function safeLinkedIn(url: string): string | null {
  return /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(url.trim()) ? url.trim() : null;
}
