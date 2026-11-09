import { useEffect, useState } from "react";

import { fetchPublicInfo } from "../api";
import { PAGE_LIFETIME_DAYS } from "./constants";

/*
  How many days a page stays online is an admin setting stored in the database. Anything that mentions it (the FAQ, the legal pages,
  the app) reads it from here, so changing it in the admin changes the wording everywhere. Until the answer arrives it shows the default.
*/
let cached = null;
let pending = null;
const listeners = new Set();

const load = () => {
  if (cached != null || pending) return;
  pending = fetchPublicInfo()
    .then((d) => { if (d?.pageLifetimeDays) { cached = d.pageLifetimeDays; listeners.forEach((f) => f(cached)); } })
    .catch(() => { /* the default stays */ })
    .finally(() => { pending = null; });
};

export function useLifetimeDays() {
  const [days, setDays] = useState(cached ?? PAGE_LIFETIME_DAYS);
  useEffect(() => {
    listeners.add(setDays);
    load();
    return () => { listeners.delete(setDays); };
  }, []);
  return days;
}

/** `<D />` prints the number of days inside text. */
export const D = () => <>{useLifetimeDays()}</>;
