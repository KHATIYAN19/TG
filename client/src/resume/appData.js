import { createContext } from "react";

/* The signed-in area's shared data: { data: { plans, summary, unfinished }, error }. Filled by ResumeApp. */
export const AppData = createContext({ data: null, error: "" });
