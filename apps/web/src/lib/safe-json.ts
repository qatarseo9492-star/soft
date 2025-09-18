// src/lib/safe-json.ts
// Convert any BigInt in an object tree to string so JSON.stringify won’t crash.
export function jsonSafe<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}
