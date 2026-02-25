import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Props {
  children: ReactNode;
  /** Optional fallback to render instead of the default error UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for the SDUI Renderer.
 *
 * Catches render errors from any SDUI component and shows a graceful
 * recovery UI instead of crashing the entire app. This is essential
 * for SDUI since the server controls the schema — a bad payload
 * shouldn't take down the client.
 */
export class SDUIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SDUI] Render error caught by boundary:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
              >
                Retry
              </Button>
            }
          >
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2">
              A component failed to render. This is likely a schema issue from the server.
            </Typography>
            {this.state.error && (
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  overflow: "auto",
                  maxHeight: 80,
                  fontFamily: "monospace",
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
