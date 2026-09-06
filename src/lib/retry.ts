const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

/**
 * Wraps fetch with a couple of short-backoff retries for transient network
 * failures (DNS blips, connect timeouts) and retryable upstream statuses
 * (429/502/503/504). Non-retryable HTTP errors (4xx auth/validation, etc.)
 * are returned as-is so the caller can read the real error body.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  serviceName: string,
  maxRetries = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const isLastAttempt = attempt === maxRetries;
    try {
      const res = await fetch(url, init);
      if (res.ok || !RETRYABLE_STATUS.has(res.status) || isLastAttempt) {
        return res;
      }
    } catch (err) {
      if (isLastAttempt) {
        throw new Error(
          `Couldn't reach ${serviceName} after ${maxRetries + 1} attempts — check your internet connection and try again.`,
          { cause: err }
        );
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  // Unreachable — the loop always returns or throws on its last attempt.
  throw new Error(`Failed to reach ${serviceName}`);
}
