import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type Severity = "success" | "error" | "warning" | "info";

interface Notification {
  message: string;
  severity: Severity;
}

interface NotificationContextValue {
  notify: (message: string, severity?: Severity) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => {},
});

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Notification>({ message: "", severity: "info" });

  const notify = useCallback((message: string, severity: Severity = "info") => {
    setCurrent({ message, severity });
    setOpen(true);
  }, []);

  const handleClose = useCallback((_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={current.severity} variant="filled" sx={{ width: "100%" }}>
          {current.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
