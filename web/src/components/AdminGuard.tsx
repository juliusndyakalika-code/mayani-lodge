import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login?redirect=/admin" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}
