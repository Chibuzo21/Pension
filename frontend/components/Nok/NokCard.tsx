"use client";

import { useState } from "react";
import RemoveConfirmInline from "./RemoveConfirmInline";

type Nok = {
  _id: string;
  fullName: string;
  relationship: string;
  phone: string;
  nationalId?: string;
  isVerified?: boolean;
  addedAt: number;
};

type Props = {
  nok: Nok;
  onEdit: (nok: Nok) => void;
  onRemove: (id: string) => Promise<void>;
  onVerifyToggle: (nok: Nok) => Promise<void>;
};

export default function NokCard({
  nok,
  onEdit,
  onRemove,
  onVerifyToggle,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  const initials = nok.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <div className='card'>
      <div className='ch' style={{ alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={avatarStyle}>{initials}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{nok.fullName}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {nok.relationship}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <button
            className={`btn-sm ${nok.isVerified ? "bgreen" : "boutline"}`}
            style={{ fontSize: 9.5 }}
            onClick={() => onVerifyToggle(nok)}
            title={
              nok.isVerified ? "Click to mark unverified" : "Click to verify"
            }>
            {nok.isVerified ? "✓ Verified" : "Unverified"}
          </button>
          <button
            className='btn-sm boutline'
            style={{ fontSize: 9.5 }}
            onClick={() => onEdit(nok)}>
            Edit
          </button>
          <button
            className='btn-sm'
            style={{
              fontSize: 9.5,
              background: "var(--red)",
              color: "#fff",
              border: "none",
            }}
            onClick={() => setConfirming(true)}>
            Remove
          </button>
        </div>
      </div>

      <div
        className='cb'
        style={{ paddingTop: 8, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Field label='Phone' value={nok.phone} />
        {nok.nationalId && <Field label='National ID' value={nok.nationalId} />}
        <Field
          label='Added'
          value={new Date(nok.addedAt).toLocaleDateString("en-GB")}
        />
      </div>

      {confirming && (
        <RemoveConfirmInline
          name={nok.fullName}
          onCancel={() => setConfirming(false)}
          onConfirm={async () => {
            await onRemove(nok._id);
            setConfirming(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const avatarStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "var(--g1)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 13,
  flexShrink: 0,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
