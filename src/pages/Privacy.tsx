import { LegalPage, type LegalSection } from "../components/LegalPage";
import { CONTACT_EMAIL, SITE } from "../lib/legal";

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `FLIPR is a free conversion app (currency, units, files, QR codes and translation) available at ${SITE}. It is designed by Basheer and built and operated by Jude Stephen in Nigeria. In this policy, "we", "us" and "our" mean the people behind FLIPR.`,
      `You can contact us about this policy or your data at ${CONTACT_EMAIL}.`
    ]
  },
  {
    heading: "What information we collect",
    paragraphs: ["We only collect what we need to run the app."],
    bullets: [
      "Account details: your name, email address and password, when you create an account. Your password is stored in scrambled (hashed) form by our sign-in provider, so we cannot read it.",
      "Conversion history: when you are signed in and tap Download Result, we save the type of conversion, the units, the amount, the result, whether you bookmarked it, and the date and time, so it appears in your History.",
      "Plan and payment records: if you buy a plan, we keep which plan you chose, when it ends, a payment reference, and how many free downloads you have used. You pay on Paystack's own page, so your card details never reach us.",
      "Technical data: like most websites, the companies that host and deliver FLIPR may see your IP address, browser type and the pages requested, in their server logs.",
      "Data kept on your device: your light or dark mode choice and your sign-in session are stored in your browser."
    ]
  },
  {
    heading: "What we do not collect",
    bullets: [
      "Your files. Compressing and converting files, and creating or scanning QR codes, all happen on your own device. Your files and camera images are not uploaded to us.",
      "Your voice. If you use the microphone in the Audio translation tab, your browser's own speech service turns your speech into text (in Chrome, this service is run by Google). FLIPR does not record, receive or store your voice.",
      "Advertising or tracking data. At the date above, FLIPR has no advertising and no analytics tools, and we do not sell your data.",
      "Guests. If you continue as a guest, we do not create an account or save any history for you."
    ]
  },
  {
    heading: "How we use your information",
    bullets: [
      "To create and secure your account and let you sign in, including sending you a code if you reset your password.",
      "To save and show your conversion history.",
      "To run, maintain and improve FLIPR, and to keep it safe from abuse."
    ],
    after: ["We use your information because you ask us to provide the service, because you agree to it when you sign up, and because we have a legitimate interest in keeping the app working and secure."]
  },
  {
    heading: "Other services that handle your data",
    paragraphs: ["FLIPR works with these outside services. They process some data on our behalf or when you use a feature, and each has its own privacy policy."],
    bullets: [
      "Supabase: stores accounts and conversion history, and sends account emails.",
      "Cloudflare: hosts and delivers the FLIPR website.",
      "ExchangeRate-API (open.er-api.com): supplies currency exchange rates. Your browser asks it for rates for a base currency, so it can see your IP address.",
      "MyMemory (translated.net): translates text. The text you type to translate, and the chosen languages, are sent to it.",
      "Your browser's speech service: only if you use the microphone. It receives your speech to turn it into text, under its own privacy policy.",
      "Paystack: processes payments if you buy a plan. It receives your email address and the payment details you enter on its page.",
      "Google Fonts: supplies the app's fonts, so your IP address is shared with Google when the fonts load."
    ],
    after: ["Please do not type passwords, bank details or other sensitive information into the translator."]
  },
  {
    heading: "Sharing your information",
    paragraphs: ["We do not sell your personal data. We share it only with the services listed above so the app can work, or when the law requires us to."]
  },
  {
    heading: "Transfers outside Nigeria",
    paragraphs: ["Our service providers may store or process data on servers outside Nigeria. When this happens, we rely on providers that apply appropriate data protection safeguards."]
  },
  {
    heading: "How long we keep your data",
    paragraphs: ["We keep your account and history until you delete them. You can delete individual history entries yourself in the History page at any time, and you can delete your whole account yourself: open the account menu and choose Delete account. This removes your account and your saved history straight away, except where the law requires us to keep something."]
  },
  {
    heading: "Your rights",
    paragraphs: ["Under the Nigeria Data Protection Act 2023, you have the right to:"],
    bullets: [
      "ask what personal data we hold about you and get a copy;",
      "ask us to correct data that is wrong or incomplete;",
      "ask us to delete your data;",
      "object to, or ask us to limit, certain uses of your data;",
      "withdraw your consent at any time, without affecting what we did before;",
      "ask for your data in a portable format; and",
      "complain to the Nigeria Data Protection Commission (NDPC) if you are not happy with how we handle your data."
    ],
    after: [`You can delete your account yourself from the account menu (Delete account). For any other request, email us at ${CONTACT_EMAIL} from the address you signed up with. We aim to reply within 30 days.`]
  },
  {
    heading: "Security",
    paragraphs: ["We use encrypted connections (HTTPS) and access rules that let each signed-in user read only their own history. No system is completely secure. If a data breach affects you, we will tell you and the NDPC where the law requires."]
  },
  {
    heading: "Children",
    paragraphs: ["FLIPR is not designed for children. If you are under 18, please use it with the permission of a parent or guardian. If you believe a child has created an account without permission, contact us and we will delete it."]
  },
  {
    heading: "Changes to this policy",
    paragraphs: ["We may update this policy as FLIPR grows, for example if we add paid plans. When we do, we will change the date at the top of this page. Please check it from time to time."]
  },
  {
    heading: "Contact us",
    paragraphs: [`Questions or requests about your data: ${CONTACT_EMAIL}.`]
  }
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={["This policy explains what information FLIPR collects, how we use it, and the choices you have. By using FLIPR you agree to it."]}
      sections={sections}
    />
  );
}
