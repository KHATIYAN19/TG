/*
  THE TRACKER. Template pages call track("gift_open", { id, title }) when the receiver does something worth telling the sender about.
  It does nothing unless the live viewer (/memories/<code>) has installed a tracker: the builder, the owner's preview and the home-page
  demos never report anything. Calls can never throw or slow the page down.
*/
let sink = null;
export const setTracker = (fn) => { sink = fn; };
export const track = (type, data) => { try { sink?.(type, data); } catch { /* reporting must never break the page */ } };
