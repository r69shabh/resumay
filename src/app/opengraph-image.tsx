import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "resumay — Free ATS-Safe LaTeX Resume Builder";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#09090b",
          color: "#fafafa",
          padding: "50px 60px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "20%",
            width: "600px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(9,9,11,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "10%",
            width: "500px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(9,9,11,0) 70%)",
          }}
        />

        {/* Outer border */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 24,
            pointerEvents: "none",
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Column: Branding, Tagline, Features */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              maxWidth: "640px",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            {/* Logo & Category Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 56 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(14, 28) rotate(-16) translate(-14, -28)" opacity="0.45">
                    <rect x="4" y="12" width="28" height="36" rx="4" fill="#27272a" stroke="#ffffff" strokeWidth="1.75"/>
                    <circle cx="11" cy="16" r="1.5" fill="#ffffff" opacity="0.5"/>
                    <circle cx="25" cy="16" r="1.5" fill="#ffffff" opacity="0.5"/>
                    <rect x="8" y="21" width="12" height="2" rx="1" fill="#ffffff" opacity="0.5"/>
                    <line x1="8" y1="26" x2="28" y2="26" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                    <line x1="8" y1="30" x2="26" y2="30" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                    <line x1="8" y1="34" x2="22" y2="34" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                  </g>
                  <g transform="translate(36, 28) rotate(14) translate(-36, -28)" opacity="0.75">
                    <rect x="22" y="11" width="28" height="36" rx="4" fill="#18181b" stroke="#ffffff" strokeWidth="1.75"/>
                    <circle cx="29" cy="15" r="1.5" fill="#ffffff" opacity="0.7"/>
                    <circle cx="43" cy="15" r="1.5" fill="#ffffff" opacity="0.7"/>
                    <rect x="26" y="20" width="13" height="2.2" rx="1.1" fill="#ffffff" opacity="0.7"/>
                    <line x1="26" y1="25" x2="46" y2="25" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                    <line x1="26" y1="29.5" x2="44" y2="29.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                    <line x1="26" y1="34" x2="40" y2="34" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
                  </g>
                  <g transform="translate(28, 29) rotate(-2) translate(-28, -29)">
                    <rect x="13" y="10" width="30" height="38" rx="4.5" fill="#09090b" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M 13 15.5 Q 13 10 17.5 10 L 38.5 10 Q 43 10 43 15.5 L 43 17.5 L 13 17.5 Z" fill="#ffffff" opacity="0.15"/>
                    <rect x="18" y="6" width="3.5" height="7.5" rx="1.75" fill="#ffffff" stroke="#09090b" strokeWidth="1.2"/>
                    <rect x="26.25" y="6" width="3.5" height="7.5" rx="1.75" fill="#ffffff" stroke="#09090b" strokeWidth="1.2"/>
                    <rect x="34.5" y="6" width="3.5" height="7.5" rx="1.75" fill="#ffffff" stroke="#09090b" strokeWidth="1.2"/>
                    <rect x="17.5" y="21.5" width="13" height="3" rx="1.5" fill="#ffffff"/>
                    <rect x="17.5" y="26.5" width="8" height="1.8" rx="0.9" fill="#ffffff" opacity="0.6"/>
                    <line x1="17.5" y1="31" x2="38.5" y2="31" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.3"/>
                    <circle cx="19" cy="35" r="1.1" fill="#10b981"/>
                    <line x1="22.5" y1="35" x2="38" y2="35" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9"/>
                    <circle cx="19" cy="39" r="1.1" fill="#ffffff" opacity="0.7"/>
                    <line x1="22.5" y1="39" x2="35" y2="39" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9"/>
                    <circle cx="19" cy="43" r="1.1" fill="#ffffff" opacity="0.7"/>
                    <line x1="22.5" y1="43" x2="31" y2="43" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.9"/>
                  </g>
                </svg>
              </div>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                }}
              >
                resumay
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#34d399",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
                100% ATS SAFE · FREE FOREVER
              </div>
            </div>

            {/* Main Headline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: "#ffffff",
                  lineHeight: 1.1,
                }}
              >
                Clean, ATS-Safe Resumes.
              </span>
              <span
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: "#a1a1aa",
                  lineHeight: 1.1,
                }}
              >
                Zero Formatting Headaches.
              </span>
              <p
                style={{
                  fontSize: "19px",
                  color: "#a1a1aa",
                  lineHeight: 1.45,
                  margin: "8px 0 0 0",
                  maxWidth: "560px",
                }}
              >
                Create clean, ATS-friendly resumes in minutes. No complex formatting — just enter your details, preview live, and download for free.
              </p>
            </div>

            {/* Feature Badges Grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxWidth: "560px" }}>
              {[
                "Jake's Classic SWE",
                "Investment Banking",
                "Strategy Consulting",
                "Live PDF Preview",
                "Clean ATS Text",
                "Public /r/ Links",
              ].map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#e4e4e7",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Footer Attribution */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                fontSize: "14px",
                color: "#71717a",
              }}
            >
              <span style={{ color: "#ffffff", fontWeight: 600 }}>
                makeresumay.vercel.app
              </span>
              <span>•</span>
              <span>Made with ❤️ by @r69shabh</span>
            </div>
          </div>

          {/* Right Column: Visual Paper Sheet Card Mockup */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Sheet shadow backdrop */}
            <div
              style={{
                position: "absolute",
                width: "360px",
                height: "460px",
                borderRadius: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                transform: "rotate(3deg) translateY(6px)",
              }}
            />

            {/* Main Simulated Resume Paper Sheet */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "350px",
                height: "450px",
                backgroundColor: "#ffffff",
                color: "#18181b",
                borderRadius: "12px",
                padding: "26px 24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                position: "relative",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderBottom: "1px solid #e4e4e7",
                  paddingBottom: "10px",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "serif",
                    color: "#09090b",
                  }}
                >
                  Alex Morgan
                </span>
                <span
                  style={{
                    fontSize: "8.5px",
                    color: "#71717a",
                    marginTop: "3px",
                  }}
                >
                  San Francisco, CA • alex@example.com • github.com/alex
                </span>
              </div>

              {/* Section 1: Experience */}
              <div style={{ display: "flex", flexDirection: "column", marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#18181b",
                    }}
                  >
                    Experience
                  </span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e4e4e7" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5px", fontWeight: 600 }}>
                  <span>Senior Software Engineer</span>
                  <span style={{ color: "#71717a" }}>2022 – Present</span>
                </div>
                <span style={{ fontSize: "8px", color: "#71717a", marginBottom: "3px" }}>
                  CloudScale Technologies • San Francisco, CA
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ height: "4px", width: "95%", backgroundColor: "#e4e4e7", borderRadius: "2px" }} />
                  <div style={{ height: "4px", width: "88%", backgroundColor: "#e4e4e7", borderRadius: "2px" }} />
                </div>
              </div>

              {/* Section 2: Projects */}
              <div style={{ display: "flex", flexDirection: "column", marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#18181b",
                    }}
                  >
                    Key Projects
                  </span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e4e4e7" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5px", fontWeight: 600 }}>
                  <span>Raft-KV Distributed Store</span>
                  <span style={{ color: "#71717a" }}>Go, gRPC, Docker</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "3px" }}>
                  <div style={{ height: "4px", width: "92%", backgroundColor: "#e4e4e7", borderRadius: "2px" }} />
                  <div style={{ height: "4px", width: "84%", backgroundColor: "#e4e4e7", borderRadius: "2px" }} />
                </div>
              </div>

              {/* Section 3: Education */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#18181b",
                    }}
                  >
                    Education
                  </span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e4e4e7" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8.5px", fontWeight: 600 }}>
                  <span>UC Berkeley</span>
                  <span style={{ color: "#71717a" }}>B.S. in Computer Science</span>
                </div>
              </div>

              {/* Floating verified badge pinned on the corner */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "#09090b",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 600,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
                100% ATS Safe
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
