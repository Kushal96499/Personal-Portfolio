import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, Mail } from 'lucide-react';
import { api } from '@/services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {


            // Try Supabase authentication
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;



            // Log the successful login
            await api.logAdminAction('login_success', { email });

            toast.success('Welcome back, Admin!');
            navigate('/admin');


        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden" data-admin-panel>
            {/* Background Effects */}
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
            <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
            <div className="absolute w-96 h-96 bg-secondary/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-1000" />

            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,255,255,0.2)]">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold font-orbitron text-gradient">
                        Admin Access
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access the control panel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter Admin Email"
                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-9 bg-background/50 border-primary/20 focus:border-primary"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
