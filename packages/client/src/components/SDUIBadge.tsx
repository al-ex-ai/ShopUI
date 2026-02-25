import Chip from "@mui/material/Chip";

interface Props {
  content?: string;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "default";
}

export function SDUIBadge({ content, color = "default" }: Props) {
  return <Chip label={content} color={color} size="small" variant="outlined" sx={{ alignSelf: "flex-start" }} />;
}
