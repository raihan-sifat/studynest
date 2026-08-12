export function toCamel<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    out[key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value
  }
  return out as T
}

export function toCamelArray<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => toCamel<T>(row))
}
