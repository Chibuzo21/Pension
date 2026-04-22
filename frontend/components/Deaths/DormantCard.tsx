import Link from "next/link";
import { DormantActionType } from "./DormantActionModel";

export interface DormantPensioner {
  _id: string;
  fullName: string;
  pensionId: string;
  missedVerificationCount?: number;
  lastVerifiedAt?: number;
  phone?: string;
}

interface DormantCardProps {
  pensioner: DormantPensioner;
  onAction: (
    pensionerId: string,
    pensionerName: string,
    action: DormantActionType,
  ) => void;
}

export function DormantCard({ pensioner, onAction }: DormantCardProps) {
  const {
    _id,
    fullName,
    pensionId,
    missedVerificationCount,
    lastVerifiedAt,
    phone,
  } = pensioner;

  return (
    <div className='card'>
      <div className='ch'>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{fullName}</div>
          <code style={{ fontSize: 10, color: "var(--g1)" }}>{pensionId}</code>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Link
            href={`/dashboard/admin/pensioners/${_id}`}
            style={{
              fontSize: 10,
              color: "var(--g1)",
              fontWeight: 600,
              padding: "4px 8px",
              border: "1px solid var(--mist)",
              borderRadius: 6,
            }}>
            Profile
          </Link>
          <button
            className='btn-sm bgreen'
            style={{ fontSize: 10 }}
            onClick={() => onAction(_id, fullName, "reinstate")}>
            Reinstate
          </button>
          <button
            className='btn-sm boutline'
            style={{ fontSize: 10 }}
            onClick={() => onAction(_id, fullName, "incapacitated")}>
            Incapacitated
          </button>
          <button
            className='btn-sm'
            style={{
              fontSize: 10,
              background: "var(--red)",
              color: "#fff",
              border: "none",
            }}
            onClick={() => onAction(_id, fullName, "deceased")}>
            Mark Deceased
          </button>
        </div>
      </div>

      <div
        className='cb'
        style={{ paddingTop: 6, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <StatCell
          label='Missed verifications'
          value={String(missedVerificationCount ?? 0)}
          valueColor='var(--red)'
        />
        <StatCell
          label='Last verified'
          value={
            lastVerifiedAt
              ? new Date(lastVerifiedAt).toLocaleDateString("en-GB")
              : "Never"
          }
        />
        <StatCell label='Phone' value={phone ?? "—"} />
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: "var(--muted)",
          textTransform: "uppercase",
        }}>
        {label}
      </div>
      <div
        style={{
          fontSize: valueColor ? 13 : 12,
          fontWeight: valueColor ? 700 : 400,
          color: valueColor,
        }}>
        {value}
      </div>
    </div>
  );
}
