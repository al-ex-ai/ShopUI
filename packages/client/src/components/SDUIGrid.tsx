import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { useMobileFrame } from "./MobilePreviewPanel";

interface Props {
  columns?: number;
  gap?: number;
  children?: ReactNode;
}

export function SDUIGrid({ columns = 3, gap = 16, children }: Props) {
  const isMobile = useMobileFrame();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : {
              xs: "1fr",
              sm: columns >= 2 ? "repeat(2, 1fr)" : "1fr",
              md: `repeat(${columns}, 1fr)`,
            },
        gap: `${gap}px`,
      }}
    >
      {children}
    </Box>
  );
}
