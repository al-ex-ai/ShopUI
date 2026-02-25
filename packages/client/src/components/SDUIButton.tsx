import Button from "@mui/material/Button";
import { useMobileFrame } from "./MobilePreviewPanel";

interface SDUIAction {
  type: string;
  [key: string]: unknown;
}

interface Props {
  label?: string;
  action?: SDUIAction;
  style?: "primary" | "secondary" | "outlined" | "text" | "light";
  disabled?: boolean;
  fullWidth?: boolean;
  onAction: (action: SDUIAction) => void;
}

const VARIANT_MAP: Record<string, "contained" | "outlined" | "text"> = {
  primary: "contained",
  secondary: "contained",
  outlined: "outlined",
  text: "text",
  light: "contained",
};

const COLOR_MAP: Record<string, "primary" | "secondary" | "inherit"> = {
  primary: "primary",
  secondary: "secondary",
  light: "inherit",
};

export function SDUIButton({
  label,
  action,
  style = "primary",
  disabled,
  fullWidth,
  onAction,
}: Props) {
  const isMobile = useMobileFrame();

  return (
    <Button
      variant={VARIANT_MAP[style] ?? "contained"}
      color={COLOR_MAP[style] ?? "primary"}
      disabled={disabled}
      fullWidth={fullWidth}
      size={isMobile ? "small" : "medium"}
      onClick={() => action && onAction(action)}
      disableElevation
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 500,
        fontSize: isMobile ? "0.8rem" : "0.875rem",
        ...(style === "light" && {
          bgcolor: "rgba(255,255,255,0.15)",
          color: "#fff",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.3)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
        }),
      }}
    >
      {label}
    </Button>
  );
}
