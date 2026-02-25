import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function SDUIScreenSkeleton() {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <Box key={i}>
            <Skeleton variant="rounded" height={200} />
            <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="40%" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
