import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Give a moment for auth to initialize
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!user) {

        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }


    return <>{children}</>;
};
