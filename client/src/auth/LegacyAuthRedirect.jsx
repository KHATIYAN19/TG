import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { loginUrl, redirectFromState, safeRedirect, DEFAULT_AFTER_LOGIN } from "./authRedirect";

/*
  The old sign-in addresses (/admin/login, /resume-review/login, /prep-buddy/signup, ...) now lead to the one shared page.
  Bookmarks, old emails and cached links keep working, and the place a person was heading to is kept.
    mode      "login" | "signup"  (a ?mode=login / ?mode=signup on the old address wins)
    fallback  where to go afterwards when the old link did not say (e.g. the Resume Lab member area)
*/
export default function LegacyAuthRedirect({ mode = "login", fallback = DEFAULT_AFTER_LOGIN }) {
  const location = useLocation();
  const [params] = useSearchParams();
  const wanted = params.get("mode") === "login" || params.get("mode") === "signup" ? params.get("mode") : mode;
  const target = safeRedirect(params.get("redirect")) || redirectFromState(location.state) || fallback;
  return <Navigate to={loginUrl(target, wanted)} replace state={location.state} />;
}
