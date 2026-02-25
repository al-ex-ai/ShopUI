import Card from "@mui/material/Card";
import type { ReactNode } from "react";
import { useMobileFrame } from "./MobilePreviewPanel";

interface Props {
  elevation?: number;
  children?: ReactNode;
}

export function SDUICard({ elevation = 1, children }: Props) {
  const isMobile = useMobileFrame();

  return (
    <Card
      variant={elevation === 0 ? "outlined" : "elevation"}
      elevation={elevation}
      sx={{
        overflow: "hidden",
        borderRadius: isMobile ? 2 : 3,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": !isMobile && elevation > 0
          ? { boxShadow: 4, transform: "translateY(-2px)" }
          : undefined,
      }}
    >
      {children}
    </Card>
  );
}
