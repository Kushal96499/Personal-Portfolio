import React, { useState, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Download, Filter, Wallet, Calendar, TrendingUp, PieChart, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Expense {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: string;
    timestamp: number;
}

const DEFAULT_CATEGORIES = [
    "Office Rent", "Salaries", "Training", "Marketing", "Software",
    "Supplies", "Travel", "Utilities", "Legal", "Repairs", "Insurance", "Miscellaneous"
];

const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "Cheque"];

const ExpenseTracker = () => {
    // --- State ---
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

    // Form State
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Filter/Sort State
    const [filterCategory, setFilterCategory] = useState("All");
    const [sortBy, setSortBy] = useState("date_desc"); // date_asc, date_desc, amount_asc, amount_desc

    // --- Effects ---

    // Load Data
    useEffect(() => {
        const savedExpenses = localStorage.getItem('business_expenses');
        if (savedExpenses) {
            try { setExpenses(JSON.parse(savedExpenses)); } catch (e) { console.error(e); }
        }

        const savedCategories = localStorage.getItem('business_expense_categories');
        if (savedCategories) {
            try { setCategories(JSON.parse(savedCategories)); } catch (e) { console.error(e); }
        } else {
            setCategory(DEFAULT_CATEGORIES[0]);
        }
    }, []);

    // Save Data
    useEffect(() => {
        localStorage.setItem('business_expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('business_expense_categories', JSON.stringify(categories));
    }, [categories]);

    // --- Actions ---

    const handleAddCategory = () => {
        if (!newCategoryInput.trim()) return;
        if (categories.includes(newCategoryInput.trim())) {
            toast.error("Category already exists");
            return;
        }
        const updated = [...categories, newCategoryInput.trim()];
        setCategories(updated);
        setCategory(newCategoryInput.trim()); // Auto select
        setNewCategoryInput("");
        setIsAddingCategory(false);
        toast.success("New category created");
    };

    const addExpense = () => {
        if (!title || !amount || Number(amount) <= 0 || !category) {
            toast.error("Please fill all fields correctly.");
            return;
        }

        const newExpense: Expense = {
            id: Date.now().toString(),
            title,
            amount: Number(amount),
            category,
            date,
            paymentMethod,
            timestamp: Date.now()
        };

        setExpenses([newExpense, ...expenses]);
        setTitle("");
        setAmount("");
        toast.success("Expense added!");
    };

    const deleteExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
        toast.info("Expense deleted.");
    };

    const clearAll = () => {
        if (confirm("Permanently delete ALL expenses?")) {
            setExpenses([]);
            toast.warning("All data cleared.");
        }
    };

    const exportCSV = () => {
        const headers = ["Date", "Description", "Category", "Payment Method", "Amount"];
        const rows = expenses.map(e => [e.date, e.title, e.category, e.paymentMethod, e.amount]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "business_expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Derived Data ---
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter(e => e.date === today).reduce((acc, curr) => acc + curr.amount, 0);

    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    const filteredAndSortedExpenses = expenses
        .filter(e => {
            const matchesCategory = filterCategory === "All" || e.category === filterCategory;
            return matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === "date_desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === "amount_desc") return b.amount - a.amount;
            if (sortBy === "amount_asc") return a.amount - b.amount;
            return 0;
        });

    return (
        <ToolPageLayout
            title="Business Expense Tracker"
            description="Track finances with custom categories and insights."
            about={
                <div>
                    <p>
                        A lightweight expense manager designed for freelancers and small businesses. Log your daily transactions, categorize expenses, and visualize spending habits without needing complex accounting software.
                    </p>
                    <p className="mt-2">
                        Your private financial data remains stored securely in your browser's local storage and is never uploaded to the cloud.
                    </p>
                </div>
            }
            howItWorks={[
                "Add new transactions with amount, date, and category.",
                "Create custom categories (e.g., 'Travel', 'Software') on the fly.",
                "View a summary dashboard of total spend and top expenses.",
                "Filter history by category or sort by date/amount.",
                "Export your entire expense log to CSV for backup."
            ]}
            disclaimer="All data processing happens locally in your browser. No financial data is sent to our servers. Clearing your browser cache will remove your saved data."
            parentPath="/tools/business"
            parentName="Business & Finance"
            containerVariant="default"
        >
            <div className="space-y-8 pb-20">
                {/* 1. Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard title="Total Spend" value={`₹${totalExpenses.toLocaleString()}`} icon={Wallet} color="text-blue-400" bg="bg-blue-500/10" />
                    <SummaryCard title="Today's Spend" value={`₹${todayExpenses.toLocaleString()}`} icon={Calendar} color="text-emerald-400" bg="bg-emerald-500/10" />
                    <SummaryCard title="Top Category" value={topCategoryEntry ? topCategoryEntry[0] : "N/A"} subValue={topCategoryEntry ? `₹${topCategoryEntry[1].toLocaleString()}` : ""} icon={TrendingUp} color="text-amber-400" bg="bg-amber-500/10" />
                    <SummaryCard title="Entries" value={expenses.length.toString()} icon={PieChart} color="text-purple-400" bg="bg-purple-500/10" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* 2. Add Expense Form */}
                    <div className="xl:col-span-4 space-y-6">
                        <Card className="bg-[#0A0A0A] border-white/10 sticky top-24 shadow-2xl">
                            <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
                                <CardTitle className="text-lg flex items-center gap-2 text-white">
                                    <Plus className="text-blue-500" /> New Transaction
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-white/50 tracking-wider">Title</Label>
                                    <Input placeholder="e.g. Flight Tickets" value={title} onChange={e => setTitle(e.target.value)} className="bg-[#111] border-white/10 text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-white/50 tracking-wider">Amount</Label>
                                        <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-[#111] border-white/10 text-white font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-white/50 tracking-wider">Date</Label>
                                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-[#111] border-white/10 text-white" />
                                    </div>
                                </div>

                                {/* Dynamic Category Select */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs uppercase text-white/50 tracking-wider">Category</Label>
                                        {!isAddingCategory && (
                                            <button onClick={() => setIsAddingCategory(true)} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                <Plus size={10} /> NEW
                                            </button>
                                        )}
                                    </div>

                                    {isAddingCategory ? (
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                                            <Input
                                                autoFocus
                                                placeholder="New Category Name"
                                                value={newCategoryInput}
                                                onChange={e => setNewCategoryInput(e.target.value)}
                                                className="bg-[#111] border-blue-500/50 text-white h-10"
                                            />
                                            <Button onClick={handleAddCategory} size="icon" className="h-10 w-10 bg-blue-600 hover:bg-blue-500 text-white shrink-0"><Plus size={16} /></Button>
                                            <Button onClick={() => setIsAddingCategory(false)} size="icon" variant="ghost" className="h-10 w-10 text-white/50 hover:text-white shrink-0"><X size={16} /></Button>
                                        </div>
                                    ) : (
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="bg-[#111] border-white/10 text-white h-10">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-[300px]">
                                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-white/50 tracking-wider">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="bg-[#111] border-white/10 text-white h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                            {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={addExpense} className="w-full bg-blue-600 h-11 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20">Add Transaction</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. Expense List */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0A0A0A] p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="w-[160px] h-9 text-xs bg-[#111] border-white/10 text-white">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Filter size={12} /> <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        <SelectItem value="All">All Categories</SelectItem>
                                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[160px] h-9 text-xs bg-[#111] border-white/10 text-white">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <ArrowUpDown size={12} /> <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        <SelectItem value="date_desc">Newest First</SelectItem>
                                        <SelectItem value="date_asc">Oldest First</SelectItem>
                                        <SelectItem value="amount_desc">Highest Amount</SelectItem>
                                        <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <Button onClick={exportCSV} variant="outline" size="sm" className="h-9 bg-[#111] border-white/10 text-white/70 hover:bg-white/5 hover:text-white flex-1"><Download size={14} className="mr-2" /> CSV</Button>
                                {expenses.length > 0 && (
                                    <Button onClick={clearAll} variant="ghost" size="sm" className="h-9 text-red-500 hover:bg-red-500/10 flex-1">Clear All</Button>
                                )}
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredAndSortedExpenses.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-white/30">No expenses found.</p>
                                    </motion.div>
                                ) : (
                                    filteredAndSortedExpenses.map((expense) => (
                                        <motion.div
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                            className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-white/20 transition-all"
                                        >
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="h-12 w-12 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/5 shrink-0">
                                                    <span className="text-lg font-bold text-white">{new Date(expense.date).getDate()}</span>
                                                    <span className="text-[9px] uppercase text-white/50">{new Date(expense.date).toLocaleString('default', { month: 'short' })}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-medium text-white truncate">{expense.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="bg-white/5 text-white/60 hover:bg-white/10 text-[10px] border-white/5">{expense.category}</Badge>
                                                        <span className="text-[10px] text-white/30 uppercase">{expense.paymentMethod}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                                                <span className="text-lg font-bold text-white">₹{expense.amount.toLocaleString()}</span>
                                                <Button onClick={() => deleteExpense(expense.id)} size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
};

const SummaryCard = ({ title, value, subValue, icon: Icon, color, bg }: any) => (
    <Card className="bg-[#0A0A0A] border-white/10">
        <CardContent className="p-5">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${bg} ${color}`}><Icon size={20} /></div>
            </div>
            <div className="mt-4">
                <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
                    {subValue && <p className="text-xs text-white/40">{subValue}</p>}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default ExpenseTracker;
