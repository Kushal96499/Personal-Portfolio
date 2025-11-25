import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, signOut } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            // 1. Check if user is logged in
            if (user?.last_sign_in_at) {
                const lastSignIn = new Date(user.last_sign_in_at).getTime();
                const now = Date.now();
                const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes

                // 2. Check if session is expired
                if (now - lastSignIn > SESSION_TIMEOUT) {
                    await signOut();
                    // Toast is now safe here because we are definitely on a protected route
                    // (toast import needed if not present, but useAuth handles toast in signOut usually? 
                    // No, AuthContext handles toast. But we might want a specific "Session Expired" message)
                    // Actually AuthContext signOut shows "Logged out successfully". 
                    // We should probably show "Session expired" here.
                    // But wait, signOut in AuthContext shows success toast. 
                    // Let's just let it be for now or add a specific error toast.
                }
            }
            setIsChecking(false);
        };

        if (!loading) {
            checkSession();
        }
    }, [user, loading, signOut]);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
