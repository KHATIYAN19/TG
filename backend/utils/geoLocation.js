import geoip from "geoip-lite";

/*
  Approximate location of a sign-in, e.g. "Agra, Uttar Pradesh, India".

  1. Edge/CDN headers when the app sits behind Vercel, Cloudflare or CloudFront.
  2. Otherwise an offline IP database (no IP is sent to any third party).

  IP geolocation is city-level at best: mobile networks in particular often
  resolve to the carrier's nearest hub rather than the user's exact city.
*/

const IN_STATES = {
  AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar", CT: "Chhattisgarh",
  GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh", JH: "Jharkhand",
  KA: "Karnataka", KL: "Kerala", MP: "Madhya Pradesh", MH: "Maharashtra", MN: "Manipur",
  ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OR: "Odisha", PB: "Punjab",
  RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TG: "Telangana", TR: "Tripura",
  UP: "Uttar Pradesh", UT: "Uttarakhand", WB: "West Bengal", DL: "Delhi", JK: "Jammu and Kashmir",
  LA: "Ladakh", CH: "Chandigarh", PY: "Puducherry", AN: "Andaman and Nicobar Islands",
  DN: "Dadra and Nagar Haveli and Daman and Diu", LD: "Lakshadweep",
};

let countryNames;
const countryName = (code) => {
  if (!code) return "";
  try {
    countryNames ||= new Intl.DisplayNames(["en"], { type: "region" });
    return countryNames.of(code) || code;
  } catch {
    return code;
  }
};

const clean = (v) =>
  decodeURIComponent(String(v || ""))
    .replace(/[^\p{L}\p{N} .,'()\-]/gu, "")
    .trim()
    .slice(0, 80);

const isPrivate = (ip) =>
  !ip ||
  /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80)/i.test(ip.replace(/^::ffff:/, ""));

export const locationFromRequest = (req) => {
  try {
    const h = req.headers || {};
    const headerCity = clean(h["x-vercel-ip-city"] || h["cf-ipcity"] || h["cloudfront-viewer-city"]);
    const headerRegion = clean(h["x-vercel-ip-country-region"] || h["cf-region-code"] || h["cloudfront-viewer-country-region-name"]);
    const headerCountry = clean(h["x-vercel-ip-country"] || h["cf-ipcountry"] || h["cloudfront-viewer-country"]);

    if (headerCity || headerCountry) {
      const country = headerCountry.length === 2 ? headerCountry.toUpperCase() : headerCountry;
      return buildLocation(headerCity, headerRegion, country);
    }
    return locationFromIp(req.ip);
  } catch {
    return null;
  }
};

export const locationFromIp = (ipRaw) => {
  const ip = String(ipRaw || "").replace(/^::ffff:/, "");
  if (isPrivate(ip)) return null;
  const hit = geoip.lookup(ip);
  if (!hit) return null;
  return buildLocation(hit.city, hit.region, hit.country);
};

const buildLocation = (city, region, country) => {
  const regionName = country === "IN" && IN_STATES[region] ? IN_STATES[region] : region;
  const countryFull = country && country.length === 2 ? countryName(country) : country;
  const text = [city, regionName, countryFull].filter(Boolean).join(", ");
  if (!text) return null;
  return { city: city || "", region: regionName || "", country: countryFull || "", text };
};
