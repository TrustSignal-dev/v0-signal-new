import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 } as const;

// Brand tokens
const CORAL = "#E8614D";
const NEAR_BLACK = "#0F0F0F";
const WARM_WHITE = "#FAF9F7";
const MUTED = "#8A8A8A";

function Mark({ color, scale = 1 }: { color: string; scale?: number }) {
  // Mirrors /public/brand/mark.svg geometry (viewBox 128x128)
  const base = 128 * scale;
  return (
    <svg
      width={base}
      height={base}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="60" width="14" height="8" rx="1.5" fill={color} />
      <rect x="26" y="48" width="8" height="32" rx="1.5" fill={color} />
      <rect x="42" y="36" width="8" height="56" rx="1.5" fill={color} />
      <rect x="60" y="24" width="8" height="80" rx="1.5" fill={color} />
      <rect x="78" y="36" width="8" height="56" rx="1.5" fill={color} />
      <rect x="94" y="48" width="8" height="32" rx="1.5" fill={color} />
      <rect x="110" y="60" width="14" height="8" rx="1.5" fill={color} />
    </svg>
  );
}

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: NEAR_BLACK,
          backgroundImage:
            // Subtle infrastructure grid
            `linear-gradient(rgba(232,97,77,0.06) 1px, transparent 1px),
             linear-gradient(90deg, rgba(232,97,77,0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          color: WARM_WHITE,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <Mark color={CORAL} scale={0.5} />
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: WARM_WHITE,
            }}
          >
            TrustSignal
          </div>
        </div>

        {/* Center: claim */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 1020,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: CORAL,
            }}
          >
            Evidence Integrity Infrastructure
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: WARM_WHITE,
            }}
          >
            Document integrity from origination to audit.
          </div>
        </div>

        {/* Bottom: lifecycle + url */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: MUTED,
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              letterSpacing: "0.08em",
            }}
          >
            <span>collect</span>
            <span style={{ color: CORAL }}>→</span>
            <span>receipt</span>
            <span style={{ color: CORAL }}>→</span>
            <span>verify</span>
            <span style={{ color: CORAL }}>→</span>
            <span>review</span>
          </div>
          <div style={{ color: WARM_WHITE, fontWeight: 600 }}>
            trustsignal.dev
          </div>
        </div>
      </div>
    ),
    {
      width: SIZE.width,
      height: SIZE.height,
    },
  );
}
