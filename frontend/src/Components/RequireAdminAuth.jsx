import { Navigate } from "react-router";
import { getAdminToken } from "../config/adminAuth";

// Client-side gate: keeps logged-out visitors from ever rendering the
// dashboard shell. Real enforcement still happens on the backend — every
// admin API call requires the JWT, and adminFetch() clears/redirects on 401.
const RequireAdminAuth = ({ children }) => {
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default RequireAdminAuth;