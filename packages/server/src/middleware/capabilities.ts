import type { Request, Response, NextFunction } from "express";

/**
 * Client Capability Negotiation Middleware
 *
 * Clients send an `X-SDUI-Capabilities` header listing component types they support.
 * The BFF uses this to decide what to include in the response.
 *
 * Example header: X-SDUI-Capabilities: text@1,button@1,card@1,grid@1,image@1
 */

export interface ClientCapabilities {
  components: Map<string, number>;
  schemaVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      capabilities?: ClientCapabilities;
    }
  }
}

export function capabilitiesMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers["x-sdui-capabilities"] as string | undefined;
  const versionHeader = req.headers["x-sdui-version"] as string | undefined;

  const components = new Map<string, number>();

  if (header) {
    for (const entry of header.split(",")) {
      const [type, version] = entry.trim().split("@");
      components.set(type, version ? parseInt(version, 10) : 1);
    }
  }

  req.capabilities = {
    components,
    schemaVersion: versionHeader ? parseInt(versionHeader, 10) : 1,
  };

  next();
}
