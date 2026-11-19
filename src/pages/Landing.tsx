import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { HistoryEntry } from "../lib/history";
import { CATEGORIES, getCategory } from "../lib/converters";
import { Dropdown } from "../components/Dropdown";
import { CategoryIcon } from "../components/CategoryIcon";
import { Modal } from "../components/Modal";
import { ConvertPanel } from "../components/ConvertPanel";
import { QrPanel } from "../components/QrPanel";
import { CompressPanel } from "../components/CompressPanel";
import { FileConvertPanel } from "../components/FileConvertPanel";
import { TranslatePanel } from "../components/TranslatePanel";
import { DownloadIcon } from "../components/Icons";

export default function Landing() {
  const location = useLocation();
  const apply = (location.state as { apply?: HistoryEntry } | null)?.apply;
  const [categoryId, setCategoryId] = useState(apply?.categoryId ?? "currency");
  const [showModal, setShowModal] = useState(false);
  const category = getCategory(categoryId);
  const needLogin = () => setShowModal(true);

  return (
    <>
      <h1 className="hero-title"><span className="soft">Convert</span> Anything.<br /><span className="soft">Understand</span> Everything.</h1>
      <p className="hero-sub">
        From currencies to files, units to formats — get instant, accurate conversions in one place.
        Download results with step-by-step explanations you can trust.
      </p>

      <section className="card" aria-label="Converter">
        <div className="field-block">
          <span className="field-label type-label">Select Conversion</span>
          <Dropdown options={[...CATEGORIES].sort((a, b) => a.label.localeCompare(b.label)).map((c) => ({ id: c.id, label: c.label, icon: <CategoryIcon id={c.icon} /> }))} value={categoryId} onChange={setCategoryId} />
        </div>

        {category.kind === "qr" ? (
          <QrPanel onNeedLogin={needLogin} />
        ) : category.kind === "compression" ? (
          <CompressPanel onNeedLogin={needLogin} />
        ) : category.kind === "conversion" ? (
          <FileConvertPanel onNeedLogin={needLogin} />
        ) : category.kind === "translation" ? (
          <TranslatePanel onNeedLogin={needLogin} />
        ) : (
          <ConvertPanel key={`${category.id}-${apply?.id ?? ""}`} category={category} onNeedLogin={needLogin}
            initial={apply && apply.categoryId === category.id ? { from: apply.from, to: apply.to, amount: apply.amount } : undefined} />
        )}
      </section>

      {showModal && (
        <Modal label="Access your downloads" onClose={() => setShowModal(false)}>
          <div className="modal-icon"><DownloadIcon /></div>
          <h2>Access Your Downloads</h2>
          <p>Login to continue or create a free account to start downloading your results.</p>
          <div className="modal-actions">
            <Link to="/signin" className="btn btn-soft" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>Login</Link>
            <Link to="/signup" className="btn btn-soft" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>Sign Up</Link>
          </div>
        </Modal>
      )}
    </>
  );
}
