import TextField from "@mui/material/TextField";
import { useMobileFrame } from "./MobilePreviewPanel";

interface Props {
  label?: string;
  placeholder?: string;
  binding?: string;
  inputType?: string;
  required?: boolean;
  value?: string;
  onChange?: (binding: string, value: string) => void;
}

export function SDUIInput({
  label,
  placeholder,
  binding = "",
  inputType = "text",
  required,
  value = "",
  onChange,
}: Props) {
  const isMobile = useMobileFrame();

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      type={inputType}
      required={required}
      value={value}
      onChange={(e) => onChange?.(binding, e.target.value)}
      fullWidth
      size="small"
      margin={isMobile ? "none" : undefined}
      slotProps={isMobile ? {
        inputLabel: { sx: { fontSize: "0.8rem" } },
        input: { sx: { fontSize: "0.85rem", py: "6px" } },
      } : undefined}
    />
  );
}
