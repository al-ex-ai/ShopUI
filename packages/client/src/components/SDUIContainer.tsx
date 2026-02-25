import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { useResolveColor } from "../utils/resolveColor";
import { useMobileFrame } from "./MobilePreviewPanel";

interface Layout {
  direction?: "row" | "column";
  spacing?: number;
  padding?: number;
  alignment?: string;
  flex?: number;
  wrap?: boolean;
}

interface Props {
  background?: string;
  borderRadius?: number;
  layout?: Layout;
  children?: ReactNode;
}

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  "space-between": "space-between",
};

export function SDUIContainer({ background, borderRadius, layout, children }: Props) {
  const bg = useResolveColor(background);
  const isMobile = useMobileFrame();

  // In mobile frame: force column layout, reduce spacing/padding, and wrap
  const direction = isMobile ? "column" : (layout?.direction ?? "column");
  const spacing = layout?.spacing ? (isMobile ? Math.min(layout.spacing, 8) : layout.spacing) : undefined;
  const padding = layout?.padding ? (isMobile ? Math.min(layout.padding, 10) : layout.padding) : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        gap: spacing ? `${spacing}px` : undefined,
        padding: padding ? `${padding}px` : undefined,
        alignItems: layout?.alignment ? ALIGN_MAP[layout.alignment] : undefined,
        flex: layout?.flex,
        flexWrap: isMobile ? "wrap" : (layout?.wrap ? "wrap" : undefined),
        backgroundColor: bg,
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        ...(isMobile ? { minWidth: 0, maxWidth: "100%" } : {}),
      }}
    >
      {children}
    </Box>
  );
}
