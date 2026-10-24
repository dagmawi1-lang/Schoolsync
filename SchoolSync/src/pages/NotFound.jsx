
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: "520px" }}>
        <div
          style={{
            fontSize: "clamp(76px, 15vw, 120px)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-5px",
            color: "#6366f1",
          }}
        >
          404
        </div>

        <h1 style={{ fontSize: "30px", margin: "20px 0 12px" }}>
          Page not found
        </h1>

        <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
          We couldn't find the page you're looking for. It may have moved,
          been removed, or the address may be incorrect.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "24px",
          }}
        >
          <Link
            to="/"
            style={{
              padding: "12px 18px",
              background: "#4f46e5",
              color: "white",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 18px",
              border: "1px solid #d1d5db",
              background: "transparent",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
}
