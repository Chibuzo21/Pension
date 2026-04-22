import Link from "next/link";

export interface DeceasedPensioner {
  _id: string;
  fullName: string;
  pensionId: string;
  dateOfDeath?: string;
  deathConfirmedAt?: number;
}

interface DeceasedCardProps {
  pensioner: DeceasedPensioner;
}

export function DeceasedCard({ pensioner }: DeceasedCardProps) {
  const { _id, fullName, pensionId, dateOfDeath, deathConfirmedAt } = pensioner;

  return (
    <div className='card'>
      <div className='ch'>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{fullName}</div>
          <code style={{ fontSize: 10, color: "var(--muted)" }}>
            {pensionId}
          </code>
        </div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            background: "#FEE2E2",
            color: "#991B1B",
          }}>
          DECEASED
        </span>
      </div>

      <div
        className='cb'
        style={{ paddingTop: 6, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
            }}>
            Date of death
          </div>
          <div style={{ fontSize: 12 }}>{dateOfDeath ?? "Not recorded"}</div>
        </div>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
            }}>
            Confirmed
          </div>
          <div style={{ fontSize: 12 }}>
            {deathConfirmedAt
              ? new Date(deathConfirmedAt).toLocaleDateString("en-GB")
              : "—"}
          </div>
        </div>
        <Link
          href={`/dashboard/admin/pensioners/${_id}`}
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "var(--g1)",
            fontWeight: 600,
            alignSelf: "center",
          }}>
          View Record →
        </Link>
      </div>
    </div>
  );
}
