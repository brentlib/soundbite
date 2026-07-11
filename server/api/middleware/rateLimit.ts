import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';

// All public traffic reaches Express through the Cloudflare Tunnel, so the real
// client IP lives in the CF-Connecting-IP header — req.ip would just be the
// tunnel container's internal address, making every visitor look identical.
// We fall back to req.ip for local/dev requests that don't come via Cloudflare.
function clientIpKey(req: Request): string {
  const ip = req.header('CF-Connecting-IP') ?? req.ip;
  return ip ? ipKeyGenerator(ip) : 'unknown';
}

function makeLimiter(limit: number, message: string) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clientIpKey,
    // We derive the client IP ourselves from CF-Connecting-IP, so the library's
    // X-Forwarded-For / trust-proxy validation doesn't apply here.
    validate: { xForwardedForHeader: false },
    message: { error: message },
  });
}

// Generous catch-all applied to every route (including cheap ones like /health
// and static assets). Real users won't hit it; it swats casual scripted
// hammering before it reaches the handlers. Not a DDoS defense — Cloudflare's
// edge handles volumetric floods; this is app-level defense-in-depth.
export const globalLimiter = makeLimiter(
  100,
  'Too many requests. Please slow down and try again shortly.',
);

// These endpoints each cost real OpenAI spend + CPU on a small box, so we cap
// them tighter per client IP. Cloudflare handles volumetric DDoS; this stops
// API abuse. They stack on top of the global limiter above.
export const searchLimiter = makeLimiter(
  5,
  'Rate limit exceeded: max 5 searches per minute. Please wait a moment and try again.',
);

export const ragLimiter = makeLimiter(
  3,
  'Rate limit exceeded: max 3 answers per minute. Please wait a moment and try again.',
);
