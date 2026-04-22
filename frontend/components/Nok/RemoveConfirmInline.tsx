type Props = {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function RemoveConfirmInline({
  name,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      style={{
        margin: "0 14px 12px",
        background: "var(--smoke)",
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
      <p style={{ fontSize: 12, flex: 1 }}>
        Remove <strong>{name}</strong> as next of kin?
      </p>
      <button
        className='btn-sm boutline'
        style={{ fontSize: 9.5 }}
        onClick={onCancel}>
        Cancel
      </button>
      <button
        className='btn-sm'
        style={{
          fontSize: 9.5,
          background: "var(--red)",
          color: "#fff",
          border: "none",
        }}
        onClick={onConfirm}>
        Yes, Remove
      </button>
    </div>
  );
}
