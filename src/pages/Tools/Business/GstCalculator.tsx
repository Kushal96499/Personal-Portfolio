import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, RotateCcw, ArrowRight, Percent } from "lucide-react";
import { motion } from "framer-motion";

const GstCalculator = () => {
    // Inputs
    const [amount, setAmount] = useState<number | "">("");
    const [gstRate, setGstRate] = useState<number>(18);
    const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive"); // exclusive = Add GST, inclusive = Remove GST
    const [taxType, setTaxType] = useState<"split" | "igst">("split"); // split = CGST+SGST, igst = IGST

    // Results
    const [baseAmount, setBaseAmount] = useState<number>(0);
    const [gstAmount, setGstAmount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const RATES = [0, 5, 12, 18, 28];

    // Calculation Logic
    useEffect(() => {
        const val = Number(amount) || 0;

        if (mode === "exclusive") {
            // Add GST to Amount
            const gst = val * (gstRate / 100);
            const total = val + gst;

            setBaseAmount(val);
            setGstAmount(gst);
            setTotalAmount(total);
        } else {
            // Remove GST from Amount
            const base = val * (100 / (100 + gstRate));
            const gst = val - base;

            setBaseAmount(base);
            setGstAmount(gst);
            setTotalAmount(val); // In this mode, input IS the total
        }
    }, [amount, gstRate, mode]);

    const reset = () => {
        setAmount("");
        setGstRate(18);
        setMode("exclusive");
    };

    const formatCurrency = (val: number) => {
        return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <ToolPageLayout
            title="GST Calculator"
            description="Calculate GST inclusive & exclusive amounts instantly."
            about={
                <div>
                    <p>
                        Quickly calculate Goods and Services Tax (GST) for Indian billing. Switch between 'Exclusive' (adding tax to a base price) and 'Inclusive' (removing tax from a final price) modes.
                    </p>
                    <p className="mt-2">
                        Provides a clear breakdown of CGST, SGST, and IGST components for accurate invoicing.
                    </p>
                </div>
            }
            howItWorks={[
                "Select 'Exclusive' to add GST or 'Inclusive' to reverse-calculate base price.",
                "Enter the Amount and select the applicable GST Rate (5%, 12%, 18%, 28%).",
                "Choose the Tax Type: Intra-State (CGST+SGST) or Inter-State (IGST).",
                "Instantly view the Net Amount, Tax Component, and Total Payable."
            ]}
            disclaimer="Tax rates and calculations are based on standard Indian GST slabs. Verify with official regulations for specific goods or services."
            parentPath="/tools/business"
            parentName="Business & Finance"
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT: Inputs */}
                    <Card className="bg-white/5 border-white/10 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Calculator className="text-blue-400" /> Calculator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Mode Toggle */}
                            <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-lg">
                                <button
                                    onClick={() => setMode("exclusive")}
                                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "exclusive" ? "bg-blue-600 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                                >
                                    Add GST (Exclusive)
                                </button>
                                <button
                                    onClick={() => setMode("inclusive")}
                                    className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "inclusive" ? "bg-blue-600 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                                >
                                    Remove GST (Inclusive)
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label className="text-white/70">Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount..."
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
                                    className="bg-black/20 border-white/10 text-xl font-mono"
                                />
                            </div>

                            {/* Rate Selector */}
                            <div className="space-y-3">
                                <Label className="text-white/70">GST Rate (%)</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {RATES.map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => setGstRate(rate)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${gstRate === rate
                                                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                : "bg-black/20 border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                                                }`}
                                        >
                                            {rate}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tax Type Toggle */}
                            <div className="flex items-center space-x-4 pt-2">
                                <Label className="text-white/70">Tax Type:</Label>
                                <Tabs value={taxType} onValueChange={(v) => setTaxType(v as any)} className="w-[200px]">
                                    <TabsList className="bg-black/20 border border-white/10">
                                        <TabsTrigger value="split" className="text-xs">CGST + SGST</TabsTrigger>
                                        <TabsTrigger value="igst" className="text-xs">IGST Only</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <Button onClick={reset} variant="ghost" className="w-full text-white/50 hover:text-white mt-4">
                                <RotateCcw size={16} className="mr-2" /> Reset
                            </Button>

                        </CardContent>
                    </Card>

                    {/* RIGHT: Results */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Base Amount */}
                            <motion.div
                                layout
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-sm text-white/50 font-medium uppercase tracking-wider">Net Amount</p>
                                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(baseAmount)}</p>
                                </div>
                            </motion.div>

                            {/* GST Amount */}
                            <motion.div
                                layout
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm text-blue-300 font-medium uppercase tracking-wider">Total GST ({gstRate}%)</p>
                                            <p className="text-3xl font-bold text-blue-400 mt-1">{formatCurrency(gstAmount)}</p>
                                        </div>
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Percent size={20} className="text-blue-400" />
                                        </div>
                                    </div>

                                    {/* Tax Breakup */}
                                    <div className="pt-4 border-t border-white/5 space-y-2">
                                        {taxType === "split" ? (
                                            <>
                                                <div className="flex justify-between text-sm text-white/60">
                                                    <span>CGST ({gstRate / 2}%)</span>
                                                    <span>{formatCurrency(gstAmount / 2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-white/60">
                                                    <span>SGST ({gstRate / 2}%)</span>
                                                    <span>{formatCurrency(gstAmount / 2)}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between text-sm text-white/60">
                                                <span>IGST ({gstRate}%)</span>
                                                <span>{formatCurrency(gstAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Total Amount */}
                            <motion.div
                                layout
                                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden"
                            >
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-white/70 font-medium uppercase tracking-wider">Total Payable</p>
                                        <p className="text-4xl font-bold text-white mt-2">{formatCurrency(totalAmount)}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Formula Explanation */}
                        <div className="bg-black/20 rounded-lg p-4 text-xs text-white/40 font-mono">
                            <p className="mb-2 font-bold text-white/60">Calculation Formula ({mode}):</p>
                            {mode === "exclusive" ? (
                                <>
                                    <p>GST = Net Amount × {gstRate}%</p>
                                    <p>Total = Net Amount + GST</p>
                                </>
                            ) : (
                                <>
                                    <p>Net Amount = Total × 100 / (100 + {gstRate})</p>
                                    <p>GST = Total - Net Amount</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default GstCalculator;
