import React from 'react';
import { FileText, Calculator } from 'lucide-react';
import ToolsDashboardLayout from '@/components/tools/ToolsDashboardLayout';

const BusinessDashboard = () => {
    const categories = [
        {
            id: "finance",
            name: "Finance & Documents",
            icon: FileText,
            tools: [
                {
                    id: 'invoice-generator',
                    name: 'Invoice Generator',
                    description: 'Create simple professional invoices without tax complexity.',
                    icon: FileText,
                    path: '/tools/business/invoice-generator'
                },
                {
                    id: 'gst-invoice-generator',
                    name: 'GST Invoice Generator',
                    description: 'India-complaint invoicing with CGST, SGST, IGST automation.',
                    icon: FileText,
                    path: '/tools/business/gst-invoice-generator'
                },
                {
                    id: 'emi-calculator',
                    name: 'EMI Calculator',
                    description: 'Calculate loan EMIs with detailed interest breakdown.',
                    icon: Calculator,
                    path: '/tools/business/emi-calculator'
                },
                {
                    id: 'gst-calculator',
                    name: 'GST Calculator',
                    description: 'Calculate GST inclusive & exclusive amounts instantly.',
                    icon: Calculator,
                    path: '/tools/business/gst-calculator'
                },
                {
                    id: 'expense-tracker',
                    name: 'Expense Tracker',
                    description: 'Track business expenses locally.',
                    icon: FileText,
                    path: '/tools/business/expense-tracker'
                }
            ]
        }
    ];

    return (
        <ToolsDashboardLayout
            title="Business & Finance"
            description="Smart tools for invoicing, loans, and everyday financial planning."
            categories={categories}
            basePath="/tools/business"
        />
    );
};

export default BusinessDashboard;
