import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F172A 0%, #0B1225 45%, #0F172A 100%)",
          position: "relative",
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 35%, rgba(29,78,216,0.45), transparent 55%), radial-gradient(circle at 78% 38%, rgba(6,182,212,0.30), transparent 55%), radial-gradient(circle at 55% 82%, rgba(139,92,246,0.35), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
            opacity: 0.16,
          }}
        />

        <div
          style={{
            width: 980,
            padding: 56,
            borderRadius: 28,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.9, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {BRAND.shortName}
          </div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.06 }}>
            AI Watermark Remover
          </div>
          <div style={{ fontSize: 26, opacity: 0.9, lineHeight: 1.35 }}>
            Smart inpainting to clean overlays on your own images.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["Inpainting", "Manual targeting", "Fast preview", "No signup"].map((t) => (
              <div
                key={t}
                style={{
                  fontSize: 18,
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

