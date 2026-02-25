import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CodeIcon from "@mui/icons-material/Code";
import PreviewIcon from "@mui/icons-material/Preview";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { SDUIRenderer } from "./renderer/SDUIRenderer";
import { SDUIErrorBoundary } from "./components/SDUIErrorBoundary";
import MobilePreviewPanel from "./components/MobilePreviewPanel";

interface GenerateResponse {
  dsl: string;
  screen: {
    children: Array<{ type: string; props: Record<string, unknown>; children?: unknown[] }>;
    layout: Record<string, unknown>;
  } | null;
  compileErrors: string[];
  message: string;
  error?: string;
}

const EXAMPLE_PROMPTS = [
  "A settings page with profile photo, name field, email field, and Save button",
  "A dashboard with 3 stat cards (Users, Revenue, Orders) and a recent activity list",
  "A login page with email, password, a Sign In button, and a forgot password link",
  "A product card grid with images, titles, prices, and Add to Cart buttons",
  "A contact us page with name, email, message fields and a Submit button",
];

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data: GenerateResponse = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Server returned ${res.status}`);
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  const handleCopyDsl = useCallback(() => {
    if (result?.dsl) {
      navigator.clipboard.writeText(result.dsl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleExampleClick = useCallback((example: string) => {
    setPrompt(example);
  }, []);

  // No-op action handler for preview
  const noopAction = useCallback(() => {}, []);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
            AI Playground
          </Typography>
          <Chip label="Gemini" size="small" color="secondary" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Describe a screen in plain English. AI generates the DSL, the compiler validates it, and the renderer previews it live.
        </Typography>
      </Box>

      {/* Prompt Input */}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          label="Describe your screen"
          placeholder="e.g., A settings page with a profile photo, name and email fields, and a Save button"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleGenerate();
            }
          }}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Ctrl+Enter to submit
          </Typography>
        </Box>

        {/* Example prompts */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Try an example:
        </Typography>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {EXAMPLE_PROMPTS.map((ex) => (
            <Chip
              key={ex}
              label={ex.length > 50 ? ex.slice(0, 50) + "..." : ex}
              size="small"
              variant="outlined"
              onClick={() => handleExampleClick(ex)}
              sx={{ cursor: "pointer", fontSize: "0.7rem" }}
            />
          ))}
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 3,
          }}
        >
          {/* DSL Code Panel */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <CodeIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Generated DSL
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyDsl}
                sx={{ textTransform: "none", minWidth: 0 }}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </Box>
            <Box
              component="pre"
              sx={{
                p: 2,
                m: 0,
                overflow: "auto",
                maxHeight: { xs: 300, md: 600 },
                fontSize: "0.8rem",
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                lineHeight: 1.6,
                bgcolor: "#1e1e1e",
                color: "#d4d4d4",
                whiteSpace: "pre",
              }}
            >
              {result.dsl}
            </Box>
            {result.compileErrors.length > 0 && (
              <Alert severity="warning" sx={{ borderRadius: 0 }}>
                <Typography variant="subtitle2">Compilation Errors</Typography>
                {result.compileErrors.map((err, i) => (
                  <Typography key={i} variant="caption" component="div">
                    {err}
                  </Typography>
                ))}
              </Alert>
            )}
          </Paper>

          {/* Live Preview Panel */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              minWidth: 0,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <PreviewIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ flex: 1 }}>
                Desktop Preview
              </Typography>
              <Chip
                label={result.screen ? "Compiled" : "Error"}
                size="small"
                color={result.screen ? "success" : "error"}
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            </Box>
            <Box sx={{ p: 2, overflow: "auto", maxHeight: { xs: 400, md: 600 } }}>
              {result.screen ? (
                <SDUIErrorBoundary>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: (result.screen.layout?.direction as string) ?? "column",
                      gap: `${result.screen.layout?.spacing ?? 16}px`,
                    }}
                  >
                    {result.screen.children.map((node, index) => (
                      <SDUIRenderer
                        key={`${node.type}-${index}`}
                        node={node as never}
                        onAction={noopAction}
                      />
                    ))}
                  </Box>
                </SDUIErrorBoundary>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    The generated DSL could not be compiled. Check the errors above.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Mobile Preview Panel */}
          {result.screen && (
            <Paper
              variant="outlined"
              sx={{
                minWidth: isMobile ? "auto" : 320,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: "action.hover",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <PhoneIphoneIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  Mobile Preview
                </Typography>
              </Box>
              <Box sx={{ p: 2, overflow: "auto", maxHeight: { xs: 500, md: 700 }, display: "flex", justifyContent: "center" }}>
                <MobilePreviewPanel screen={result.screen} scale={0.6} />
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Empty state */}
      {!result && !error && !loading && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 2,
            borderStyle: "dashed",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Describe a screen and watch it come to life
          </Typography>
          <Typography variant="body2" color="text.disabled">
            AI generates DSL code → Compiler validates it → Renderer displays it
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
