const Pointer = () => (
  <svg className="hiw-pointer" width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M5 3l14 8-6 1.8L10.5 19z" fill="#e6208c" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
);

const STEPS = [
  { n: 1, tone: "teal", title: "Choose Category", text: "Select the type of conversion you need: currency, length, weight, temperature, time, volume and more, plus QR codes, file tools and translation." },
  { n: 2, tone: "blue", title: "Enter Value", text: "Type the value you want to convert in the input field. The conversion happens automatically as you type." },
  { n: 3, tone: "green", title: "Select Units", text: "Choose your source and target units from the dropdown menus. Use the swap button to quickly exchange units." },
  { n: 4, tone: "amber", title: "Get Results", text: "Download and view your converted result instantly with detailed information displayed in an easy-to-read format." }
];

function Mock({ n }: { n: number }) {
  if (n === 1) return (<div className="hiw-mock"><div className="hiw-row">Currency <b>▾</b></div><div className="hiw-row soft">Temperature</div><div className="hiw-row soft">Weight</div><Pointer /></div>);
  if (n === 2) return (<div className="hiw-mock"><div className="hiw-row"><span className="hiw-tag">123</span> 100</div><div className="hiw-row soft">Converted amount</div><Pointer /></div>);
  if (n === 3) return (<div className="hiw-mock"><div className="hiw-row">USD <b>▾</b></div><div className="hiw-row soft">EUR</div><div className="hiw-row soft">GBP</div><Pointer /></div>);
  return (<div className="hiw-mock"><div className="hiw-row">$ 100 → € 92.30</div><div className="hiw-btn">Download Result</div><Pointer /></div>);
}

/** "How it works" section from the Figma landing page. */
export function HowItWorks() {
  const start = () => {
    document.getElementById("converter")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <section className="hiw" id="how-it-works" aria-labelledby="hiw-title">
      <h2 id="hiw-title">How it works</h2>
      <p className="hiw-sub">From choosing your conversion type to downloading your result, it only takes four easy steps.</p>
      <div className="hiw-grid">
        {STEPS.map((s) => (
          <div key={s.n} className={`hiw-card ${s.tone}`}>
            <div className="hiw-head"><span className="hiw-num">{s.n}</span><h3>{s.title}</h3></div>
            <p>{s.text}</p>
            <Mock n={s.n} />
          </div>
        ))}
      </div>
      <p className="hiw-cta-text">Now that you know how it works, embark on your conversion journey with ease.</p>
      <button type="button" className="btn btn-soft hiw-cta" onClick={start}>Start Conversion</button>
    </section>
  );
}
