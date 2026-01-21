import { SEO } from '@/components/SEO';
import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
    return (
        <>
            <SEO
                title="Page Not Found"
                description="The page you're looking for doesn't exist. Return to homepage to explore Kushal Kumawat's portfolio."
                pathname="/404"
            />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div className="relative">
                        {/* Glassmorphism container */}
                        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 shadow-2xl">
                            {/* Animated 404 */}
                            <div className="text-9xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 animate-pulse">
                                404
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Page Not Found
                            </h1>

                            <p className="text-gray-400 text-lg mb-8">
                                Oops! The page you're looking for doesn't exist or has been moved.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Home className="w-5 h-5" />
                                    Back to Home
                                </Link>

                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold backdrop-blur-sm border border-white/10 transition-all duration-300"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Go Back
                                </button>
                            </div>
                        </div>

                        {/* Decorative gradient orbs */}
                        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-75" />
                    </div>

                    {/* Quick Links */}
                    <div className="mt-12 text-sm text-gray-500">
                        <p className="mb-3">You might be looking for:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/services" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                Services
                            </Link>
                            <Link to="/work" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                Work
                            </Link>
                            <Link to="/blog" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                Blog
                            </Link>
                            <Link to="/contact" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
