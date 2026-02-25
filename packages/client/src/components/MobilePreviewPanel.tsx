import { useState, useCallback, createContext, useContext } from "react";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import MobileDeviceFrame from "./MobileDeviceFrame";
import { SDUIRenderer } from "../renderer/SDUIRenderer";
import { SDUIErrorBoundary } from "./SDUIErrorBoundary";
import { getPlatformTheme, type Platform } from "../themes/platformThemes";

// ---------------------------------------------------------------------------
// Context — tells child components they're inside a mobile frame
// ---------------------------------------------------------------------------

export const MobileFrameContext = createContext(false);
export const useMobileFrame = () => useContext(MobileFrameContext);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScreenData {
  children: Array<{ type: string; props: Record<string, unknown>; children?: unknown[] }>;
  layout?: Record<string, unknown>;
}

interface MobilePreviewPanelProps {
  screen: ScreenData;
  /** Optional scale override for the phone frame */
  scale?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MobilePreviewPanel({ screen, scale = 0.65 }: MobilePreviewPanelProps) {
  const [platform, setPlatform] = useState<Platform>("ios");

  const handlePlatformChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, value: Platform | null) => {
      if (value) setPlatform(value);
    },
    [],
  );

  // No-op action handler for preview
  const noopAction = useCallback((_action: { type: string; [key: string]: unknown }) => {}, []);

  const platformTheme = getPlatformTheme(platform);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
      {/* Platform toggle */}
      <ToggleButtonGroup
        value={platform}
        exclusive
        onChange={handlePlatformChange}
        size="small"
        aria-label="platform selector"
      >
        <ToggleButton value="ios" aria-label="iOS" sx={{ px: 2, gap: 0.5, textTransform: "none" }}>
          <AppleIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>iOS</Typography>
        </ToggleButton>
        <ToggleButton value="android" aria-label="Android" sx={{ px: 2, gap: 0.5, textTransform: "none" }}>
          <AndroidIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Android</Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Phone frame with themed content — MobileFrameContext tells children to use mobile layout */}
      <MobileFrameContext.Provider value={true}>
        <ThemeProvider theme={platformTheme}>
          <MobileDeviceFrame device={platform} scale={scale}>
            <SDUIErrorBoundary>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: (screen.layout?.direction as string) ?? "column",
                  gap: `${Math.min(Number(screen.layout?.spacing ?? 16), 8)}px`,
                  p: `${Math.min(Number(screen.layout?.padding ?? 16), 10)}px`,
                }}
              >
                {screen.children.map((node, index) => (
                  <SDUIRenderer
                    key={`mobile-${platform}-${node.type}-${index}`}
                    node={node as never}
                    onAction={noopAction}
                  />
                ))}
              </Box>
            </SDUIErrorBoundary>
          </MobileDeviceFrame>
        </ThemeProvider>
      </MobileFrameContext.Provider>
    </Box>
  );
}
