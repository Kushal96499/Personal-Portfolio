import React, { useState, useMemo } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, RefreshCw, Eye, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

// --- Types ---

interface InvoiceItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;

    // Seller
    sellerName: string;
    sellerDetails: string; // Address + Phone/Email

    // Buyer
    buyerName: string;
    buyerDetails: string; // Address

    discount: number;
    notes: string;
}

interface InvoiceHistoryItem {
    id: string;
    invoiceNumber: string;
    date: string;
    clientName: string;
    totalAmount: number;
    data: InvoiceData;
    items: InvoiceItem[];
    timestamp: number;
}

const InvoiceGenerator = () => {
    // --- State ---
    const [data, setData] = useState<InvoiceData>({
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: "",
        sellerName: "",
        sellerDetails: "",
        buyerName: "",
        buyerDetails: "",
        discount: 0,
        notes: "Thank you for your business!"
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', name: "Professional Service", quantity: 1, price: 1000 }
    ]);

    // History State
    const [history, setHistory] = useState<InvoiceHistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem("invoice-history-simple");
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse invoice history", e);
            }
        }
    }, []);

    const saveInvoiceToHistory = (currentData: InvoiceData, currentItems: InvoiceItem[], total: number) => {
        const newItem: InvoiceHistoryItem = {
            id: Date.now().toString(),
            invoiceNumber: currentData.invoiceNumber,
            date: currentData.date,
            clientName: currentData.buyerName || "Unknown Client",
            totalAmount: total,
            data: { ...currentData },
            items: [...currentItems],
            timestamp: Date.now()
        };

        const newHistory = [newItem, ...history];
        setHistory(newHistory);
        localStorage.setItem("invoice-history-simple", JSON.stringify(newHistory));
    };

    const deleteInvoice = (id: string) => {
        if (confirm("Delete this invoice from history?")) {
            const newHistory = history.filter(h => h.id !== id);
            setHistory(newHistory);
            localStorage.setItem("invoice-history-simple", JSON.stringify(newHistory));
            toast.success("Invoice deleted from history");
        }
    };

    const loadInvoice = (item: InvoiceHistoryItem) => {
        if (confirm("Load this invoice? Unsaved changes will be lost.")) {
            setData(item.data);
            setItems(item.items);
            toast.success(`Loaded Invoice #${item.invoiceNumber}`);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- Computed ---

    const processedItems = useMemo(() => {
        return items.map(item => ({
            ...item,
            total: item.quantity * item.price
        }));
    }, [items]);

    const totals = useMemo(() => {
        const subtotal = processedItems.reduce((acc, item) => acc + item.total, 0);
        const total = Math.max(0, subtotal - data.discount);
        return { subtotal, total };
    }, [processedItems, data.discount]);

    const filteredHistory = useMemo(() => {
        return history
            .filter(h => h.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || h.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    }, [history, searchTerm, sortOrder]);

    // --- Actions ---

    const updateField = (field: keyof InvoiceData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), name: "", quantity: 1, price: 0 }]);
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        } else {
            setItems([{ id: Date.now().toString(), name: "", quantity: 1, price: 0 }]);
        }
    };

    const resetForm = () => {
        if (confirm("Reset invoice?")) {
            setData({
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString().split('T')[0],
                dueDate: "",
                sellerName: "",
                sellerDetails: "",
                buyerName: "",
                buyerDetails: "",
                discount: 0,
                notes: "Thank you for your business!"
            });
            setItems([{ id: Date.now().toString(), name: "", quantity: 1, price: 0 }]);
            toast.info("Invoice reset.");
        }
    };

    // --- PDF Generation ---

    const generatePDF = () => {
        if (!data.sellerName || !data.buyerName) {
            toast.error("Please fill in Seller and Buyer names.");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = 210;

        // --- Header ---
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20);
        doc.text("INVOICE", pageWidth - 20, 20, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`#${data.invoiceNumber}`, pageWidth - 20, 26, { align: 'right' });

        // --- Seller Info ---
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(data.sellerName || "Business Name", 20, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        const splitSeller = doc.splitTextToSize(data.sellerDetails || "", 80);
        doc.text(splitSeller, 20, 27);

        let y = 60;

        // --- Bill To & Meta ---
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("BILL TO", 20, y);

        doc.text("DATE", pageWidth - 60, y);
        if (data.dueDate) doc.text("DUE DATE", pageWidth - 60, y + 15);

        y += 6;

        // Client
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(data.buyerName || "Client Name", 20, y);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        const splitBuyer = doc.splitTextToSize(data.buyerDetails || "", 80);
        doc.text(splitBuyer, 20, y + 6);

        // Dates
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(data.date, pageWidth - 60, y);
        if (data.dueDate) doc.text(data.dueDate, pageWidth - 60, y + 15);

        y = Math.max(y + 30, 110); // Ensure table starts lower

        // --- Items Table ---
        const tableBody = processedItems.map((item) => [
            item.name,
            item.quantity.toString(),
            item.price.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })
        ]);

        autoTable(doc, {
            startY: y,
            theme: 'grid',
            head: [['Description', 'Qty', 'Unit Price', 'Amount']],
            body: tableBody,
            styles: { fontSize: 10, cellPadding: 4, textColor: 50 },
            headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' }
            }
        });

        // --- Totals ---
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;
        const rightX = pageWidth - 20;

        doc.setFontSize(10);

        // Subtotal
        doc.setTextColor(100);
        doc.text("Subtotal", rightX - 40, finalY, { align: 'right' });
        doc.setTextColor(0);
        doc.text(totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 }), rightX, finalY, { align: 'right' });

        let currentY = finalY + 7;

        // Discount
        if (data.discount > 0) {
            doc.setTextColor(100);
            doc.text("Discount", rightX - 40, currentY, { align: 'right' });
            doc.setTextColor(200, 0, 0);
            doc.text(`- ${data.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, rightX, currentY, { align: 'right' });
            currentY += 7;
        }

        // Grand Total
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Total", rightX - 40, currentY + 3, { align: 'right' });
        doc.setTextColor(0, 80, 200); // Blue
        doc.text(totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 }), rightX, currentY + 3, { align: 'right' });


        // --- Footer ---
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150);

        if (data.notes) {
            doc.text(data.notes, 20, 270);
        }



        doc.save(`Invoice_${data.invoiceNumber}.pdf`);
        toast.success("Invoice Downloaded");
        saveInvoiceToHistory(data, items, totals.total);
    };

    return (
        <ToolPageLayout
            title="Invoice Generator"
            description="Create simple professional invoices without tax complexity."
            about={
                <div>
                    <p>
                        The fastest way to create clean, professional invoices for your business. Perfect for consultants, freelancers, or quick estimates where complex tax breakdowns aren't needed.
                    </p>
                    <p className="mt-2">
                        Features a live editor, PDF export, and local history to recall past clients easily.
                    </p>
                </div>
            }
            howItWorks={[
                "Enter your business details and your client's billing info.",
                "Add line items with descriptions, quantities, and prices.",
                "Add optional notes (payment terms, thank you message).",
                "Set a discount if applicable.",
                "Download the professionally formatted PDF instantly."
            ]}
            disclaimer="Invoices are generated locally in your browser for privacy. Ensure all details are correct before sending to clients."
            parentPath="/tools/business"
            parentName="Business & Finance"
            containerVariant="raw"
            className="p-0"
        >
            <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] min-h-[650px] max-h-[900px] border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0A0A0A] to-[#0F0F0F]">

                {/* --- LEFT PANEL: EDITOR --- */}
                <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-md flex flex-col h-full">
                    <div className="p-6 space-y-6 overflow-y-auto overflow-x-hidden pb-24 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">

                        {/* Header Actions */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Editor</h2>
                            <Button onClick={resetForm} variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 scale-90 origin-right">
                                <RefreshCw size={14} className="mr-1.5" /> Reset
                            </Button>
                        </div>

                        {/* 1. SELLER */}
                        <div className="space-y-4">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-500 rounded-full" /> From (You)
                            </h3>
                            <div className="space-y-3 pl-3">
                                <Input
                                    placeholder="Your Business Name"
                                    value={data.sellerName}
                                    onChange={e => updateField('sellerName', e.target.value)}
                                    className="bg-white/5 border-white/5 focus:bg-white/10 h-10"
                                />
                                <Textarea
                                    placeholder="Address, Phone, Email"
                                    value={data.sellerDetails}
                                    onChange={e => updateField('sellerDetails', e.target.value)}
                                    className="bg-white/5 border-white/5 focus:bg-white/10 min-h-[80px] resize-none"
                                />
                            </div>
                        </div>

                        {/* 2. BUYER */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <div className="w-1 h-4 bg-purple-500 rounded-full" /> Bill To (Client)
                            </h3>
                            <div className="space-y-3 pl-3">
                                <Input
                                    placeholder="Client Name"
                                    value={data.buyerName}
                                    onChange={e => updateField('buyerName', e.target.value)}
                                    className="bg-white/5 border-white/5 focus:bg-white/10 h-10"
                                />
                                <Textarea
                                    placeholder="Client Address"
                                    value={data.buyerDetails}
                                    onChange={e => updateField('buyerDetails', e.target.value)}
                                    className="bg-white/5 border-white/5 focus:bg-white/10 min-h-[80px] resize-none"
                                />
                            </div>
                        </div>

                        {/* 3. META */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <div className="w-1 h-4 bg-yellow-500 rounded-full" /> Invoice Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3 pl-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-white/30">Invoice #</Label>
                                    <Input value={data.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} className="bg-white/5 border-white/5" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-white/30">Date</Label>
                                    <Input type="date" value={data.date} onChange={e => updateField('date', e.target.value)} className="bg-white/5 border-white/5" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label className="text-[10px] text-white/30">Due Date (Optional)</Label>
                                    <Input type="date" value={data.dueDate} onChange={e => updateField('dueDate', e.target.value)} className="bg-white/5 border-white/5" />
                                </div>
                            </div>
                        </div>

                        {/* 4. ITEMS */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Items
                                </h3>
                                <Button onClick={addItem} size="sm" variant="outline" className="h-6 text-[10px] border-white/10 hover:bg-white/5">
                                    <Plus size={10} className="mr-1" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="p-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-lg border border-white/5 space-y-3 group text-sm relative">

                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] text-white/30 block">Description</Label>
                                            <Input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="bg-black/20 border-white/5 h-8 text-xs" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-[10px] text-white/30 mb-1 block">Qty</Label>
                                                <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="bg-black/20 border-white/5 h-8 text-xs" />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-white/30 mb-1 block">Price</Label>
                                                <Input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} className="bg-black/20 border-white/5 h-8 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5. EXTRAS */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="pl-3 space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-white/50">Discount Amount</Label>
                                    <Input type="number" value={data.discount} onChange={e => updateField('discount', Number(e.target.value))} className="bg-white/5 border-white/5" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-white/50">Notes / Terms</Label>
                                    <Textarea value={data.notes} onChange={e => updateField('notes', e.target.value)} className="bg-white/5 border-white/5 h-20" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- RIGHT PANEL: LIVE PREVIEW --- */}
                <div className="flex-1 bg-gradient-to-br from-[#0D0D0D] to-[#121212] flex flex-col h-full relative overflow-hidden">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0A] shrink-0">
                        <span className="text-xs font-mono text-white/40">PREVIEW MODE</span>
                        <Button onClick={generatePDF} className="bg-white text-black hover:bg-gray-200 h-8 text-xs font-semibold">
                            <Download size={12} className="mr-2" /> Download PDF
                        </Button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex items-start justify-center bg-[#0A0A0A] relative">
                        <div className="transform scale-[0.35] sm:scale-[0.42] md:scale-[0.48] lg:scale-[0.52] xl:scale-[0.56] 2xl:scale-[0.60] shadow-2xl origin-top transition-all duration-300">
                            <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[10mm] relative">

                                {/* Header */}
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h1 className="text-4xl font-bold tracking-tight text-[#111]">INVOICE</h1>
                                        <p className="text-gray-500 mt-2 font-mono">#{data.invoiceNumber}</p>
                                    </div>
                                    <div className="text-right max-w-[250px]">
                                        <h2 className="text-xl font-bold capitalize text-[#111]">{data.sellerName || "Your Business"}</h2>
                                        <p className="text-sm text-gray-500 mt-1 whitespace-pre-line leading-relaxed">{data.sellerDetails || "Address, Phone, Email"}</p>
                                    </div>
                                </div>

                                {/* Bill To Row */}
                                <div className="flex justify-between mb-16">
                                    <div className="max-w-[300px]">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Bill To</p>
                                        <p className="font-bold text-[#111] text-lg mb-1">{data.buyerName || "Client Name"}</p>
                                        <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{data.buyerDetails || "Client Address"}</p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</p>
                                            <p className="font-medium text-[#111]">{data.date}</p>
                                        </div>
                                        {data.dueDate && (
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
                                                <p className="font-medium text-[#111]">{data.dueDate}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="w-full text-sm mb-10">
                                    <thead>
                                        <tr className="border-b-2 border-black text-black uppercase tracking-widest text-xs text-left">
                                            <th className="py-3 font-bold w-[50%]">Description</th>
                                            <th className="py-3 font-bold text-center w-[15%]">Qty</th>
                                            <th className="py-3 font-bold text-right w-[15%]">Price</th>
                                            <th className="py-3 font-bold text-right w-[20%]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        {processedItems.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                                <td className="py-4 font-medium">{item.name || "Item Name"}</td>
                                                <td className="py-4 text-center">{item.quantity}</td>
                                                <td className="py-4 text-right">{item.price.toLocaleString()}</td>
                                                <td className="py-4 text-right font-bold text-black">{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals Section */}
                                <div className="flex justify-end">
                                    <div className="w-[40%] space-y-4">
                                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                                            <span>Subtotal</span>
                                            <span>{totals.subtotal.toLocaleString()}</span>
                                        </div>

                                        {data.discount > 0 && (
                                            <div className="flex justify-between text-sm text-red-500 font-medium">
                                                <span>Discount</span>
                                                <span>- {data.discount.toLocaleString()}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-2xl font-bold text-black pt-6 border-t-2 border-black">
                                            <span>Total</span>
                                            <span>{totals.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Notes */}
                                {(data.notes) && (
                                    <div className="mt-20 pt-8 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Notes</p>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{data.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- HISTORY SECTION --- */}
            <div className="mt-12 border-t border-white/10 bg-[#0A0A0A] p-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Simple Invoice History</h2>
                            <p className="text-gray-400 text-sm">
                                Invoice history is stored only in your browser. Clearing browser data will remove saved invoices.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <Input
                                    placeholder="Search Client..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 w-[200px] bg-white/5 border-white/10 text-xs rounded-lg focus:bg-white/10 transition-colors"
                                />
                            </div>
                            <Select value={sortOrder} onValueChange={(v: "newest" | "oldest") => setSortOrder(v)}>
                                <SelectTrigger className="h-9 w-[130px] bg-white/5 border-white/10 text-xs rounded-lg focus:bg-white/10 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Invoice #</th>
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No invoices found yet. Generate a PDF to save to history.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 font-mono text-gray-400">{invoice.date}</td>
                                            <td className="px-6 py-4 font-medium text-white">{invoice.invoiceNumber}</td>
                                            <td className="px-6 py-4 text-gray-300">{invoice.clientName}</td>
                                            <td className="px-6 py-4 text-right font-mono text-emerald-400">
                                                {invoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        onClick={() => loadInvoice(invoice)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                        title="Load Invoice"
                                                    >
                                                        <Eye size={14} />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteInvoice(invoice.id)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ToolPageLayout >
    );
};

export default InvoiceGenerator;
