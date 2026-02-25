import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface Props {
  type: string;
  version?: number;
}

/**
 * Fallback component for unknown SDUI types.
 * In production, this would be invisible to users.
 * In dev mode, it shows what component was expected.
 */
export function SDUIFallback({ type, version }: Props) {
  if (import.meta.env.PROD) return null;

  return (
    <Box
      sx={{
        border: "2px dashed #ff9800",
        borderRadius: 1,
        p: 2,
        backgroundColor: "#fff3e0",
      }}
    >
      <Typography variant="caption" color="warning.main">
        Unknown component: {type}{version ? `@v${version}` : ""}
      </Typography>
    </Box>
  );
}
