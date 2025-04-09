import { Navigate } from "react-router";
import { useSession } from "@/context/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}