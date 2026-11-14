import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.ts';
import { LoadingState } from '../common/LoadingState.tsx';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button.tsx';

interface ProtectedRouteProps {
  requiredPermission?: string;
  requiredRole?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requiredRole,
  children,
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]">
        <LoadingState message="Verifying administrative access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-xl border border-[#D9C6A5]/50 max-w-lg mx-auto my-12 shadow-xs">
        <div className="p-3 bg-red-50 text-red-600 rounded-full mb-3 border border-red-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#24231F]">Access Restricted</h3>
        <p className="mt-1 text-xs text-[#5C5850] max-w-sm">
          Your administrative account does not possess the capability code (
          <code className="text-[#315B3B] font-mono">{requiredPermission}</code>) required to
          view this section.
        </p>
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-xl border border-[#D9C6A5]/50 max-w-lg mx-auto my-12 shadow-xs">
        <div className="p-3 bg-red-50 text-red-600 rounded-full mb-3 border border-red-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#24231F]">Role Required</h3>
        <p className="mt-1 text-xs text-[#5C5850] max-w-sm">
          This operation is reserved for accounts with the{' '}
          <strong className="text-[#24231F]">{requiredRole}</strong> role.
        </p>
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
