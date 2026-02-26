import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobilePreviewPanel from "./components/MobilePreviewPanel";
import AboutPage from "./AboutPage";
import PlaygroundPage from "./PlaygroundPage";
import FeatureTour, { shouldShowTour } from "./components/FeatureTour";
import { useScreen } from "./hooks/useScreen";
import { useSDUIState } from "./hooks/useSDUIState";
import { SDUIRenderer } from "./renderer/SDUIRenderer";
import { SDUIScreenSkeleton } from "./components/SDUISkeleton";
import { SDUIErrorBoundary } from "./components/SDUIErrorBoundary";
import { createActionHandler } from "./renderer/ActionHandler";
import { NotificationProvider, useNotification } from "./contexts/NotificationContext";

// --- Contexts ---

const CartContext = createContext<{ count: number; refresh: () => void }>({
  count: 0,
  refresh: () => {},
});

type ThemeMode = "light" | "dark";
const ThemeModeContext = createContext<{ mode: ThemeMode; toggle: () => void }>({
  mode: "light",
  toggle: () => {},
});

type SchemaVersion = "v1" | "v2";
export const SchemaVersionContext = createContext<{ version: SchemaVersion; toggle: () => void }>({
  version: "v1",
  toggle: () => {},
});

// --- Themes ---

function buildTheme(mode: ThemeMode) {
  return createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: { main: "#1976d2" },
            secondary: { main: "#dc004e" },
            background: { default: "#f5f5f5", paper: "#ffffff" },
          }
        : {
            primary: { main: "#90caf9" },
            secondary: { main: "#f48fb1" },
            background: { default: "#121212", paper: "#1e1e1e" },
          }),
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: "none" as const, borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...(mode === "dark" ? { backgroundImage: "none" } : {}),
          },
        },
      },
    },
  });
}

// --- Hooks ---

function useCartCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        headers: { "X-Session-Id": "user-1" },
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { count, refresh };
}

function useThemeMode(): { mode: ThemeMode; toggle: () => void } {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("sdui-theme");
    return saved === "dark" ? "dark" : "light";
  });

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("sdui-theme", next);
      return next;
    });
  }, []);

  return { mode, toggle };
}

function useSchemaVersion(): { version: SchemaVersion; toggle: () => void } {
  const [version, setVersion] = useState<SchemaVersion>(() => {
    const saved = localStorage.getItem("sdui-schema-version");
    return saved === "v2" ? "v2" : "v1";
  });

  const toggle = useCallback(() => {
    setVersion((prev) => {
      const next = prev === "v1" ? "v2" : "v1";
      localStorage.setItem("sdui-schema-version", next);
      return next;
    });
  }, []);

  return { version, toggle };
}

// --- Pages ---

function ScreenPage({ screenId, params }: { screenId: string; params?: Record<string, string> }) {
  const { screen, loading, error, refetch } = useScreen(screenId, params);
  const navigate = useNavigate();
  const { state: inputValues, setValue: setInputValue } = useSDUIState();
  const cart = useContext(CartContext);
  const { notify } = useNotification();

  const handleAction = createActionHandler({
    navigate,
    refetch: () => { refetch(); cart.refresh(); },
    getFormState: () => inputValues,
    notify,
  });

  if (loading) return <SDUIScreenSkeleton />;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!screen) return null;

  const screenPadding = Number(screen.layout.padding) || 24;

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        display: "flex",
        flexDirection: screen.layout.direction as string ?? "column",
        gap: `${screen.layout.spacing}px`,
        px: { xs: `${Math.min(screenPadding, 16)}px`, sm: `${screenPadding}px` },
        py: `${screenPadding}px`,
      }}
    >
      <SDUIErrorBoundary>
        {screen.children.map((node, index) => (
          <SDUIRenderer
            key={`${(node as { type: string }).type}-${index}`}
            node={node as never}
            onAction={handleAction}
            onInputChange={setInputValue}
            inputValues={inputValues}
          />
        ))}
      </SDUIErrorBoundary>
    </Box>
  );
}

function HomePage() {
  return <ScreenPage screenId="home" />;
}

function ProductPage() {
  const { id } = useParams();
  return <ScreenPage screenId="product-detail" params={{ productId: id ?? "1" }} />;
}

function CartPage() {
  return <ScreenPage screenId="cart" />;
}

function CheckoutPage() {
  return <ScreenPage screenId="checkout" />;
}

function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId") ?? "";

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 4, textAlign: "center" }}>
      <Typography variant="h4" sx={{ mb: 2, color: "success.main" }}>
        Order Confirmed!
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Your order <strong>{orderId}</strong> has been placed successfully.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You will receive a confirmation email shortly.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </Box>
  );
}

// --- Mobile Preview Drawer ---

/** Maps current route path to the SDUI screen ID for the mobile preview */
function useCurrentScreenId(): string | null {
  const { pathname } = useLocation();
  if (pathname === "/") return "home";
  if (pathname.startsWith("/product/")) return "product-detail";
  if (pathname === "/cart") return "cart";
  if (pathname === "/checkout") return "checkout";
  return null; // Non-SDUI pages (about, playground, order-confirmation)
}

function MobilePreviewDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const screenId = useCurrentScreenId();
  const { screen } = useScreen(screenId ?? "home");

  if (!screen) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 380 }, p: 2, bgcolor: "background.default" } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Mobile Preview
        </Typography>
        <IconButton onClick={onClose} size="small" aria-label="close mobile preview">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", overflow: "auto", flex: 1 }}>
        <MobilePreviewPanel
          screen={{ children: screen.children as never[], layout: screen.layout }}
          scale={0.55}
        />
      </Box>
    </Drawer>
  );
}

// --- NavBar ---

function NavBar({ onOpenTour, onOpenMobile }: { onOpenTour: () => void; onOpenMobile: () => void }) {
  const { count } = useContext(CartContext);
  const { mode, toggle: toggleTheme } = useContext(ThemeModeContext);
  const { version, toggle: toggleVersion } = useContext(SchemaVersionContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const currentScreenId = useCurrentScreenId();

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <DashboardIcon sx={{ mr: 1, fontSize: { xs: "1.25rem", sm: "1.5rem" }, opacity: 0.9 }} />
        <Typography
          data-tour="nav-logo"
          variant="h6"
          component="a"
          href="/"
          sx={{ color: "inherit", textDecoration: "none", fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          {isSmall ? "ShopUI" : "ShopUI — SDUI Demo"}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Chip
          data-tour="nav-version"
          label={version.toUpperCase()}
          size="small"
          onClick={toggleVersion}
          sx={{
            mr: { xs: 0.5, sm: 1.5 },
            fontWeight: 700,
            fontSize: "0.7rem",
            color: "#fff",
            bgcolor: version === "v2" ? "secondary.main" : "rgba(255,255,255,0.2)",
            cursor: "pointer",
            "&:hover": { bgcolor: version === "v2" ? "secondary.dark" : "rgba(255,255,255,0.3)" },
          }}
        />
        {isSmall ? (
          <>
            <Tooltip title="AI Playground" arrow>
              <IconButton
                data-tour="nav-ai"
                color="inherit"
                onClick={() => navigate("/playground")}
                aria-label="AI playground"
                sx={{ opacity: 0.9 }}
              >
                <AutoAwesomeIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              data-tour="nav-about"
              color="inherit"
              onClick={() => navigate("/about")}
              aria-label="how it works"
              sx={{ opacity: 0.9 }}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Button
              data-tour="nav-ai"
              color="inherit"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => navigate("/playground")}
              sx={{ mr: 1, opacity: 0.9 }}
            >
              AI Playground
            </Button>
            <Button
              data-tour="nav-about"
              color="inherit"
              size="small"
              startIcon={<InfoOutlinedIcon />}
              onClick={() => navigate("/about")}
              sx={{ mr: 1, opacity: 0.9 }}
            >
              How It Works
            </Button>
          </>
        )}
        {currentScreenId && (
          <Tooltip title="Mobile Preview" arrow>
            <IconButton
              data-tour="nav-mobile"
              color="inherit"
              onClick={onOpenMobile}
              aria-label="mobile preview"
              sx={{ mr: 0.5, opacity: 0.9 }}
            >
              <PhoneIphoneIcon />
            </IconButton>
          </Tooltip>
        )}
        <IconButton
          data-tour="nav-theme"
          color="inherit"
          onClick={toggleTheme}
          aria-label="toggle theme"
          sx={{ mr: 0.5 }}
        >
          {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        <IconButton
          data-tour="nav-cart"
          color="inherit"
          onClick={() => navigate("/cart")}
          aria-label="cart"
          sx={{ mr: 0.5 }}
        >
          <Badge badgeContent={count} color="error" showZero={false}>
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <Tooltip title="Feature tour" arrow>
          <IconButton
            color="inherit"
            onClick={onOpenTour}
            aria-label="start feature tour"
            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

// --- App ---

export default function App() {
  const cartState = useCartCount();
  const themeState = useThemeMode();
  const versionState = useSchemaVersion();
  const theme = useMemo(() => buildTheme(themeState.mode), [themeState.mode]);

  // Feature tour — auto-open on first visit
  const [tourOpen, setTourOpen] = useState(() => shouldShowTour());
  const [tourKey, setTourKey] = useState(0);
  const openTour = useCallback(() => {
    setTourKey((k) => k + 1);
    setTourOpen(true);
  }, []);
  const closeTour = useCallback(() => setTourOpen(false), []);

  // Mobile preview drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SchemaVersionContext.Provider value={versionState}>
      <ThemeModeContext.Provider value={themeState}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            <CartContext.Provider value={cartState}>
              <BrowserRouter>
                <NavBar onOpenTour={openTour} onOpenMobile={openMobile} />
                <MobilePreviewDrawer open={mobileOpen} onClose={closeMobile} />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/playground" element={<PlaygroundPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
                <FeatureTour key={tourKey} open={tourOpen} onClose={closeTour} />
              </BrowserRouter>
            </CartContext.Provider>
          </NotificationProvider>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </SchemaVersionContext.Provider>
  );
}
