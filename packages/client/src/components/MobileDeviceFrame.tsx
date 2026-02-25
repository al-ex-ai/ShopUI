import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Platform } from "../themes/platformThemes";

// ---------------------------------------------------------------------------
// Device specifications
// ---------------------------------------------------------------------------

interface DeviceSpec {
  width: number;
  height: number;
  bezelRadius: number;
  bezelWidth: number;
}

const DEVICE_SPECS: Record<Platform, DeviceSpec> = {
  ios: { width: 393, height: 852, bezelRadius: 47, bezelWidth: 10 },
  android: { width: 412, height: 915, bezelRadius: 30, bezelWidth: 8 },
};

// ---------------------------------------------------------------------------
// Status bar components
// ---------------------------------------------------------------------------

function IosStatusBar() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        pt: "14px",
        pb: "6px",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: '-apple-system, "SF Pro Text", sans-serif',
        color: "#000",
        position: "relative",
        zIndex: 2,
      }}
    >
      <Typography sx={{ fontSize: "15px", fontWeight: 600, fontFamily: "inherit" }}>
        9:41
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#000" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#000" />
          <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#000" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#000" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="#000" />
          <path d="M4.5 8.1a5.2 5.2 0 017 0" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M2 5.3a9 9 0 0112 0" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="27" height="12" viewBox="0 0 27 12">
          <rect x="0" y="0.5" width="23" height="11" rx="2.5" stroke="#000" strokeWidth="1" fill="none" />
          <rect x="24" y="3.5" width="2.5" height="4" rx="1" fill="#000" opacity="0.4" />
          <rect x="1.5" y="2" width="19.5" height="8" rx="1.5" fill="#000" />
        </svg>
      </Box>
    </Box>
  );
}

function AndroidStatusBar() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        pt: "10px",
        pb: "6px",
        fontSize: "14px",
        fontFamily: '"Roboto", sans-serif',
        color: "#1C1B1F",
        position: "relative",
        zIndex: 2,
      }}
    >
      <Typography sx={{ fontSize: "14px", fontWeight: 500, fontFamily: "inherit" }}>
        9:41
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        {/* Signal */}
        <svg width="14" height="12" viewBox="0 0 14 12">
          <path d="M0 12L7 0l7 12H0z" fill="#1C1B1F" opacity="0.9" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="#1C1B1F" />
          <path d="M4.5 8.1a5.2 5.2 0 017 0" stroke="#1C1B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M2 5.3a9 9 0 0112 0" stroke="#1C1B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="24" height="12" viewBox="0 0 24 12">
          <rect x="0" y="1" width="20" height="10" rx="2" stroke="#1C1B1F" strokeWidth="1" fill="none" />
          <rect x="21" y="3.5" width="2.5" height="4" rx="1" fill="#1C1B1F" opacity="0.4" />
          <rect x="1.5" y="2.5" width="17" height="7" rx="1" fill="#1C1B1F" />
        </svg>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface MobileDeviceFrameProps {
  device: Platform;
  children: ReactNode;
  /** Scale factor — use 0.7–1.0 to fit the frame in smaller spaces */
  scale?: number;
}

export default function MobileDeviceFrame({
  device,
  children,
  scale = 0.75,
}: MobileDeviceFrameProps) {
  const spec = DEVICE_SPECS[device];

  // Total size including bezel border
  const totalWidth = spec.width + spec.bezelWidth * 2;
  const totalHeight = spec.height + spec.bezelWidth * 2 + 30; // +30 for label

  return (
    <Box
      sx={{
        /* Scaled dimensions so layout box matches visual size */
        width: totalWidth * scale,
        height: totalHeight * scale,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
      {/* Device shell */}
      <Box
        sx={{
          position: "relative",
          width: spec.width,
          height: spec.height,
          border: `${spec.bezelWidth}px solid #1a1a1a`,
          borderRadius: `${spec.bezelRadius}px`,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        {/* Dynamic Island (iOS) or Camera punch-hole (Android) */}
        {device === "ios" ? (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 126,
              height: 36,
              bgcolor: "#000",
              borderRadius: "20px",
              zIndex: 10,
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 12,
              height: 12,
              bgcolor: "#1a1a1a",
              borderRadius: "50%",
              zIndex: 10,
            }}
          />
        )}

        {/* Status bar */}
        <Box sx={{ bgcolor: device === "ios" ? "#F2F2F7" : "#FFFBFE", pt: device === "ios" ? "22px" : "12px" }}>
          {device === "ios" ? <IosStatusBar /> : <AndroidStatusBar />}
        </Box>

        {/* Content area — scrollable, hard-clipped to device width */}
        <Box
          sx={{
            flex: 1,
            overflowX: "hidden",
            overflowY: "auto",
            height: spec.height - (device === "ios" ? 120 : 100),
            width: spec.width - spec.bezelWidth * 2,
            maxWidth: spec.width - spec.bezelWidth * 2,
            bgcolor: device === "ios" ? "#F2F2F7" : "#FFFBFE",
            "&::-webkit-scrollbar": { width: 0, display: "none" },
            "& *": {
              maxWidth: "100% !important",
              boxSizing: "border-box",
              minWidth: "0 !important",
            },
            "& img": { maxWidth: "100% !important", height: "auto" },
          }}
        >
          {children}
        </Box>

        {/* Home indicator (iOS) or Nav bar (Android) */}
        {device === "ios" ? (
          <Box
            sx={{
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: device === "ios" ? "#F2F2F7" : "#FFFBFE",
            }}
          >
            <Box
              sx={{
                width: 134,
                height: 5,
                bgcolor: "#000",
                borderRadius: 3,
                opacity: 0.2,
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              bgcolor: "#FFFBFE",
            }}
          >
            {/* Android nav: back, home, recents */}
            <Box sx={{ width: 16, height: 16, border: "2px solid #1C1B1F", borderRadius: "3px", opacity: 0.4 }} />
            <Box sx={{ width: 16, height: 16, border: "2px solid #1C1B1F", borderRadius: "50%", opacity: 0.4 }} />
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "14px solid #1C1B1F",
                opacity: 0.4,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Device label */}
      <Typography
        variant="caption"
        sx={{ mt: 1.5, color: "text.secondary", fontWeight: 500, letterSpacing: "0.05em" }}
      >
        {device === "ios" ? "iPhone 15" : "Pixel 8"}
      </Typography>
      </Box>
    </Box>
  );
}
