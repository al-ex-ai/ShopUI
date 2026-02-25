import Typography from "@mui/material/Typography";
import { useResolveColor } from "../utils/resolveColor";
import { useMobileFrame } from "./MobilePreviewPanel";

type TextVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption";

const MOBILE_VARIANT_MAP: Partial<Record<TextVariant, TextVariant>> = {
  h1: "h3",
  h2: "h4",
  h3: "h5",
  h4: "h5",
  subtitle1: "subtitle2",
};

interface Props {
  content?: string;
  variant?: TextVariant;
  color?: string;
  align?: "left" | "center" | "right";
}

export function SDUIText({ content, variant = "body1", color, align }: Props) {
  const resolved = useResolveColor(color);
  const isMobile = useMobileFrame();
  const displayVariant = isMobile ? (MOBILE_VARIANT_MAP[variant] ?? variant) : variant;

  return (
    <Typography
      variant={displayVariant}
      sx={{ color: resolved, textAlign: align }}
    >
      {content}
    </Typography>
  );
}
