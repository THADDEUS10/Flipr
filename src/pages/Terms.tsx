import { LegalPage, type LegalSection } from "../components/LegalPage";
import { CONTACT_EMAIL, SITE } from "../lib/legal";

const sections: LegalSection[] = [
  {
    heading: "Accepting these terms",
    paragraphs: [`By using FLIPR at ${SITE}, you agree to these Terms and to our Privacy Policy. If you do not agree, please do not use the app.`]
  },
  {
    heading: "What FLIPR does",
    paragraphs: ["FLIPR gives you conversion tools: currency and unit conversion, file compression and conversion, QR codes, and text translation. Most tools run on your own device."]
  },
  {
    heading: "Accounts and guests",
    bullets: [
      "You can use the converter as a guest. Guests cannot download results or save history.",
      "To download results and keep a history, you need an account. Give us correct information and keep your password private. You are responsible for what happens under your account.",
      "Tell us if you think someone else has accessed your account."
    ]
  },
  {
    heading: "Using FLIPR properly",
    paragraphs: ["Please do not:"],
    bullets: [
      "use FLIPR for anything unlawful, or to harm others;",
      "try to break, overload, scrape or get around the security of the app or its services;",
      "copy, resell or reverse engineer FLIPR in a way the law does not allow; or",
      "upload or process files you have no right to use."
    ]
  },
  {
    heading: "Accuracy of results",
    bullets: [
      "Currency rates come from a third-party service and are only a guide. They may be out of date and are not the rate a bank or exchange will give you.",
      "Translations are produced by machine and can contain mistakes. Do not rely on them for legal, medical or other important decisions.",
      "FLIPR is not financial, legal or professional advice. Please check important results yourself before you act on them. Downloaded PDFs are for information only."
    ]
  },
  {
    heading: "Your files and content",
    paragraphs: ["You keep ownership of your files and anything you type into FLIPR. Your files are processed on your device and are not uploaded to us. You are responsible for having the right to use them."]
  },
  {
    heading: "Free service and future paid plans",
    paragraphs: ["FLIPR is free to use at the moment. We may add paid plans or features later. If we do, we will tell you clearly before you are charged anything, and these Terms will be updated."]
  },
  {
    heading: "Ownership",
    paragraphs: ["The FLIPR name, logo, design and code belong to their creators. You may use the app, but you may not copy its brand or design. The app uses open-source software, which stays under its own licences."]
  },
  {
    heading: "Third-party services",
    paragraphs: ["FLIPR depends on outside services for hosting, accounts, exchange rates and translation. If one of them is slow, wrong or unavailable, parts of FLIPR may not work. We are not responsible for those services."]
  },
  {
    heading: "Availability and changes",
    paragraphs: ["We try to keep FLIPR running, but we cannot promise it will always be available or free of errors. We may change, pause or stop any part of it at any time."]
  },
  {
    heading: "No warranty and limit of liability",
    paragraphs: [
      "FLIPR is provided \"as is\" and \"as available\", without promises that it is accurate, complete or error-free.",
      "To the fullest extent the law allows, we are not responsible for any loss or damage that comes from using FLIPR or relying on its results, including financial loss. Nothing in these Terms limits any right you have under Nigerian law that cannot be limited."
    ]
  },
  {
    heading: "Suspending accounts",
    paragraphs: ["We may suspend or close an account that breaks these Terms or harms the app or other people. You can also stop using FLIPR and ask us to delete your account at any time."]
  },
  {
    heading: "Governing law",
    paragraphs: ["These Terms are governed by the laws of the Federal Republic of Nigeria."]
  },
  {
    heading: "Changes to these terms",
    paragraphs: ["We may update these Terms. When we do, we will change the date at the top of this page. If you keep using FLIPR after a change, you accept the new Terms."]
  },
  {
    heading: "Contact us",
    paragraphs: [`Questions about these Terms: ${CONTACT_EMAIL}.`]
  }
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={["These Terms explain the rules for using FLIPR. Please read them."]}
      sections={sections}
    />
  );
}
