import {
  BASE_RETRY_DELAY_MS,
  MAX_QUERY_RETRIES,
  MAX_RETRY_DELAY_MS,
  queryClient,
  retryDelay,
  shouldRetryQuery,
} from "@/lib/query-client";

describe("retryDelay (D5)", () => {
  it("progresses exponentially with deterministic jitter", () => {
    expect(retryDelay(0, () => 0)).toBe(BASE_RETRY_DELAY_MS / 2);
    expect(retryDelay(0, () => 1)).toBe(BASE_RETRY_DELAY_MS);
    expect(retryDelay(1, () => 0)).toBe(BASE_RETRY_DELAY_MS);
    expect(retryDelay(1, () => 1)).toBe(BASE_RETRY_DELAY_MS * 2);
    expect(retryDelay(2, () => 0)).toBe(BASE_RETRY_DELAY_MS * 2);
    expect(retryDelay(2, () => 1)).toBe(BASE_RETRY_DELAY_MS * 4);
  });

  it("caps the delay at MAX_RETRY_DELAY_MS", () => {
    expect(retryDelay(10, () => 1)).toBe(MAX_RETRY_DELAY_MS);
    expect(retryDelay(10, () => 0)).toBe(MAX_RETRY_DELAY_MS / 2);
    expect(retryDelay(20, () => 0.5)).toBe(Math.round(MAX_RETRY_DELAY_MS * 0.75));
  });

  it("stays within [exponential / 2, exponential] jitter bounds", () => {
    for (let attempt = 0; attempt <= 6; attempt++) {
      const cap = Math.min(BASE_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS);
      for (const sample of [0, 0.1, 0.25, 0.5, 0.75, 0.999]) {
        const delay = retryDelay(attempt, () => sample);
        expect(delay).toBeGreaterThanOrEqual(cap / 2);
        expect(delay).toBeLessThanOrEqual(cap);
      }
    }
  });

  it("treats negative attempt indices as 0", () => {
    expect(retryDelay(-3, () => 1)).toBe(BASE_RETRY_DELAY_MS);
  });
});

describe("shouldRetryQuery & queryClient defaults (D5)", () => {
  it("retries transient and 5xx errors up to MAX_QUERY_RETRIES", () => {
    const networkError = new Error("Network request failed");
    const serverError = Object.assign(new Error("Service unavailable"), { status: 503 });

    expect(shouldRetryQuery(0, networkError)).toBe(true);
    expect(shouldRetryQuery(1, networkError)).toBe(true);
    expect(shouldRetryQuery(MAX_QUERY_RETRIES, networkError)).toBe(false);

    expect(shouldRetryQuery(0, serverError)).toBe(true);
    expect(shouldRetryQuery(1, serverError)).toBe(true);
    expect(shouldRetryQuery(MAX_QUERY_RETRIES, serverError)).toBe(false);
  });

  it("does not retry 4xx client errors", () => {
    expect(shouldRetryQuery(0, Object.assign(new Error("Bad request"), { status: 400 }))).toBe(false);
    expect(shouldRetryQuery(0, Object.assign(new Error("Unauthorized"), { statusCode: 401 }))).toBe(false);
    expect(shouldRetryQuery(0, { response: { status: 404 } })).toBe(false);
    expect(shouldRetryQuery(0, { status: 422 })).toBe(false);
  });

  it("disables automatic retries for mutations", () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.mutations?.retry).toBe(false);
    expect(defaults.queries?.retry).toBe(shouldRetryQuery);
  });
});
