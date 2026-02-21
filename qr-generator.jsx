import { useState, useEffect, useRef } from "react";

const QRJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

function useQRLib() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.QRCode);
  useEffect(() => {
    if (window.QRCode) { setReady(true); return; }
    const s = document.createElement("script");
    s.src = QRJS_URL;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

const TABS = ["URL", "Text", "Contact"];

export default function QRGenerator() {
  const qrReady = useQRLib();
  const [tab, setTab] = useState("URL");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", org: "" });
  const [generated, setGenerated] = useState(false);
  const [qrContent, setQrContent] = useState("");
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef(null);

  const getContent = () => {
    if (tab === "URL") {
      let u = url.trim();
      if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
      return u;
    }
    if (tab === "Text") return text.trim();
    if (tab === "Contact") {
      const { name, phone, email, org } = contact;
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }
    return "";
  };

  const isValid = () => getContent().length > 0;

  useEffect(() => {
    if (!generated || !qrReady || !qrContainerRef.current || !qrContent) return;
    qrContainerRef.current.innerHTML = "";
    new window.QRCode(qrContainerRef.current, {
      text: qrContent,
      width: 240,
      height: 240,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
  }, [generated, qrContent, qrReady]);

  const handleGenerate = () => {
    const content = getContent();
    if (!content || !qrReady) return;
    setQrContent(content);
    setGenerated(true);
  };

  const getCanvas = () => qrContainerRef.current?.querySelector("canvas");

  const handleDownload = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const pad = 20;
    const out = document.createElement("canvas");
    out.width = canvas.width + pad * 2;
    out.height = canvas.height + pad * 2;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, pad, pad);
    const a = document.createElement("a");
    a.download = "qrcode.png";
    a.href = out.toDataURL("image/png");
    a.click();
  };

  const handleCopy = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        } catch {
          await navigator.clipboard.writeText(qrContent);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      await navigator.clipboard.writeText(qrContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetGenerated = () => setGenerated(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .root{
          min-height:100vh;
          background:radial-gradient(ellipse at 30% 20%,#1a0f3a 0%,#08080f 60%);
          display:flex;align-items:center;justify-content:center;
          font-family:'DM Mono',monospace;padding:24px 16px;
        }
        .card{
          background:linear-gradient(160deg,#111120 0%,#0c0c1a 100%);
          border:1px solid #252540;border-radius:24px;
          padding:40px 36px;width:100%;max-width:480px;
          box-shadow:0 0 100px rgba(120,80,255,0.07),0 32px 64px rgba(0,0,0,0.7);
        }
        .header{text-align:center;margin-bottom:32px;}
        .logo{font-size:28px;display:block;margin-bottom:10px;}
        h1{
          font-family:'Playfair Display',serif;font-style:italic;
          font-size:34px;color:#ece8ff;letter-spacing:0.02em;margin-bottom:6px;
        }
        .subtitle{color:#44425a;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;}
        .tabs{
          display:flex;gap:6px;background:#07070e;border:1px solid #1c1c30;
          border-radius:14px;padding:5px;margin-bottom:28px;
        }
        .tab{
          flex:1;padding:10px 6px;border:none;border-radius:10px;
          background:transparent;color:#44425a;cursor:pointer;
          font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.06em;
          transition:all 0.2s;
        }
        .tab:hover{color:#9090c0;}
        .tab.active{
          background:linear-gradient(135deg,#3a25a0,#6040ff);
          color:#ece8ff;box-shadow:0 2px 16px rgba(96,64,255,0.35);
        }
        .field{display:flex;flex-direction:column;gap:7px;margin-bottom:16px;}
        .field:last-child{margin-bottom:0;}
        label{color:#5a5880;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;}
        input,textarea{
          background:#07070e;border:1px solid #1e1e34;border-radius:11px;
          padding:13px 15px;color:#ccc8f0;font-size:14px;
          font-family:'DM Mono',monospace;outline:none;width:100%;
          transition:border-color 0.2s;
        }
        input:focus,textarea:focus{border-color:#5040c0;}
        textarea{min-height:100px;resize:vertical;}
        .hint{color:#2e2c48;font-size:10px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .gen-btn{
          width:100%;padding:15px;
          background:linear-gradient(135deg,#3a25a0 0%,#6040ff 100%);
          border:none;border-radius:13px;color:#ece8ff;
          font-size:14px;font-family:'DM Mono',monospace;letter-spacing:0.1em;
          cursor:pointer;box-shadow:0 4px 28px rgba(96,64,255,0.3);
          transition:transform 0.1s,opacity 0.2s;margin-top:8px;
        }
        .gen-btn:hover{opacity:0.9;}
        .gen-btn:active{transform:scale(0.98);}
        .gen-btn:disabled{opacity:0.35;cursor:not-allowed;}
        .qr-section{
          margin-top:32px;display:flex;flex-direction:column;
          align-items:center;gap:20px;
          animation:fadeUp 0.4s ease;
        }
        @keyframes fadeUp{
          from{opacity:0;transform:translateY(12px);}
          to{opacity:1;transform:translateY(0);}
        }
        .qr-frame{
          padding:18px;background:#fff;border-radius:18px;
          box-shadow:0 0 50px rgba(96,64,255,0.2),0 12px 40px rgba(0,0,0,0.6);
        }
        .qr-frame canvas{display:block;border-radius:4px;}
        .actions{display:flex;gap:12px;width:100%;}
        .action-btn{
          flex:1;padding:13px;background:#0c0c1a;
          border:1px solid #252540;border-radius:11px;color:#9090c0;
          cursor:pointer;font-size:12px;font-family:'DM Mono',monospace;
          letter-spacing:0.07em;transition:all 0.2s;
        }
        .action-btn:hover{border-color:#5040c0;color:#ccc8f0;}
        .copy-btn{background:#080f08;border-color:#1a301a;color:#7ab87a;}
        .copy-btn:hover{border-color:#3a703a;color:#a0d8a0;}
        .preview{
          width:100%;background:#07070e;border:1px solid #1c1c30;
          border-radius:11px;padding:13px 15px;
          display:flex;flex-direction:column;gap:5px;
        }
        .preview-label{color:#2e2c48;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;}
        .preview-value{color:#5a5880;font-size:11px;word-break:break-all;line-height:1.6;}
      `}</style>
      <div className="root">
        <div className="card">
          <header className="header">
            <span className="logo">⬡</span>
            <h1>QR Forge</h1>
            <p className="subtitle">Encode anything · Scan everywhere</p>
          </header>

          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab${tab === t ? " active" : ""}`}
                onClick={() => { setTab(t); resetGenerated(); }}
              >
                {t === "URL" ? "🔗 URL" : t === "Text" ? "✏️ Text" : "👤 Contact"}
              </button>
            ))}
          </div>

          <div>
            {tab === "URL" && (
              <div className="field">
                <label>Website URL</label>
                <input
                  placeholder="example.com or https://..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); resetGenerated(); }}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <span className="hint">https:// is added automatically if omitted</span>
              </div>
            )}
            {tab === "Text" && (
              <div className="field">
                <label>Plain Text</label>
                <textarea
                  placeholder="Type any text or message..."
                  value={text}
                  onChange={(e) => { setText(e.target.value); resetGenerated(); }}
                />
              </div>
            )}
            {tab === "Contact" && (
              <div className="grid">
                {[
                  { key: "name", label: "Full Name", placeholder: "Jane Smith" },
                  { key: "org", label: "Organization", placeholder: "Acme Corp" },
                  { key: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
                  { key: "email", label: "Email", placeholder: "jane@example.com" },
                ].map(({ key, label, placeholder }) => (
                  <div className="field" key={key}>
                    <label>{label}</label>
                    <input
                      placeholder={placeholder}
                      value={contact[key]}
                      onChange={(e) => { setContact((c) => ({ ...c, [key]: e.target.value })); resetGenerated(); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="gen-btn"
            onClick={handleGenerate}
            disabled={!isValid() || !qrReady}
          >
            {!qrReady ? "Loading…" : "Generate QR Code →"}
          </button>

          {generated && qrContent && (
            <div className="qr-section">
              <div className="qr-frame">
                <div ref={qrContainerRef} />
              </div>
              <div className="actions">
                <button className="action-btn" onClick={handleDownload}>⬇ Download PNG</button>
                <button className="action-btn copy-btn" onClick={handleCopy}>
                  {copied ? "✓ Copied!" : "⎘ Copy Image"}
                </button>
              </div>
              <div className="preview">
                <span className="preview-label">Encoded content</span>
                <span className="preview-value">
                  {qrContent.length > 80 ? qrContent.slice(0, 80) + "…" : qrContent}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
