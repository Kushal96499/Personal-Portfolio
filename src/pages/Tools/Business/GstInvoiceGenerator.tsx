import React, { useState, useMemo, useEffect } from "react";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, RefreshCw, Eye, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

// --- Constants ---
const INDIAN_STATES = [
    { code: "35", name: "Andaman and Nicobar Islands" },
    { code: "37", name: "Andhra Pradesh" },
    { code: "12", name: "Arunachal Pradesh" },
    { code: "18", name: "Assam" },
    { code: "10", name: "Bihar" },
    { code: "04", name: "Chandigarh" },
    { code: "22", name: "Chhattisgarh" },
    { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { code: "07", name: "Delhi" },
    { code: "30", name: "Goa" },
    { code: "24", name: "Gujarat" },
    { code: "06", name: "Haryana" },
    { code: "02", name: "Himachal Pradesh" },
    { code: "01", name: "Jammu and Kashmir" },
    { code: "20", name: "Jharkhand" },
    { code: "29", name: "Karnataka" },
    { code: "32", name: "Kerala" },
    { code: "38", name: "Ladakh" },
    { code: "31", name: "Lakshadweep" },
    { code: "23", name: "Madhya Pradesh" },
    { code: "27", name: "Maharashtra" },
    { code: "14", name: "Manipur" },
    { code: "17", name: "Meghalaya" },
    { code: "15", name: "Mizoram" },
    { code: "13", name: "Nagaland" },
    { code: "21", name: "Odisha" },
    { code: "34", name: "Puducherry" },
    { code: "03", name: "Punjab" },
    { code: "08", name: "Rajasthan" },
    { code: "11", name: "Sikkim" },
    { code: "33", name: "Tamil Nadu" },
    { code: "36", name: "Telangana" },
    { code: "16", name: "Tripura" },
    { code: "09", name: "Uttar Pradesh" },
    { code: "05", name: "Uttarakhand" },
    { code: "19", name: "West Bengal" },
].sort((a, b) => a.name.localeCompare(b.name));

const GST_RATES = [0, 5, 12, 18, 28];

// --- Types ---

interface GstItem {
    id: string;
    name: string;
    hsn: string;
    quantity: number;
    rate: number;
    gstRate: number;
}

interface GstInvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate: string;

    // Seller
    sellerName: string;
    sellerAddress: string;
    sellerGst: string;
    sellerState: string; // Code

    // Buyer
    buyerName: string;
    buyerAddress: string;
    buyerGst: string;
    buyerState: string; // Code

    notes: string;
}

interface GstInvoiceHistoryItem {
    id: string;
    invoiceNumber: string;
    date: string;
    clientName: string;
    totalAmount: number;
    gstType: "IGST" | "CGST+SGST";
    data: GstInvoiceData;
    items: GstItem[];
    timestamp: number;
}

const GstInvoiceGenerator = () => {
    // --- State ---
    const [data, setData] = useState<GstInvoiceData>({
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: "",
        sellerName: "",
        sellerAddress: "",
        sellerGst: "",
        sellerState: "",
        buyerName: "",
        buyerAddress: "",
        buyerGst: "",
        buyerState: "",
        notes: ""
    });

    const [items, setItems] = useState<GstItem[]>([
        { id: '1', name: "Service / Product", hsn: "", quantity: 1, rate: 1000, gstRate: 18 }
    ]);

    // History State
    const [history, setHistory] = useState<GstInvoiceHistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

    // Load history
    useEffect(() => {
        const saved = localStorage.getItem("invoice-history-gst");
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse GST invoice history", e);
            }
        }
    }, []);

    const saveInvoiceToHistory = (currentData: GstInvoiceData, currentItems: GstItem[], total: number, type: "IGST" | "CGST+SGST") => {
        const newItem: GstInvoiceHistoryItem = {
            id: Date.now().toString(),
            invoiceNumber: currentData.invoiceNumber,
            date: currentData.date,
            clientName: currentData.buyerName || "Unknown Client",
            totalAmount: total,
            gstType: type,
            data: { ...currentData },
            items: [...currentItems],
            timestamp: Date.now()
        };

        const newHistory = [newItem, ...history];
        setHistory(newHistory);
        localStorage.setItem("invoice-history-gst", JSON.stringify(newHistory));
    };

    const deleteInvoice = (id: string) => {
        if (confirm("Delete this GST invoice from history?")) {
            const newHistory = history.filter(h => h.id !== id);
            setHistory(newHistory);
            localStorage.setItem("invoice-history-gst", JSON.stringify(newHistory));
            toast.success("Invoice deleted from history");
        }
    };

    const loadInvoice = (item: GstInvoiceHistoryItem) => {
        if (confirm("Load this GST invoice? Unsaved changes will be lost.")) {
            setData(item.data);
            setItems(item.items);
            toast.success(`Loaded GST Invoice #${item.invoiceNumber}`);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- Computed ---

    const isInterState = useMemo(() => {
        if (!data.sellerState || !data.buyerState) return false;
        return data.sellerState !== data.buyerState;
    }, [data.sellerState, data.buyerState]);

    const processedItems = useMemo(() => {
        return items.map(item => {
            const taxable = item.quantity * item.rate;
            const taxAmount = taxable * (item.gstRate / 100);

            let cgst = 0, sgst = 0, igst = 0;
            if (isInterState) {
                igst = taxAmount;
            } else {
                cgst = taxAmount / 2;
                sgst = taxAmount / 2;
            }

            return {
                ...item,
                taxable,
                cgst,
                sgst,
                igst,
                total: taxable + taxAmount
            };
        });
    }, [items, isInterState]);

    const totals = useMemo(() => {
        return processedItems.reduce((acc, item) => ({
            taxable: acc.taxable + item.taxable,
            cgst: acc.cgst + item.cgst,
            sgst: acc.sgst + item.sgst,
            igst: acc.igst + item.igst,
            total: acc.total + item.total
        }), { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
    }, [processedItems]);

    const filteredHistory = useMemo(() => {
        return history
            .filter(h =>
                h.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.data.buyerGst.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);
    }, [history, searchTerm, sortOrder]);

    // --- Actions ---

    const updateField = (field: keyof GstInvoiceData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), name: "", hsn: "", quantity: 1, rate: 0, gstRate: 18 }]);
    };

    const updateItem = (id: string, field: keyof GstItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        } else {
            setItems([{ id: Date.now().toString(), name: "", hsn: "", quantity: 1, rate: 0, gstRate: 18 }]);
        }
    };

    const resetForm = () => {
        if (confirm("Reset entire GST Invoice?")) {
            setData({
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString().split('T')[0],
                dueDate: "",
                sellerName: "",
                sellerAddress: "",
                sellerGst: "",
                sellerState: "",
                buyerName: "",
                buyerAddress: "",
                buyerGst: "",
                buyerState: "",
                notes: ""
            });
            setItems([{ id: Date.now().toString(), name: "", hsn: "", quantity: 1, rate: 0, gstRate: 18 }]);
            toast.info("Form Reset");
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

        // Header
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("GST INVOICE", pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("(Original for Recipient)", pageWidth / 2, 26, { align: 'center' });

        // Seller/Buyer Box Table
        autoTable(doc, {
            startY: 35,
            theme: 'grid',
            head: [['Seller Details (From)', 'Buyer Details (To)']],
            body: [[
                `Name: ${data.sellerName}\nAdd: ${data.sellerAddress}\nGSTIN: ${data.sellerGst}\nState: ${INDIAN_STATES.find(s => s.code === data.sellerState)?.name || '-'} (${data.sellerState})`,
                `Name: ${data.buyerName}\nAdd: ${data.buyerAddress}\nGSTIN: ${data.buyerGst}\nState: ${INDIAN_STATES.find(s => s.code === data.buyerState)?.name || '-'} (${data.buyerState})`
            ]],
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [30, 30, 30], textColor: 255 }
        });

        // Invoice Meta Box
        autoTable(doc, {
            // @ts-ignore
            startY: doc.lastAutoTable.finalY - 0.1, // Connect
            theme: 'grid',
            body: [[
                `Invoice No: ${data.invoiceNumber}`,
                `Date: ${data.date}`,
                `Place of Supply: ${INDIAN_STATES.find(s => s.code === data.buyerState)?.name || '-'}`
            ]],
            styles: { fontSize: 9, fontStyle: 'bold', halign: 'center' }
        });

        // Items Table
        const tableHead = isInterState
            ? [['#', 'Item', 'HSN', 'Qty', 'Rate', 'Taxable', 'IGST Rate', 'IGST Amt', 'Total']]
            : [['#', 'Item', 'HSN', 'Qty', 'Rate', 'Taxable', 'CGST', 'SGST', 'Total']];

        const tableBody = processedItems.map((item, i) => {
            const common = [
                i + 1,
                item.name,
                item.hsn,
                item.quantity,
                item.rate.toLocaleString('en-IN'),
                item.taxable.toLocaleString('en-IN')
            ];

            if (isInterState) {
                return [...common, `${item.gstRate}%`, item.igst.toLocaleString('en-IN'), item.total.toLocaleString('en-IN')];
            } else {
                return [
                    ...common,
                    `${(item.gstRate / 2)}%\n${item.cgst.toLocaleString('en-IN')}`,
                    `${(item.gstRate / 2)}%\n${item.sgst.toLocaleString('en-IN')}`,
                    item.total.toLocaleString('en-IN')
                ];
            }
        });

        autoTable(doc, {
            // @ts-ignore
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            head: tableHead,
            body: tableBody,
            styles: { fontSize: 8, halign: 'center' },
            columnStyles: {
                1: { halign: 'left' },
                5: { halign: 'right' }, // Taxable
                7: { halign: 'right' }, // Tax Amt
                8: { halign: 'right' }, // Total
            },
            headStyles: { fillColor: [40, 40, 40], textColor: 255 }
        });

        // Totals
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;
        const rightX = pageWidth - 20;
        let cY = finalY;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        doc.text(`Taxable Value:   ${totals.taxable.toLocaleString('en-IN')}`, rightX, cY, { align: 'right' });
        cY += 6;

        if (isInterState) {
            doc.text(`Total IGST:   ${totals.igst.toLocaleString('en-IN')}`, rightX, cY, { align: 'right' });
            cY += 6;
        } else {
            doc.text(`Total CGST:   ${totals.cgst.toLocaleString('en-IN')}`, rightX, cY, { align: 'right' });
            cY += 6;
            doc.text(`Total SGST:   ${totals.sgst.toLocaleString('en-IN')}`, rightX, cY, { align: 'right' });
            cY += 6;
        }

        doc.setFontSize(12);
        doc.text(`Grand Total:   INR ${totals.total.toLocaleString('en-IN')}`, rightX, cY + 2, { align: 'right' });

        // Footer
        if (data.notes) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`Notes: ${data.notes}`, 14, cY + 20);
        }

        doc.setFontSize(8);
        doc.setTextColor(150);
        // doc.text("System Generated GST Invoice.", pageWidth / 2, 285, { align: 'center' });

        doc.save(`GST_Invoice_${data.invoiceNumber}.pdf`);
        toast.success("GST PDF Downloaded");
        saveInvoiceToHistory(data, items, totals.total, isInterState ? "IGST" : "CGST+SGST");
    };

    return (
        <ToolPageLayout
            title="GST Invoice Generator"
            description="Create compliant GST invoices for India (CGST/SGST/IGST)."
            about={
                <div>
                    <p>
                        A professional-grade invoice generator tailored for Indian businesses. It automatically handles GST logic—applying CGST/SGST for intra-state and IGST for inter-state transactions based on selected states.
                    </p>
                    <p className="mt-2">
                        Generate compliant PDF invoices with HSN codes, tax breakdowns, and customizable terms, all without any login or subscription.
                    </p>
                </div>
            }
            howItWorks={[
                "Fill in Supplier and Buyer details, including State and GSTIN.",
                "Add line items with HSN codes, Quantities, and specific GST rates.",
                "The tool automatically calculates Taxable Value and Tax Amounts (IGST vs CGST/SGST).",
                "Preview the generated invoice in real-time.",
                "Download the final PDF for your records."
            ]}
            disclaimer="This tool generates invoices based on your inputs. You are responsible for the accuracy of tax details and compliance with GST laws. No data is stored on our servers."
            parentPath="/tools/business"
            parentName="Business & Finance"
            containerVariant="raw"
        >
            <React.Fragment>
                <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] min-h-0 lg:min-h-[650px] lg:max-h-[900px] border border-white/10 rounded-2xl overflow-visible lg:overflow-hidden shadow-2xl bg-gradient-to-br from-[#0A0A0A] to-[#0F0F0F]">

                    {/* --- LEFT PANEL: CONFIG --- */}
                    <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 border-b lg:border-r border-white/10 bg-black/20 backdrop-blur-md flex flex-col h-auto lg:h-full">
                        <div className="p-6 space-y-6 overflow-visible lg:overflow-y-auto overflow-x-hidden pb-6 lg:pb-24 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">

                            {/* Header Actions */}
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">GST Configuration</h2>
                                <Button onClick={resetForm} variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 scale-90 origin-right">
                                    <RefreshCw size={14} className="mr-1.5" /> Reset
                                </Button>
                            </div>

                            {/* MODE INDICATOR */}
                            <div className={`p-4 rounded-xl border ${isInterState ? 'bg-orange-500/5 border-orange-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-white/60">Tax Type</span>
                                    <span className={`font-bold uppercase tracking-wider ${isInterState ? 'text-orange-400' : 'text-emerald-400'}`}>
                                        {isInterState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}
                                    </span>
                                </div>
                            </div>

                            {/* 1. SELLER */}
                            <div className="space-y-4">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <div className="w-1 h-4 bg-orange-500 rounded-full" /> Seller (From)
                                </h3>
                                <div className="space-y-3 pl-3">
                                    <Input placeholder="Business Name" value={data.sellerName} onChange={e => updateField('sellerName', e.target.value)} className="bg-white/5 border-white/5 h-9" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input placeholder="GSTIN" value={data.sellerGst} onChange={e => updateField('sellerGst', e.target.value)} className="bg-white/5 border-white/5 h-9" />
                                        <Select value={data.sellerState} onValueChange={v => updateField('sellerState', v)}>
                                            <SelectTrigger className="bg-white/5 border-white/5 h-9 text-xs">
                                                <SelectValue placeholder="State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INDIAN_STATES.map(s => (
                                                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Textarea placeholder="Address" value={data.sellerAddress} onChange={e => updateField('sellerAddress', e.target.value)} className="bg-white/5 border-white/5 min-h-[60px] resize-none" />
                                </div>
                            </div>

                            {/* 2. BUYER */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <div className="w-1 h-4 bg-green-500 rounded-full" /> Buyer (To)
                                </h3>
                                <div className="space-y-3 pl-3">
                                    <Input placeholder="Client Name" value={data.buyerName} onChange={e => updateField('buyerName', e.target.value)} className="bg-white/5 border-white/5 h-9" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input placeholder="GSTIN (Opt)" value={data.buyerGst} onChange={e => updateField('buyerGst', e.target.value)} className="bg-white/5 border-white/5 h-9" />
                                        <Select value={data.buyerState} onValueChange={v => updateField('buyerState', v)}>
                                            <SelectTrigger className="bg-white/5 border-white/5 h-9 text-xs">
                                                <SelectValue placeholder="Place of Supply" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INDIAN_STATES.map(s => (
                                                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Textarea placeholder="Address" value={data.buyerAddress} onChange={e => updateField('buyerAddress', e.target.value)} className="bg-white/5 border-white/5 min-h-[60px] resize-none" />
                                </div>
                            </div>

                            {/* 3. DETAILS */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-3 pl-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-white/30">Invoice #</Label>
                                        <Input value={data.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} className="bg-white/5 border-white/5 h-9" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-white/30">Date</Label>
                                        <Input type="date" value={data.date} onChange={e => updateField('date', e.target.value)} className="bg-white/5 border-white/5 h-9" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. ITEMS */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-white font-medium flex items-center gap-2">
                                        <div className="w-1 h-4 bg-white rounded-full" /> Products / Services
                                    </h3>
                                    <Button onClick={addItem} size="sm" variant="outline" className="h-6 text-[10px] border-white/10 hover:bg-white/5">
                                        <Plus size={10} className="mr-1" /> Add
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={item.id} className="p-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors rounded-lg border border-white/5 space-y-3 group text-sm relative">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <div className="col-span-8">
                                                    <Label className="text-[10px] text-white/30 mb-1 block">Description</Label>
                                                    <Input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="bg-black/20 border-white/5 h-8 text-xs" />
                                                </div>
                                                <div className="col-span-4">
                                                    <Label className="text-[10px] text-white/30 mb-1 block">HSN/SAC</Label>
                                                    <Input value={item.hsn} onChange={e => updateItem(item.id, 'hsn', e.target.value)} className="bg-black/20 border-white/5 h-8 text-xs" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <div className="col-span-3">
                                                    <Label className="text-[10px] text-white/30 mb-1 block">Qty</Label>
                                                    <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="bg-black/20 border-white/5 h-8 text-xs" />
                                                </div>
                                                <div className="col-span-4">
                                                    <Label className="text-[10px] text-white/30 mb-1 block">Rate</Label>
                                                    <Input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} className="bg-black/20 border-white/5 h-8 text-xs" />
                                                </div>
                                                <div className="col-span-5">
                                                    <Label className="text-[10px] text-white/30 mb-1 block">GST %</Label>
                                                    <Select value={item.gstRate.toString()} onValueChange={v => updateItem(item.id, 'gstRate', Number(v))}>
                                                        <SelectTrigger className="bg-black/20 border-white/5 h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {GST_RATES.map(r => (
                                                                <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- RIGHT PANEL: PREVIEW --- */}
                    <div className="w-full lg:flex-1 h-[600px] lg:h-full bg-gradient-to-br from-[#0D0D0D] to-[#121212] flex flex-col relative overflow-hidden border-t lg:border-t-0 border-white/10">
                        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0A] shrink-0">
                            <span className="text-xs font-mono text-white/40">GST PREVIEW</span>
                            <Button onClick={generatePDF} className="bg-indigo-600 hover:bg-indigo-500 h-8 text-xs font-semibold">
                                <Download size={12} className="mr-2" /> Download GST Invoice
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex items-start justify-center bg-[#0A0A0A] relative">
                            <div className="transform scale-[0.30] sm:scale-[0.38] md:scale-[0.43] lg:scale-[0.47] xl:scale-[0.51] 2xl:scale-[0.55] shadow-2xl origin-top transition-all duration-300">
                                <div className="w-[210mm] min-h-[297mm] bg-white text-black p-[10mm] relative">

                                    {/* Header */}
                                    <div className="text-center border-b pb-4 mb-6">
                                        <h1 className="text-2xl font-bold tracking-tight">TAX INVOICE</h1>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">(Original for Recipient)</p>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-0 border border-black text-xs mb-6">
                                        <div className="p-3 border-r border-black space-y-1">
                                            <p className="font-bold uppercase text-gray-400 text-[10px] tracking-wider mb-2">Details of Receiver (Billed To)</p>
                                            <p className="font-bold text-sm">{data.buyerName || "-"}</p>
                                            <p className="whitespace-pre-wrap">{data.buyerAddress || "-"}</p>
                                            <p className="mt-2">GSTIN: <span className="font-mono">{data.buyerGst || "-"}</span></p>
                                            <p>State: <b>{INDIAN_STATES.find(s => s.code === data.buyerState)?.name}</b> ({data.buyerState})</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="p-3 border-b border-black flex-1 space-y-1">
                                                <p className="font-bold uppercase text-gray-400 text-[10px] tracking-wider mb-2">Details of Supplier (Billed From)</p>
                                                <p className="font-bold text-sm">{data.sellerName || "-"}</p>
                                                <p className="whitespace-pre-wrap">{data.sellerAddress || "-"}</p>
                                                <p className="mt-2">GSTIN: <span className="font-mono">{data.sellerGst || "-"}</span></p>
                                                <p>State: <b>{INDIAN_STATES.find(s => s.code === data.sellerState)?.name}</b> ({data.sellerState})</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-gray-400">Invoice No</p>
                                                    <p className="font-bold">{data.invoiceNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Date</p>
                                                    <p className="font-bold">{data.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <table className="w-full text-[10px] mb-6 border-collapse border border-black">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border p-1 text-left">Item</th>
                                                <th className="border p-1 w-12">HSN</th>
                                                <th className="border p-1 w-10 text-center">Qty</th>
                                                <th className="border p-1 w-16 text-right">Rate</th>
                                                <th className="border p-1 w-20 text-right">Taxable</th>
                                                {isInterState ? (
                                                    <th className="border p-1 w-20 text-right">IGST</th>
                                                ) : (
                                                    <>
                                                        <th className="border p-1 w-16 text-right">CGST</th>
                                                        <th className="border p-1 w-16 text-right">SGST</th>
                                                    </>
                                                )}
                                                <th className="border p-1 w-24 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processedItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="border p-1 font-medium">{item.name}</td>
                                                    <td className="border p-1 text-center text-gray-500">{item.hsn}</td>
                                                    <td className="border p-1 text-center">{item.quantity}</td>
                                                    <td className="border p-1 text-right">{item.rate.toLocaleString()}</td>
                                                    <td className="border p-1 text-right">{item.taxable.toLocaleString()}</td>
                                                    {isInterState ? (
                                                        <td className="border p-1 text-right">
                                                            <div className="text-[8px] text-gray-400">{item.gstRate}%</div>
                                                            {item.igst.toLocaleString()}
                                                        </td>
                                                    ) : (
                                                        <>
                                                            <td className="border p-1 text-right">
                                                                <div className="text-[8px] text-gray-400">{item.gstRate / 2}%</div>
                                                                {item.cgst.toLocaleString()}
                                                            </td>
                                                            <td className="border p-1 text-right">
                                                                <div className="text-[8px] text-gray-400">{item.gstRate / 2}%</div>
                                                                {item.sgst.toLocaleString()}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="border p-1 text-right font-bold">{item.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-[50%] border border-black p-3 space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span>Taxable Value</span>
                                                <span className="font-mono">{totals.taxable.toLocaleString()}</span>
                                            </div>
                                            {isInterState ? (
                                                <div className="flex justify-between text-orange-700">
                                                    <span>IGST</span>
                                                    <span className="font-mono">{totals.igst.toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between text-blue-700">
                                                        <span>CGST</span>
                                                        <span className="font-mono">{totals.cgst.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-blue-700">
                                                        <span>SGST</span>
                                                        <span className="font-mono">{totals.sgst.toLocaleString()}</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="flex justify-between border-t border-black pt-2 mt-2 font-bold text-sm bg-gray-50 -mx-3 -mb-3 px-3 py-2">
                                                <span>Grand Total</span>
                                                <span>₹{totals.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- HISTORY SECTION --- */}
                <div className="mt-8 lg:mt-12 border-t border-white/10 bg-[#0A0A0A] p-4 md:p-8 pb-32 md:pb-8 rounded-b-2xl">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">GST Invoice History</h2>
                                <p className="text-gray-400 text-sm">
                                    Invoice history is stored only in your browser. Clearing browser data will remove saved invoices.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                    <Input
                                        placeholder="Search Client or GSTIN..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 h-9 w-[240px] bg-white/5 border-white/10 text-xs"
                                    />
                                </div>
                                <Select value={sortOrder} onValueChange={(v: "newest" | "oldest") => setSortOrder(v)}>
                                    <SelectTrigger className="h-9 w-[130px] bg-white/5 border-white/10 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="oldest">Oldest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Invoice #</th>
                                        <th className="px-6 py-3">Client</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No GST invoices found yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHistory.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 font-mono text-gray-400">{invoice.date}</td>
                                                <td className="px-6 py-4 font-medium text-white">{invoice.invoiceNumber}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-300">{invoice.clientName}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{invoice.data.buyerGst}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${invoice.gstType === 'IGST'
                                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {invoice.gstType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-emerald-400">
                                                    {invoice.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
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
            </React.Fragment>
        </ToolPageLayout >
    );
};

export default GstInvoiceGenerator;
