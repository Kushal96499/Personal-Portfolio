import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Percent, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmiCalculator = () => {
    const [amount, setAmount] = useState<number>(100000);
    const [rate, setRate] = useState<number>(10);
    const [tenure, setTenure] = useState<number>(1);
    const [tenureType, setTenureType] = useState<'Years' | 'Months'>('Years');
    const [emi, setEmi] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalPayment, setTotalPayment] = useState<number>(0);

    useEffect(() => {
        calculateEMI();
    }, [amount, rate, tenure, tenureType]);

    const calculateEMI = () => {
        // P = Principal amount
        // R = Rate on monthly basis
        // N = Tenure in months

        const P = amount;
        const R = rate / 12 / 100;
        const N = tenureType === 'Years' ? tenure * 12 : tenure;

        if (P === 0 || R === 0 || N === 0) {
            setEmi(0);
            setTotalInterest(0);
            setTotalPayment(0);
            return;
        }

        // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
        const emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        const totalPay = emiValue * N;
        const totalInt = totalPay - P;

        setEmi(Math.round(emiValue));
        setTotalPayment(Math.round(totalPay));
        setTotalInterest(Math.round(totalInt));
    };

    const reset = () => {
        setAmount(100000);
        setRate(10);
        setTenure(1);
        setTenureType('Years');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <ToolPageLayout
            title="EMI Calculator"
            description="Calculate loan EMIs with interest breakdown."
            about={
                <div>
                    <p>
                        A simple yet powerful tool to estimate your Equated Monthly Installments (EMI) for home, car, or personal loans. Visualizes the breakdown between principal and interest over the loan tenure.
                    </p>
                    <p className="mt-2">
                        Adjust amounts, interest rates, and durations to find a repayment plan that fits your budget.
                    </p>
                </div>
            }
            howItWorks={[
                "Enter the Loan Amount you wish to borrow.",
                "Set the Interest Rate (%) offered by your bank.",
                "Choose the Loan Tenure in Years or Months.",
                "View your monthly EMI, total interest payable, and the total amount."
            ]}
            disclaimer="Financial figures are estimates for planning purposes only. Please consult a qualified financial advisor for exact banking terms."
            parentPath="/tools/business"
            parentName="Business & Finance"
            containerVariant="default"
        >
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        {/* Amount */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="text-white/80">Loan Amount</Label>
                                <span className="text-blue-400 font-mono">{formatCurrency(amount)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <DollarSign size={20} className="text-white/30" />
                                <Slider
                                    value={[amount]}
                                    onValueChange={(vals) => setAmount(vals[0])}
                                    min={1000}
                                    max={10000000}
                                    step={1000}
                                    className="flex-1"
                                />
                            </div>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="bg-[#111] border-white/10 text-white"
                            />
                        </div>

                        {/* Rate */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="text-white/80">Interest Rate (%)</Label>
                                <span className="text-purple-400 font-mono">{rate}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Percent size={20} className="text-white/30" />
                                <Slider
                                    value={[rate]}
                                    onValueChange={(vals) => setRate(vals[0])}
                                    min={0.1}
                                    max={30}
                                    step={0.1}
                                    className="flex-1"
                                />
                            </div>
                            <Input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="bg-[#111] border-white/10 text-white"
                            />
                        </div>

                        {/* Tenure */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="text-white/80">Tenure</Label>
                                <span className="text-green-400 font-mono">{tenure} {tenureType}</span>
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    value={tenure}
                                    onChange={(e) => setTenure(Number(e.target.value))}
                                    className="bg-[#111] border-white/10 text-white flex-1"
                                />
                                <Select value={tenureType} onValueChange={(v: any) => setTenureType(v)}>
                                    <SelectTrigger className="w-[120px] bg-[#111] border-white/10 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111] border-white/10 text-white">
                                        <SelectItem value="Years">Years</SelectItem>
                                        <SelectItem value="Months">Months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-4">
                                <Calendar size={20} className="text-white/30" />
                                <Slider
                                    value={[tenure]}
                                    onValueChange={(vals) => setTenure(vals[0])}
                                    min={1}
                                    max={tenureType === 'Years' ? 30 : 360}
                                    step={1}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <Button variant="ghost" onClick={reset} className="text-white/40 hover:text-white hover:bg-white/10">
                            <RefreshCw size={16} className="mr-2" /> Reset Values
                        </Button>
                    </div>

                    {/* Results */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-sm uppercase tracking-widest text-white/50">Monthly Payment (EMI)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-5xl font-bold text-white mb-2 tracking-tight">
                                    {formatCurrency(emi)}
                                </div>
                                <p className="text-white/40 text-sm">per month</p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-[#111] border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase tracking-widest text-white/50">Total Interest</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-orange-400">
                                        {formatCurrency(totalInterest)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase tracking-widest text-white/50">Total Amount</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-green-400">
                                        {formatCurrency(totalPayment)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="bg-[#111] rounded-xl p-6 border border-white/5">
                            <h3 className="text-sm font-medium text-white/70 mb-4">Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500/50" /> Principal
                                    </span>
                                    <span className="text-white">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-orange-500/50" /> Interest
                                    </span>
                                    <span className="text-white">{formatCurrency(totalInterest)}</span>
                                </div>
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex mt-2">
                                    <div
                                        className="h-full bg-blue-500/50"
                                        style={{ width: `${(amount / totalPayment) * 100}%` }}
                                    />
                                    <div
                                        className="h-full bg-orange-500/50"
                                        style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default EmiCalculator;
