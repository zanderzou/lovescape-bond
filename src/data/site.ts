export const site = {
  name: "Lovescape",
  domain: "lovescape.bond",
  url: "https://lovescape.bond",
  description: "Independent Lovescape research on fictional AI companions, custom characters, chat, generated media, Chips, privacy, safety, and alternatives.",
  author: "Lovescape editorial team",
  officialUrl: "https://lovescape.com/",
};
export const formatDate = (date: Date) => new Intl.DateTimeFormat("en-US", { year:"numeric", month:"long", day:"numeric", timeZone:"UTC" }).format(date);
export const toIsoDate = (date: Date) => date.toISOString().slice(0,10);
