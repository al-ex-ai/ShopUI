import { useState, useEffect, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Portal from "@mui/material/Portal";

// --- Tour step definitions ---

interface TourStep {
  /** data-tour attribute value on the target element */
  target: string;
  title: string;
  description: string;
  /** Preferred placement of the tooltip relative to the target */
  placement: "bottom" | "top" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "nav-logo",
    title: "Welcome to ShopUI",
    description:
      "This is a fully Server-Driven UI demo. Every screen you see is rendered from JSON schemas sent by the server — no hardcoded layouts.",
    placement: "bottom",
  },
  {
    target: "nav-version",
    title: "Schema Versioning",
    description:
      "Click this chip to toggle between V1 and V2 schemas. Watch the UI update instantly — same client code, different server responses.",
    placement: "bottom",
  },
  {
    target: "nav-ai",
    title: "AI Playground",
    description:
      "Describe a screen in plain English and watch Gemini generate DSL that compiles and renders live. The compiler acts as a safety net — AI hallucinations are caught at compile time.",
    placement: "bottom",
  },
  {
    target: "nav-about",
    title: "How It Works",
    description:
      "Explore a detailed walkthrough covering the DSL, compiler, BFF, renderer, AI playground, and more.",
    placement: "bottom",
  },
  {
    target: "nav-mobile",
    title: "Mobile Preview",
    description:
      "See how the same SDUI schema renders on iOS and Android devices. One schema, platform-specific rendering — the core value of server-driven UI.",
    placement: "bottom",
  },
  {
    target: "nav-theme",
    title: "Theme Toggle",
    description:
      "Switch between light and dark themes. All components resolve semantic color tokens from the server schema at render time.",
    placement: "bottom",
  },
  {
    target: "nav-cart",
    title: "Shopping Cart",
    description:
      "Add products and watch the badge update in real-time via server-driven actions. The cart page itself is also SDUI-rendered.",
    placement: "bottom",
  },
];

const STORAGE_KEY = "sdui-tour-seen";
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 12;

// --- Spotlight overlay + tooltip ---

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getElementRect(target: string): SpotlightRect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  // Use viewport-relative coords (fixed positioning)
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function getTooltipPosition(
  spot: SpotlightRect,
  placement: TourStep["placement"],
  tooltipWidth: number,
  tooltipHeight: number
): { top: number; left: number } {
  const pad = SPOTLIGHT_PADDING + TOOLTIP_GAP;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top: number;
  let left: number;

  switch (placement) {
    case "bottom":
      top = spot.top + spot.height + pad;
      left = spot.left + spot.width / 2 - tooltipWidth / 2;
      break;
    case "top":
      top = spot.top - tooltipHeight - pad;
      left = spot.left + spot.width / 2 - tooltipWidth / 2;
      break;
    case "right":
      top = spot.top + spot.height / 2 - tooltipHeight / 2;
      left = spot.left + spot.width + pad;
      break;
    case "left":
      top = spot.top + spot.height / 2 - tooltipHeight / 2;
      left = spot.left - tooltipWidth - pad;
      break;
  }

  // Clamp to viewport on all sides
  left = clamp(left, 16, vw - tooltipWidth - 16);
  top = clamp(top, 16, vh - tooltipHeight - 16);

  return { top, left };
}

// --- Component ---

interface FeatureTourProps {
  /** External trigger to open the tour */
  open: boolean;
  onClose: () => void;
}

export default function FeatureTour({ open, onClose }: FeatureTourProps) {
  const [step, setStep] = useState(0);
  const [spotRect, setSpotRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const handleCloseRef = useRef(() => {});
  const [visible, setVisible] = useState(false);

  const currentStep = TOUR_STEPS[step];

  // Position spotlight + tooltip whenever step or open changes
  const positionElements = useCallback(() => {
    if (!open || !currentStep) return;

    const rect = getElementRect(currentStep.target);
    if (!rect) {
      // Target not found — skip to next step or close
      if (step < TOUR_STEPS.length - 1) {
        setStep((s) => s + 1);
      } else {
        handleCloseRef.current();
      }
      return;
    }

    setSpotRect(rect);

    // Position tooltip after a tick so we can measure it
    requestAnimationFrame(() => {
      const tooltip = tooltipRef.current;
      const tw = tooltip?.offsetWidth ?? 320;
      const th = tooltip?.offsetHeight ?? 120;
      const pos = getTooltipPosition(rect, currentStep.placement, tw, th);
      setTooltipPos(pos);
      setVisible(true);
    });
  }, [open, currentStep, step]);

  useEffect(() => {
    if (open) {
      setStep(0);
      setVisible(false);
      // Small delay to let the DOM settle (especially on first load)
      const timer = setTimeout(positionElements, 100);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setVisible(false);
      const timer = setTimeout(positionElements, 50);
      return () => clearTimeout(timer);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reposition on resize/scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => positionElements();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open, positionElements]);

  // Lock body scroll while tour is open to prevent Firefox overflow issues
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleClose = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
    onClose();
  }, [onClose]);

  handleCloseRef.current = handleClose;

  if (!open || !currentStep) return null;

  return (
    <Portal>
      {/* Full-screen click overlay — subtle backdrop so it's always visible */}
      <Box
        onClick={handleClose}
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1300,
          cursor: "default",
          bgcolor: "rgba(0, 0, 0, 0.15)",
        }}
      />

      {/* Spotlight cutout — uses a massive box-shadow to darken everything except the target */}
      {spotRect && (
        <Box
          sx={{
            position: "fixed",
            top: spotRect.top - SPOTLIGHT_PADDING,
            left: spotRect.left - SPOTLIGHT_PADDING,
            width: spotRect.width + SPOTLIGHT_PADDING * 2,
            height: spotRect.height + SPOTLIGHT_PADDING * 2,
            borderRadius: 2,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
            zIndex: 1301,
            pointerEvents: "none",
            transition: visible
              ? "top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease"
              : "none",
          }}
        />
      )}

      {/* Tooltip */}
      <Paper
        ref={tooltipRef}
        elevation={8}
        sx={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 1302,
          maxWidth: 340,
          width: "calc(100vw - 32px)",
          p: 2.5,
          borderRadius: 3,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Close button */}
        <IconButton
          size="small"
          onClick={handleClose}
          aria-label="close tour"
          sx={{ position: "absolute", top: 4, right: 4 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, pr: 3 }}>
          {currentStep.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          {currentStep.description}
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Step indicator */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {TOUR_STEPS.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === step ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: i === step ? "primary.main" : "action.disabled",
                  transition: "width 0.2s ease, background-color 0.2s ease",
                }}
              />
            ))}
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {step > 0 && (
              <Button
                size="small"
                onClick={handlePrev}
                startIcon={<ArrowBackIcon />}
                sx={{ minWidth: "auto" }}
              >
                Back
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              onClick={handleNext}
              endIcon={step < TOUR_STEPS.length - 1 ? <ArrowForwardIcon /> : undefined}
            >
              {step < TOUR_STEPS.length - 1 ? "Next" : "Got it!"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Portal>
  );
}

/** Returns true if the tour has never been shown to this user */
export function shouldShowTour(): boolean {
  return !localStorage.getItem(STORAGE_KEY);
}

/** Reset the tour so it shows again */
export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEY);
}
