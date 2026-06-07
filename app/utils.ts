const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
