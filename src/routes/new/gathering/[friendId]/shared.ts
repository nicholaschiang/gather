export const timeMinParamName = "t"

export function getTimeMin(searchParams: URLSearchParams): Date {
  const t = new Date(searchParams.get(timeMinParamName) ?? new Date())
  const now = new Date()
  return t.toString() !== "Invalid Date"
    ? new Date(t.getFullYear(), t.getMonth(), t.getDate())
    : new Date(now.getFullYear(), now.getMonth(), now.getDate())
}
