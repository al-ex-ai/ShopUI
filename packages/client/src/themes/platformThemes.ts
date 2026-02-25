import { createTheme, type Theme } from "@mui/material/styles";

// ---------------------------------------------------------------------------
// iOS Theme — Apple Human Interface Guidelines inspired
// ---------------------------------------------------------------------------

export const iosTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#007AFF" },
    secondary: { main: "#5856D6" },
    success: { main: "#34C759" },
    error: { main: "#FF3B30" },
    warning: { main: "#FF9500" },
    info: { main: "#5AC8FA" },
    background: { default: "#F2F2F7", paper: "#FFFFFF" },
    text: { primary: "#000000", secondary: "#8E8E93" },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" as const },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: true },
      styleOverrides: {
        root: {
          borderRadius: 22,
          textTransform: "none" as const,
          fontWeight: 600,
          padding: "10px 24px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none", opacity: 0.85 },
        },
        outlined: {
          borderWidth: 1.5,
          "&:hover": { borderWidth: 1.5, backgroundColor: "rgba(0,122,255,0.06)" },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#F2F2F7",
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: "rgba(0,0,0,0.15)" },
            "&.Mui-focused fieldset": { borderColor: "#007AFF", borderWidth: 2 },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 20, fontWeight: 500 },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Android Theme — Material You / Material 3 inspired
// ---------------------------------------------------------------------------

export const androidTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6750A4" },
    secondary: { main: "#625B71" },
    success: { main: "#4CAF50" },
    error: { main: "#B3261E" },
    warning: { main: "#F9A825" },
    info: { main: "#0288D1" },
    background: { default: "#FFFBFE", paper: "#FFFFFF" },
    text: { primary: "#1C1B1F", secondary: "#49454F" },
  },
  typography: {
    fontFamily: '"Roboto", "Google Sans", "Noto Sans", Arial, sans-serif',
    h3: { fontWeight: 400 },
    h4: { fontWeight: 400 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 500, textTransform: "none" as const, letterSpacing: "0.02em" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none" as const,
          fontWeight: 500,
          padding: "10px 24px",
          letterSpacing: "0.02em",
        },
        contained: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
          "&:hover": {
            boxShadow: "0 2px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": { borderColor: "#79747E" },
            "&:hover fieldset": { borderColor: "#1C1B1F" },
            "&.Mui-focused fieldset": { borderColor: "#6750A4", borderWidth: 2 },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

export type Platform = "ios" | "android";

export function getPlatformTheme(platform: Platform): Theme {
  return platform === "ios" ? iosTheme : androidTheme;
}
