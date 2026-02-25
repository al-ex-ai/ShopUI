import Box from "@mui/material/Box";

interface Props {
  size?: number;
}

export function SDUISpacer({ size = 16 }: Props) {
  return <Box sx={{ height: `${size}px` }} />;
}
