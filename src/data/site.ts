export const site = {
  name: "Lovescape",
  domain: "lovescape.bond",
  url: "https://lovescape.bond",
  description: "An independent Lovescape guide to AI companions, custom characters, private chat, image and video generation, Chips, pricing, safety, and alternatives.",
  author: "Lovescape Guide editorial team",
  officialUrl: "https://lovescape.com/",
};
export const formatDate = (date: Date) => new Intl.DateTimeFormat("en-US", { year:"numeric", month:"long", day:"numeric", timeZone:"UTC" }).format(date);
export const toIsoDate = (date: Date) => date.toISOString().slice(0,10);
