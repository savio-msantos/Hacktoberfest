export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function nextDate(value: string, days = 1) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}
export function displayDate(value: string) {
  return `${value === localDate() ? "Hoje · " : ""}${new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;
}
