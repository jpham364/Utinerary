import { Navigate } from "react-router";
import { useSession } from "@/context/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();

  if (session === undefined) {
    return <div className="p-4"></div>; // or a spinner
  }

  if (session === null) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}