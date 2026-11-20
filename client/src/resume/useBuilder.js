import { useEffect, useState } from "react";

import { builderStatus, cachedBuilderMode, fetchBuilderMode } from "./api";

/*
  The resume builder is switched on and off by an admin (Resume Lab admin, "Builder" tab).

  useBuilderMode()    public: "on" | "existing" | "off". Used by the landing and plans pages to decide whether to MENTION the builder.
                      Only "on" shows it to everyone.
  useBuilderStatus()  signed in: { visible, canBuild, left, allowed, loading }. `visible` is what menus use: it is true for everyone when the
                      builder is on, and in "existing" mode only for people who already hold builder credits or builder resumes.
*/
export function useBuilderMode() {
  const [mode, setMode] = useState(cachedBuilderMode);
  useEffect(() => {
    let dead = false;
    fetchBuilderMode().then((m) => { if (!dead) setMode(m); });
    return () => { dead = true; };
  }, []);
  return mode;
}

export function useBuilderStatus() {
  const [s, setS] = useState({ loading: true, visible: false, canBuild: false, left: 0, allowed: 0, mode: "off" });
  useEffect(() => {
    let dead = false;
    builderStatus().then((x) => { if (!dead) setS({ loading: false, ...x }); }).catch(() => { if (!dead) setS((o) => ({ ...o, loading: false })); });
    return () => { dead = true; };
  }, []);
  return s;
}
