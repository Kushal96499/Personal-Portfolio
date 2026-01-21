import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react';

export default function ServiceAvailabilityAdmin() {
    const [available, setAvailable] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            // Type assertion for new table not yet in generated types
            const { data, error } = await supabase
                .from('availability_status' as any)
                .select('*')
                .single();

            if (data && !error) {
                setAvailable((data as any).available);
                setMessage((data as any).message || '');
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async () => {
        setSaving(true);
        setSaveStatus('idle');

        try {
            // Get the current record first
            const { data: currentData } = await supabase
                .from('availability_status' as any)
                .select('id')
                .single();

            if (currentData) {
                const { error } = await supabase
                    .from('availability_status' as any)
                    .update({
                        available,
                        message: message.trim(),
                    })
                    .eq('id', (currentData as any).id);

                if (error) throw error;

                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Error updating availability:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-6 h-6 animate-spin text-white/60" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-[0_0_40px_rgba(76,140,255,0.1)]"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Service Availability Control</h2>
                        <p className="text-white/60 text-sm">Manage client project requests</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${available
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                        {available ? '✅ Available' : '❌ Unavailable'}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-5 bg-black/30 rounded-xl border border-white/10">
                        <div>
                            <h3 className="font-semibold text-white mb-1">Accept New Projects</h3>
                            <p className="text-white/50 text-sm">
                                {available
                                    ? 'Form submissions are enabled'
                                    : 'Form is disabled, clients see unavailable message'
                                }
                            </p>
                        </div>
                        <button
                            onClick={() => setAvailable(!available)}
                            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${available ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        >
                            <motion.div
                                layout
                                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                animate={{ x: available ? 32 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    {/* Custom Message */}
                    <div>
                        <label className="block text-sm font-semibold text-white/80 mb-2">
                            Custom Message (Optional)
                        </label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 focus:bg-black/60 transition-all"
                            placeholder="e.g., 'Booked until March 2026' (optional)"
                            maxLength={100}
                        />
                        <p className="text-xs text-white/40 mt-2">
                            This message will be shown to clients on the Services page
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={updateStatus}
                        disabled={saving}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw size={16} className="animate-spin" />
                                Updating...
                            </span>
                        ) : (
                            'Update Availability'
                        )}
                    </button>

                    {/* Status Messages */}
                    {saveStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3"
                        >
                            <Check size={20} className="text-green-400" />
                            <span className="text-green-400 text-sm font-medium">
                                Availability updated successfully!
                            </span>
                        </motion.div>
                    )}

                    {saveStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
                        >
                            <AlertCircle size={20} className="text-red-400" />
                            <span className="text-red-400 text-sm font-medium">
                                Failed to update. Please try again.
                            </span>
                        </motion.div>
                    )}

                    {/* Preview */}
                    <div className="mt-6 p-5 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs uppercase font-bold text-white/40 mb-3">Preview</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${available ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                            <span className={`text-sm font-medium ${available ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {available ? '✅ Available for new projects' : '❌ Not accepting new projects'}
                            </span>
                        </div>
                        {message && (
                            <p className="text-sm text-white/60 mt-2">{message}</p>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <div className="flex gap-3">
                            <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-400/80 leading-relaxed">
                                <strong className="text-blue-400">How it works:</strong>
                                <ul className="mt-2 space-y-1 text-xs">
                                    <li>• When available: Form is active and clients can submit requests</li>
                                    <li>• When unavailable: Form is disabled with WhatsApp fallback link</li>
                                    <li>• Changes apply instantly on the Services page</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
