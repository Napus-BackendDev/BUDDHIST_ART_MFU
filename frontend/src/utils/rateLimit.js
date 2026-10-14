export function retryAtFromHeaders(headers = {}, now = Date.now()) {
  const value = headers['retry-after'];
  const seconds = Number(value);
  const timestamp = value && !Number.isFinite(seconds) ? Date.parse(value) : now + (seconds > 0 ? seconds : 60) * 1000;
  return Number.isFinite(timestamp) ? Math.max(now + 1000, timestamp) : now + 60000;
}
