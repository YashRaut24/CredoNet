import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import "./QRCodeModal.css";

export function QRCodeModal({ url, title, description, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qr-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h3 className="qr-title">{title || "Verifiable QR Passport"}</h3>
        <p className="qr-description">{description || "Scan with any smartphone camera to inspect mathematical validity on Monad."}</p>

        <div className="qr-box-wrap">
          <QRCodeSVG
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0d0b09"
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="qr-actions">
          <button onClick={copyUrl} className="btn-secondary" style={{ flex: 1 }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Copied Link" : "Copy Link"}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ flex: 1 }}
          >
            <ExternalLink size={14} />
            <span>Open Link</span>
          </a>
        </div>
      </div>
    </div>
  );
}
