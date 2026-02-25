/**
 * Action Handler — Interprets and executes SDUI actions
 *
 * Maps platform-agnostic action descriptions to React-specific implementations.
 * In a native app, this would map to platform-specific navigation, HTTP, etc.
 */

interface SDUIAction {
  type: string;
  [key: string]: unknown;
}

type NavigateFunction = (path: string) => void;
type RefetchFunction = () => void;
type GetFormState = () => Record<string, unknown>;

export function createActionHandler(
  navigate: NavigateFunction,
  refetch: RefetchFunction,
  getFormState?: GetFormState
) {
  return async function handleAction(action: SDUIAction): Promise<void> {
    console.log("[SDUI Action]", action);

    switch (action.type) {
      case "navigate": {
        const target = action.target as string;
        navigate(target);
        break;
      }

      case "api_call": {
        const endpoint = action.endpoint as string;
        const method = (action.method as string) ?? "POST";
        const body = action.body as Record<string, unknown> | undefined;

        // Merge form state into the request body
        const formState = getFormState?.() ?? {};
        const mergedBody = body ? { ...body, ...formState } : formState;

        try {
          const response = await fetch(endpoint, {
            method,
            headers: {
              "Content-Type": "application/json",
              "X-Session-Id": "user-1",
            },
            body: Object.keys(mergedBody).length > 0 ? JSON.stringify(mergedBody) : undefined,
          });

          if (!response.ok) {
            console.error("[SDUI Action] API call failed:", response.statusText);
          }

          // Check if server wants us to navigate (e.g., after order placement)
          const data = await response.json().catch(() => null);
          if (data?.order?.id) {
            refetch();
            navigate(`/order-confirmation?orderId=${data.order.id}`);
            return;
          }

          refetch();
        } catch (err) {
          console.error("[SDUI Action] API call error:", err);
        }
        break;
      }

      case "set_state": {
        console.log("[SDUI Action] set_state:", action.key, action.value);
        break;
      }

      case "analytics": {
        console.log("[SDUI Analytics]", action.event, action.properties);
        break;
      }

      default:
        console.warn("[SDUI Action] Unknown action type:", action.type);
    }
  };
}
