
export default function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 16px",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        background: "#fef2f2",
        color: "#991b1b",
        margin: "12px 0",
      }}
    >
      <div>
        <strong style={{ display: "block", marginBottom: "4px" }}>
          Something went wrong
        </strong>
        <span>{message}</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            background: "#ffffff",
            color: "#991b1b",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
