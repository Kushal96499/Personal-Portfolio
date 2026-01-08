import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center bg-[#070709] p-4 relative overflow-hidden" data-admin-panel>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_40%),linear-gradient(to_bottom,#070709,#0D0D11,#121218)]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20200%20200%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noiseFilter%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%220.65%22%20numOctaves=%223%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noiseFilter)%22%20opacity=%220.03%22/%3E%3C/svg%3E')] opacity-20 pointer-events-none" />

            {/* Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse-glow delay-1000" />

            <Card className="w-full max-w-md bg-white/[0.03] border-white/[0.08] backdrop-blur-xl shadow-premium relative overflow-hidden z-10">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

                <CardHeader className="space-y-2 text-center relative z-10 pt-8">
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">
                        Admin <span className="text-gradient-premium">Access</span>
                    </CardTitle>
                    <CardDescription className="text-white/60">
                        Enter your credentials to access the control panel
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 pb-8 px-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white/80 ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter Admin Email"
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/80 ml-1">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 h-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transition-all duration-300 h-11 font-medium text-lg group"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Login <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
