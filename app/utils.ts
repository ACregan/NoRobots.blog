const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const listFormatter = new Intl.ListFormat("en-GB", {
  style: "long",
  type: "conjunction",
});

export function formatNameList(names: string[]): string {
  return listFormatter.format(names);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function estimateReadTime(textContent: string): string {
  const words = textContent.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 225));

  if (minutes < 60) {
    return `${minutes} Minute${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = Math.round((minutes % 60) / 5) * 5;

  if (remainder === 0) {
    return `Approx ${hours} Hour${hours > 1 ? "s" : ""}`;
  }
  if (remainder === 60) {
    return `Approx ${hours + 1} Hours`;
  }
  return `${hours} Hour${hours > 1 ? "s" : ""}, ${remainder} Minute${remainder > 1 ? "s" : ""}`;
}
