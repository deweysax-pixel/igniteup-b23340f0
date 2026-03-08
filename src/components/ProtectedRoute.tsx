import { Navigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const { isDemoSession } = useDemo();

  // Demo session bypasses real auth checks entirely
  if (isDemoSession) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Access Restricted</h1>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
          <a href="/app" className="text-primary hover:underline text-sm">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
