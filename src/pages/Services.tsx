import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check, ArrowRight, Zap, Shield, Globe, Mail, MessageCircle,
    ChevronDown, ChevronUp, Code2, Layers, Smartphone, Lock,
    Rocket, Palette, Search, BarChart3, Upload, X, FileText
} from "lucide-react";
// @ts-nocheck
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";


// --- Custom Hooks ---

const useAvailability = () => {
    const [availability, setAvailability] = useState({ available: true, message: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                // Type assertion for new table not yet in generated types
                const { data, error } = await supabase
                    .from('availability_status' as any)
                    .select('*')
                    .single();

                if (data && !error) {
                    setAvailability({ available: (data as any).available, message: (data as any).message || "" });
                }
            } catch (err) {
                console.error('Error fetching availability:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, []);

    return { availability, loading };
};

// --- Data & Types ---

const services = [
    { icon: Globe, title: "Student Portfolio", desc: "Perfect for showcasing academic projects, skills, and achievements." },
    { icon: Rocket, title: "Professional Portfolio", desc: "Highlight your career experience and professional accomplishments." },
    { icon: Layers, title: "Business Website", desc: "Establish your brand with a modern online presence." },
    { icon: Palette, title: "Landing Page", desc: "Convert visitors into customers with focused design." },
    { icon: Search, title: "Basic SEO Setup", desc: "Optimize for search engines from day one." },
    { icon: BarChart3, title: "Responsive Design", desc: "Perfect display on all devices - mobile, tablet, and desktop." }
];

const plans = [
    {
        name: "Starter",
        price: "₹5,000 – ₹8,000",
        desc: "Perfect for portfolios and landing pages.",
        features: ["1–3 High-Speed Pages", "Mobile Responsive", "Contact Form", "Basic SEO"],
        cta: "Choose Starter",
        popular: false,
        autoFill: {
            plan: "Starter",
            budget: "₹5k – ₹8k",
            pages: "1–3",
            deadline: "1 week"
        }
    },
    {
        name: "Standard",
        price: "₹12,000 – ₹18,000",
        desc: "Ideal for growing businesses & startups.",
        features: ["4–7 Premium Pages", "Glassmorphism UI/UX", "CMS / Admin Panel", "Google Analytics", "Speed Optimization"],
        cta: "Choose Standard",
        popular: true,
        autoFill: {
            plan: "Standard",
            budget: "₹12k – ₹18k",
            pages: "4–7",
            deadline: "2 weeks"
        }
    },
    {
        name: "Premium",
        price: "₹25,000 – ₹40,000",
        desc: "Full-scale custom brand experience.",
        features: ["8–12 Custom Pages", "Advanced Animations (3D)", "Full SEO Suite", "Interactive Spline Elements", "Priority Support"],
        cta: "Coming Soon",
        popular: false,
        disabled: true,
        badge: "Not Available",
        badgeColor: "red"
    }
];

const whyChooseMe = [
    { icon: Code2, title: "Clean Code", desc: "Scalable, maintainable React/Next.js architecture that grows with your business." },
    { icon: Palette, title: "Modern UI/UX", desc: "Premium glassmorphism design systems with smooth animations." },
    { icon: Search, title: "SEO Ready", desc: "Built-in optimization, meta tags, and performance best practices." },
    { icon: Rocket, title: "Fast Support", desc: "Quick response times and transparent communication throughout." }
];

const processSteps = [
    { step: "01", title: "Discovery", desc: "Understanding your vision & goals." },
    { step: "02", title: "Strategy", desc: "Planning the structure & UX." },
    { step: "03", title: "Design", desc: "Crafting visual aesthetics." },
    { step: "04", title: "Development", desc: "Coding with precision." },
    { step: "05", title: "Testing", desc: "Ensuring zero bugs." },
    { step: "06", title: "Launch", desc: "Deploying to the world." }
];

const faqs = [
    { q: "How long does a project take?", a: "Basic sites take 2-4 days. Standard builds take 1-2 weeks. Complex projects usually require 3-4 weeks." },
    { q: "Do you offer post-launch support?", a: "Yes, I offer a 14-day support window for fixes. Maintenance packages are available for long-term updates." },
    { q: "What do you need from me?", a: "Your logo, brand guidelines (if any), content (text/images), and examples of websites you like." },
    { q: "Can you redesign my existing site?", a: "Absolutely. I can modernize your existing codebase or rebuild from scratch for better performance." },
    { q: "What is your payment structure?", a: "50% upfront to start the project, and the remaining 50% upon successful completion and approval." }
];

// --- Component ---

const ServicesPage = () => {
    const { availability, loading: availabilityLoading } = useAvailability();
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Advanced Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        whatsapp: "",
        plan: "",
        projectType: "",
        numPages: "",
        deadline: "",
        budget: "",
        features: [] as string[],
        attachment: null as File | null,
        message: "",
        website: "" // Honeypot field
    });

    // Multi-step OTP verification
    const [step, setStep] = useState<'form' | 'otp' | 'verified'>('form');
    const [otpCode, setOtpCode] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handlePlanSelect = (plan: typeof plans[0]) => {
        if (plan.disabled) return;

        if (plan.autoFill) {
            setFormData(prev => ({
                ...prev,
                plan: plan.autoFill!.plan,
                budget: plan.autoFill!.budget,
                numPages: plan.autoFill!.pages,
                deadline: plan.autoFill!.deadline,
                message: `I'm interested in the ${plan.name} plan. `
            }));
        }

        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFeatureToggle = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload only PDF, DOCX, PPT, PNG, or JPG files');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setFormData(prev => ({ ...prev, attachment: file }));
    };

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle Send OTP
    const handleSendOTP = async () => {
        setFormError("");
        setFieldErrors({});

        // Validate required fields
        const errors: Record<string, string> = {};
        if (!formData.fullName.trim()) errors.fullName = "Name is required";
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }
        if (!formData.message.trim()) errors.message = "Message is required";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        // Check honeypot
        if (formData.website && formData.website.trim() !== '') {
            setFormError('Invalid submission detected');
            return;
        }

        setOtpSending(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: formData.email,
                options: {
                    shouldCreateUser: true,
                    data: {
                        full_name: formData.fullName,
                    }
                }
            });

            if (error) throw error;

            setStep('otp');
            setCountdown(60); // 60 second countdown
        } catch (error: any) {
            console.error('OTP send error:', error);
            setFormError(error.message || 'Failed to send verification code');
        } finally {
            setOtpSending(false);
        }
    };

    // Handle Verify OTP
    const handleVerifyOTP = async () => {
        if (otpCode.length < 6) {
            setFormError('Please enter the verification code');
            return;
        }

        setOtpVerifying(true);
        setFormError('');

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otpCode,
                type: 'email'
            });

            if (error) throw error;

            if (data.session) {
                setStep('verified');
            }
        } catch (error: any) {
            console.error('OTP verify error:', error);
            setFormError(error.message || 'Invalid verification code');
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only allow submit if verified
        if (step !== 'verified') {
            setFormError('Please verify your email first');
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        try {
            // Get authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Please verify your email first');
            }

            // Insert lead directly to Supabase (RLS will allow authenticated users)
            const { error: insertError } = await supabase
                // @ts-ignore
                .from('leads')
                .insert([{
                    name: formData.fullName,
                    email: user.email!, // Verified email
                    phone: formData.whatsapp,
                    whatsapp: formData.whatsapp,
                    plan: formData.plan,
                    project_type: formData.projectType,
                    pages: formData.numPages ? parseInt(formData.numPages) : null,
                    deadline: formData.deadline,
                    budget: formData.budget,
                    features: formData.features,
                    message: formData.message,
                    // user_id will be auto-set by trigger
                }]);

            if (insertError) throw insertError;

            // Send notification emails
            try {
                await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-mail`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        name: formData.fullName,
                        email: user.email,
                        message: formData.message,
                        whatsapp: formData.whatsapp,
                        plan: formData.plan,
                        projectType: formData.projectType,
                    }),
                });
            } catch (emailError) {
                console.error('Email notification error:', emailError);
                // Don't fail if email fails
            }

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 8000);

            // Reset form and step
            setFormData({
                fullName: "",
                email: "",
                whatsapp: "",
                plan: "",
                projectType: "",
                numPages: "",
                deadline: "",
                budget: "",
                features: [],
                attachment: null,
                message: "",
                website: ""
            });
            setStep('form');
            setOtpCode('');

            // Sign out user (one-time session)
            await supabase.auth.signOut();

        } catch (error: any) {
            console.error('Submission error:', error);
            setFormError(error.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <>
            <SEO
                title="Web Development Services"
                description="Professional web development services for students and businesses. Get modern, responsive portfolio websites with React, Next.js, and Tailwind CSS. Student-friendly pricing and fast delivery."
                keywords="Web Development Services, Portfolio Development, React Developer, Next.js, Tailwind CSS, Student Portfolio, Business Website, Freelance Web Developer, Modern Web Design"
                pathname="/services"
            />
            <div className="relative min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 overflow-hidden">

                {/* Animated Background Glows */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10">
                    {/* HERO SECTION */}
                    <section className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-24">
                        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                {/* Availability Badge */}
                                <div className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm mb-6",
                                    availability.available
                                        ? "bg-green-500/10 border-green-500/30"
                                        : "bg-red-500/10 border-red-500/30"
                                )}>
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                        availability.available ? "bg-green-500" : "bg-red-500"
                                    )} />
                                    <span className={availability.available ? "text-green-400" : "text-red-400"}>
                                        {availability.available ? "✅ Available for new projects" : "❌ Not accepting new projects"}
                                    </span>
                                </div>

                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                                    Premium websites <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">that convert.</span>
                                </h1>
                                <p className="text-lg text-white/50 max-w-lg mb-8 leading-relaxed">
                                    I help students & working professionals build professional portfolios and businesses establish their online presence.
                                    Focusing on clean design, speed, and modern aesthetics.
                                </p>

                                <div className="flex flex-wrap gap-4 mb-12">
                                    <button
                                        onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: 'smooth' })}
                                        className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                                        disabled={!availability.available}
                                    >
                                        Start a Project
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all backdrop-blur-md"
                                    >
                                        View Pricing
                                    </button>
                                </div>

                                {!availability.available && (
                                    <p className="text-white/60 text-sm">
                                        Currently unavailable — please{' '}
                                        <a href="https://wa.me/918559837175" className="text-blue-400 underline hover:text-blue-300">
                                            WhatsApp me
                                        </a>{' '}
                                        for urgent requests.
                                    </p>
                                )}
                            </motion.div>

                            {/* Right Side Visual */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="relative hidden lg:block h-[500px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl opacity-30" />
                                <div className="relative z-10 w-full h-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(76,140,255,0.15)]">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                                                <Zap size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">Kushal Kumawat</h3>
                                                <p className="text-sm text-white/50">Full-Stack Developer</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-mono border border-green-500/20">Verified</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        {/* Projects Completed */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="h-32 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 backdrop-blur-sm p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all group"
                                        >
                                            <div className="text-blue-400 opacity-70">
                                                <Code2 size={20} />
                                            </div>
                                            <div>
                                                <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">Portfolio</div>
                                                <div className="text-xs text-white/50 mt-1">Specialist</div>
                                            </div>
                                        </motion.div>

                                        {/* Students & Professionals */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="h-32 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 backdrop-blur-sm p-5 flex flex-col justify-between hover:border-green-500/40 transition-all group"
                                        >
                                            <div className="text-green-400 opacity-70">
                                                <Check size={20} />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">Students +</div>
                                                <div className="text-xs text-white/50 mt-1">Professionals</div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Quick Turnaround */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-purple-400">
                                                <Rocket size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-white/90 group-hover:text-purple-400 transition-colors">Quality Work</div>
                                                <div className="text-xs text-white/50">Modern & Professional</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* WHAT I OFFER */}
                    <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4 tracking-tight">What I Offer</h2>
                                <p className="text-white/50 max-w-2xl mx-auto">Professional web development services tailored to your needs</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="group p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(76,140,255,0.15)]"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                            <service.icon size={28} className="text-white/80 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-white">{service.title}</h3>
                                        <p className="text-sm text-white/60 leading-relaxed">{service.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* PRICING */}
                    <section id="pricing" className="py-32">
                        <div className="container mx-auto px-6 max-w-6xl">
                            <div className="text-center mb-20">
                                <h2 className="text-4xl font-bold mb-4 tracking-tight">Transparent Pricing</h2>
                                <p className="text-white/50">No hidden fees. Pay for what you need.</p>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8 items-start">
                                {plans.map((plan, idx) => (
                                    <div key={idx} className={cn(
                                        "p-8 rounded-3xl border transition-all duration-300 relative group",
                                        plan.disabled
                                            ? "bg-white/[0.01] border-white/5 opacity-75"
                                            : plan.popular
                                                ? "bg-white/[0.03] border-white/20 shadow-2xl shadow-blue-900/10 scale-105 z-10 hover:-translate-y-1"
                                                : "bg-transparent border-white/10 hover:bg-white/[0.02] hover:-translate-y-1"
                                    )}>
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                                Most Popular
                                            </div>
                                        )}
                                        {plan.disabled && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                                {plan.badge}
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <p className="text-sm text-white/50 mb-6 min-h-[40px] leading-relaxed">{plan.desc}</p>
                                        <div className="text-3xl font-bold mb-8 tracking-tight">{plan.price}</div>

                                        <button
                                            onClick={() => handlePlanSelect(plan)}
                                            disabled={plan.disabled}
                                            className={cn(
                                                "w-full py-3 rounded-xl font-semibold mb-8 transition-all",
                                                plan.disabled
                                                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                                                    : plan.popular
                                                        ? "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
                                                        : "bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
                                            )}
                                        >
                                            {plan.cta}
                                        </button>

                                        <ul className="space-y-4">
                                            {plan.features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                                                    <Check size={16} className="mt-0.5 text-white/60 shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* PROCESS */}
                    <section className="py-24 border-y border-white/5 bg-white/[0.01]">
                        <div className="container mx-auto px-6 max-w-7xl">
                            <h2 className="text-3xl font-bold mb-16 text-center tracking-tight">Development Process</h2>
                            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8 relative">
                                <div className="hidden lg:block absolute top-[2.25rem] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                {processSteps.map((s, i) => (
                                    <div key={i} className="relative group">
                                        <div className="w-10 h-10 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center text-sm font-bold text-white/50 mb-6 relative z-10 group-hover:border-white/30 group-hover:text-white transition-colors mx-auto lg:mx-0">
                                            {s.step}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 text-center lg:text-left">{s.title}</h3>
                                        <p className="text-xs text-white/50 leading-relaxed text-center lg:text-left">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* WHY CHOOSE ME */}
                    <section className="py-24 border-t border-white/5 bg-white/[0.01]">
                        <div className="container mx-auto px-6 max-w-6xl">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold mb-4 tracking-tight">Why Choose Me</h2>
                                <p className="text-white/50 max-w-2xl mx-auto">What sets my work apart from the rest</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {whyChooseMe.map((point, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="group p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_0_30px_rgba(76,140,255,0.12)]"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                                <point.icon size={24} className="text-white/80 group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-2 text-white">{point.title}</h3>
                                                <p className="text-sm text-white/60 leading-relaxed">{point.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* FAQ & ADVANCED CONTACT FORM */}
                    <section id="contact" className="py-24 border-t border-white/5 bg-white/[0.01]">
                        <div className="container mx-auto px-6 max-w-6xl">
                            <div className="grid lg:grid-cols-2 gap-16 items-start">

                                {/* Left: FAQ */}
                                <div>
                                    <h2 className="text-3xl font-bold mb-8 tracking-tight">Common Questions</h2>
                                    <div className="space-y-4 mb-8">
                                        {faqs.map((faq, idx) => (
                                            <div key={idx} className="border-b border-white/10 pb-4">
                                                <button
                                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                                    className="w-full flex justify-between items-center text-left py-2 hover:text-white transition-colors group"
                                                >
                                                    <span className="font-medium group-hover:text-white/90 text-white/70">{faq.q}</span>
                                                    {openFaq === idx ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                                                </button>
                                                <AnimatePresence>
                                                    {openFaq === idx && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="pt-2 text-white/50 text-sm leading-relaxed pb-2">{faq.a}</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Combined Trust & Value Section */}
                                    <div className="grid grid-cols-1 gap-5">
                                        {/* What You'll Get - Compact */}
                                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Layers size={18} className="text-purple-400" />
                                                <h3 className="font-bold text-white">What's Included</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                                                <div className="flex items-center gap-1.5">
                                                    <Globe size={14} className="text-blue-400 shrink-0" />
                                                    <span>Modern Stack</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Smartphone size={14} className="text-green-400 shrink-0" />
                                                    <span>Responsive</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Lock size={14} className="text-purple-400 shrink-0" />
                                                    <span>Free Hosting</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Code2 size={14} className="text-orange-400 shrink-0" />
                                                    <span>Source Code</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Student Pricing - Compact */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl">
                                            <div className="flex items-center gap-2">
                                                <Zap size={16} className="text-purple-400 shrink-0" />
                                                <div>
                                                    <p className="text-sm text-white/90 font-medium">Student-Friendly Pricing</p>
                                                    <p className="text-xs text-white/50 mt-0.5">Special rates available</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Work Showcase */}
                                        <div className="mt-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Rocket size={18} className="text-blue-400" />
                                                <h3 className="font-bold text-white">Recent Work</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {/* Project 1 */}
                                                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-all group cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                                            <Globe size={18} className="text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Portfolio Website</h4>
                                                            <p className="text-xs text-white/50 mt-0.5">Modern React portfolio with animations</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Project 2 */}
                                                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/10 hover:border-green-500/30 transition-all group cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                                                            <Code2 size={18} className="text-green-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors">Business Dashboard</h4>
                                                            <p className="text-xs text-white/50 mt-0.5">Admin panel with analytics</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Project 3 */}
                                                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-all group cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                                            <Layers size={18} className="text-purple-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">E-Commerce Site</h4>
                                                            <p className="text-xs text-white/50 mt-0.5">Full-stack online store</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Advanced Intake Form */}
                                <div className="relative">
                                    <div className={cn(
                                        "bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-xl transition-all",
                                        !availability.available && "opacity-50"
                                    )}>
                                        <h2 className="text-2xl font-bold mb-6 tracking-tight">Start Your Project</h2>

                                        {!availability.available && (
                                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                                <p className="text-red-400 text-sm">
                                                    Currently unavailable — please{' '}
                                                    <a href="https://wa.me/918559837175" className="underline font-semibold">
                                                        WhatsApp me
                                                    </a>{' '}
                                                    for urgent requests.
                                                </p>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Row 1: Full Name */}
                                            <div>
                                                <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Full Name *</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                    disabled={!availability.available}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all disabled:opacity-50"
                                                    placeholder="Your name"
                                                />
                                            </div>

                                            {/* Row 2: Email & WhatsApp */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Email *</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        disabled={!availability.available}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all disabled:opacity-50"
                                                        placeholder="Your email"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">WhatsApp *</label>
                                                    <input
                                                        required
                                                        type="tel"
                                                        value={formData.whatsapp}
                                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                                        disabled={!availability.available}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all disabled:opacity-50"
                                                        placeholder="+1234567890"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: Plan & Project Type */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Select Plan *</label>
                                                    <select
                                                        required
                                                        value={formData.plan}
                                                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                                        disabled={!availability.available}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all appearance-none disabled:opacity-50"
                                                    >
                                                        <option value="" className="bg-zinc-900">Choose a plan...</option>
                                                        <option value="Starter" className="bg-zinc-900">Starter</option>
                                                        <option value="Standard" className="bg-zinc-900">Standard</option>
                                                        <option value="Premium" className="bg-zinc-900" disabled>Premium (Coming Soon)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Project Type *</label>
                                                    <select
                                                        required
                                                        value={formData.projectType}
                                                        onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                                                        disabled={!availability.available}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all appearance-none disabled:opacity-50"
                                                    >
                                                        <option value="" className="bg-zinc-900">Select type...</option>
                                                        <option value="Portfolio" className="bg-zinc-900">Portfolio</option>
                                                        <option value="Business Website" className="bg-zinc-900">Business Website</option>
                                                        <option value="Landing Page" className="bg-zinc-900">Landing Page</option>
                                                        <option value="UI Redesign" className="bg-zinc-900">UI Redesign</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 4: Pages & Deadline */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Number of Pages *</label>
                                                    <select
                                                        required
                                                        value={formData.numPages}
                                                        onChange={e => setFormData({ ...formData, numPages: e.target.value })}
                                                        disabled={!availability.available}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all appearance-none disabled:opacity-50"
                                                    >
                                                        <option value="" className="bg-zinc-900">Select...</option>
                                                        <option value="1–3" className="bg-zinc-900">1–3 Pages</option>
                                                        <option value="4–7" className="bg-zinc-900">4–7 Pages</option>
                                                        <option value="8–12" className="bg-zinc-900">8–12 Pages</option>
                                                        <option value="More than 12" className="bg-zinc-900">More than 12</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Deadline *</label>
                                                    <select
                                                        required
                                                        value={formData.deadline}
                                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                                        disabled={!availability.available}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all appearance-none disabled:opacity-50"
                                                    >
                                                        <option value="" className="bg-zinc-900">Select...</option>
                                                        <option value="Urgent" className="bg-zinc-900">Urgent (&lt; 1 week)</option>
                                                        <option value="1 week" className="bg-zinc-900">1 week</option>
                                                        <option value="2 weeks" className="bg-zinc-900">2 weeks</option>
                                                        <option value="Flexible" className="bg-zinc-900">Flexible</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 5: Budget */}
                                            <div>
                                                <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Budget *</label>
                                                <select
                                                    required
                                                    value={formData.budget}
                                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                                    disabled={!availability.available}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all appearance-none disabled:opacity-50"
                                                >
                                                    <option value="" className="bg-zinc-900">Select budget...</option>
                                                    <option value="₹5k – ₹8k" className="bg-zinc-900">₹5k – ₹8k</option>
                                                    <option value="₹12k – ₹18k" className="bg-zinc-900">₹12k – ₹18k</option>
                                                    <option value="₹25k – ₹40k" className="bg-zinc-900">₹25k – ₹40k</option>
                                                    <option value="Custom" className="bg-zinc-900">Custom (Let's Discuss)</option>
                                                </select>
                                            </div>

                                            {/* Row 6: Features Checkboxes */}
                                            <div>
                                                <label className="text-xs uppercase font-bold text-white/40 mb-3 block tracking-wider">Required Features</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['WhatsApp Integration', 'Contact Form', 'Google Maps', 'SEO Setup', 'Animations', 'Admin Panel'].map(feature => (
                                                        <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.features.includes(feature)}
                                                                onChange={() => handleFeatureToggle(feature)}
                                                                disabled={!availability.available}
                                                                className="w-4 h-4 rounded border-white/20 bg-black/40 checked:bg-blue-500 disabled:opacity-50"
                                                            />
                                                            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{feature}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Row 7: File Upload */}
                                            <div>
                                                <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">
                                                    Upload Requirements (PDF, DOCX, PPT, Images)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                                                        onChange={handleFileChange}
                                                        disabled={!availability.available}
                                                        className="hidden"
                                                        id="file-upload"
                                                    />
                                                    <label
                                                        htmlFor="file-upload"
                                                        className={cn(
                                                            "w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-lg cursor-pointer transition-all",
                                                            formData.attachment ? "bg-blue-500/10 border-blue-500/30" : "bg-black/40 hover:bg-black/60",
                                                            !availability.available && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {formData.attachment ? (
                                                            <>
                                                                <FileText size={18} className="text-blue-400" />
                                                                <span className="text-sm text-blue-400">{formData.attachment.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setFormData({ ...formData, attachment: null });
                                                                    }}
                                                                    className="ml-auto text-white/60 hover:text-white"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload size={18} className="text-white/60" />
                                                                <span className="text-sm text-white/60">Click to upload (max 10MB)</span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Row 8: Message */}
                                            <div>
                                                <label className="text-xs uppercase font-bold text-white/40 mb-2 block tracking-wider">Project Details *</label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={formData.message}
                                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                    disabled={!availability.available}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all resize-none disabled:opacity-50"
                                                    placeholder="Tell me about your project requirements, goals, and any specific features you need..."
                                                    minLength={20}
                                                />
                                            </div>

                                            {/* Honeypot Field - Hidden */}
                                            <input
                                                type="text"
                                                name="website"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                style={{ position: 'absolute', left: '-5000px' }}
                                                tabIndex={-1}
                                                autoComplete="off"
                                                aria-hidden="true"
                                            />

                                            {/* Error Messages */}
                                            {formError && (
                                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                        <p className="text-red-400 text-sm">{formError}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {Object.keys(fieldErrors).length > 0 && (
                                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg space-y-1 animate-in fade-in slide-in-from-top-2">
                                                    {Object.entries(fieldErrors).map(([field, error]) => (
                                                        <p key={field} className="text-yellow-400 text-sm flex items-center gap-2">
                                                            <span className="w-1 h-1 rounded-full bg-yellow-400" />
                                                            {error}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Multi-step Actions */}
                                            <div className="pt-2">
                                                {step === 'form' && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSendOTP}
                                                        disabled={otpSending || !availability.available}
                                                        className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                                                    >
                                                        {otpSending ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                                Sending Code...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Send Verification Code <ArrowRight size={18} />
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                {step === 'otp' && (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                    <Mail size={20} className="text-blue-400" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-medium">Verify your email</h4>
                                                                    <p className="text-white/60 text-sm">Code sent to {formData.email}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={otpCode}
                                                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                                                    placeholder="Enter code"
                                                                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-white/40 focus:bg-black/60 transition-all placeholder:text-white/20 placeholder:tracking-normal placeholder:font-sans"
                                                                    maxLength={8}
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={handleVerifyOTP}
                                                                    disabled={otpVerifying || otpCode.length < 6}
                                                                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                                >
                                                                    {otpVerifying ? (
                                                                        <>
                                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                            Verifying...
                                                                        </>
                                                                    ) : "Verify Code"}
                                                                </button>
                                                            </div>

                                                            <div className="mt-4 text-center">
                                                                {countdown > 0 ? (
                                                                    <p className="text-white/40 text-xs">Resend code in {countdown}s</p>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleSendOTP();
                                                                            setOtpCode("");
                                                                        }}
                                                                        className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                                                                    >
                                                                        Resend Code
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => setStep('form')}
                                                            className="w-full py-2 text-white/40 hover:text-white text-sm transition-colors"
                                                        >
                                                            Cancel Verification
                                                        </button>
                                                    </div>
                                                )}

                                                {step === 'verified' && (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                                <Check size={16} className="text-green-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-green-400 font-medium text-sm">Email Verified Successfully!</p>
                                                                <p className="text-white/40 text-xs">{formData.email}</p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            disabled={isSubmitting || !availability.available}
                                                            type="submit"
                                                            className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                                    Sending Request...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Send Service Request <Zap size={18} className="fill-black" />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </form>

                                        {/* Success Toast */}
                                        <AnimatePresence>
                                            {showSuccess && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                            <Check size={16} className="text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-green-400 font-semibold text-sm">Request Submitted Successfully!</p>
                                                            <p className="text-green-400/70 text-xs">I'll contact you within 24 hours.</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FOOTER */}
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default ServicesPage;

