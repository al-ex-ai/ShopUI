import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { Children, type ReactNode } from "react";

interface Props {
  divider?: boolean;
  children?: ReactNode;
}

export function SDUIList({ divider = true, children }: Props) {
  const items = Children.toArray(children);

  return (
    <Box>
      {items.map((child, index) => (
        <Box key={index}>
          {child}
          {divider && index < items.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
}
