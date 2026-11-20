import { createContext, useContext } from "react";

/*
  The signed-in space's shared data, filled by ResumeApp with ONE call (GET /api/resume/app):
    data: { plans, summary, unfinished, builder, recent, totals, vault: { files, max }, lastProfile }
    refresh()     fetch it again (after a payment or a new review)
    setVault(v)   put a vault answer ({ files, max }) in place without fetching
*/
export const AppData = createContext({ data: null, error: "", refresh: () => Promise.resolve(null), setVault: () => {} });
export const useApp = () => useContext(AppData);
