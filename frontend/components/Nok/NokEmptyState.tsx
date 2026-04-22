export default function NokEmptyState() {
  return (
    <div className='card' style={{ textAlign: "center", padding: "32px 20px" }}>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
        No next of kin enrolled yet.
      </p>
      <p style={{ fontSize: 11, color: "var(--muted)" }}>
        It is strongly recommended to enrol at least one next of kin during
        registration so that death claims can be processed smoothly.
      </p>
    </div>
  );
}
