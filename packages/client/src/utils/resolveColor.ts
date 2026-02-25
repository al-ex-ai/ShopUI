import { useTheme } from "@mui/material/styles";

/**
 * Resolves SDUI color tokens to actual CSS values.
 *
 * Supports:
 *  - Theme paths: "primary.main", "background.paper", "text.secondary"
 *  - Raw CSS values: "#1976d2", "red", "rgb(0,0,0)"
 *  - Special tokens: "white", "inherit", "transparent"
 */
export function useResolveColor(color: string | undefined): string | undefined {
  const theme = useTheme();
  if (!color) return undefined;

  // Pass through raw CSS values
  if (color.startsWith("#") || color.startsWith("rgb") || color === "inherit" || color === "transparent") {
    return color;
  }

  // Special: "white" / "black"
  if (color === "white") return theme.palette.common.white;
  if (color === "black") return theme.palette.common.black;

  // Resolve dot-path from theme palette (e.g., "primary.main", "text.secondary")
  const parts = color.split(".");
  let value: unknown = theme.palette;
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return color; // Can't resolve — return as-is
    }
  }

  return typeof value === "string" ? value : color;
}
