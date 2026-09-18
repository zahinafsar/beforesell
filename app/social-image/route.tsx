import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#f5f8fa", color: "#014069", padding: "70px 80px", fontFamily: "sans-serif", borderTop: "16px solid #014069" }}>
        <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>BeforeSell</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>Buy &amp; Sell in Bangladesh</div>
          <div style={{ display: "flex", fontSize: 30 }}>New and second-hand products. Post a free ad.</div>
        </div>
        <div style={{ display: "flex", fontSize: 26 }}>Phones · Electronics · Furniture · Vehicles</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
