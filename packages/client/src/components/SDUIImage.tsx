import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

// MUI icon imports for product illustrations
import HeadphonesIcon from "@mui/icons-material/Headphones";
import BackpackIcon from "@mui/icons-material/Backpack";
import WatchIcon from "@mui/icons-material/Watch";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import CoffeeMakerIcon from "@mui/icons-material/CoffeeMaker";
import LightModeIcon from "@mui/icons-material/LightMode";
import ImageIcon from "@mui/icons-material/Image";

const ICON_MAP: Record<string, React.ElementType> = {
  Headphones: HeadphonesIcon,
  Backpack: BackpackIcon,
  Watch: WatchIcon,
  DirectionsRun: DirectionsRunIcon,
  CoffeeMaker: CoffeeMakerIcon,
  LightMode: LightModeIcon,
};

interface Props {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  objectFit?: "cover" | "contain" | "fill";
}

export function SDUIImage({ src, alt, width, height, objectFit = "cover" }: Props) {
  const [failed, setFailed] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Render MUI icon for "icon:IconName" sources
  if (src?.startsWith("icon:")) {
    const iconName = src.replace("icon:", "");
    const IconComponent = ICON_MAP[iconName] ?? ImageIcon;
    const isSmall = (width ?? 999) <= 80;

    return (
      <Box
        sx={{
          width: width ?? "100%",
          height: height ?? 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: isSmall ? 2 : 0,
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.light}22 0%, ${theme.palette.primary.main}18 100%)`,
          borderBottom: isSmall ? "none" : `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <IconComponent
          sx={{
            fontSize: isSmall ? Math.min((height ?? 56) * 0.5, 28) : Math.min((height ?? 160) * 0.45, 72),
            color: isDark ? theme.palette.primary.main : theme.palette.primary.light,
            opacity: 0.85,
          }}
        />
      </Box>
    );
  }

  // Fallback for broken / missing images
  if (failed || !src) {
    return (
      <Box
        sx={{
          width: width ?? "100%",
          height: height ?? 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          color: "text.disabled",
        }}
      >
        <ImageIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="caption">{alt ?? "Image"}</Typography>
      </Box>
    );
  }

  // Regular image URL
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      sx={{
        width: width ?? "100%",
        height: height ?? "auto",
        objectFit,
        display: "block",
      }}
    />
  );
}
