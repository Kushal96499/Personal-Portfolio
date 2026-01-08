import React, { useState } from 'react';
import { toast } from 'sonner';
import { Wrench, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ToolPageLayout from "@/components/ui/ToolPageLayout";

const ToolTemplate = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async () => {
        setIsProcessing(true);
        try {
            // Tool logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
            toast.success("Action completed successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ToolPageLayout
            title="New Tool Title"
            description="Short description of what this tool does. Client-side & Secure."
            parentPath="/tools/category" // e.g., /tools/pdf, /tools/cyber, /tools/other
            parentName="Category Name"   // e.g., PDF Tools, Cyber Tools
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
                {/* LEFT COLUMN: Input / Main Area */}
                <div className="lg:col-span-7">
                    <Card className="h-full border-border/50 shadow-soft">
                        <CardContent className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[300px]">
                            <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
                                <Wrench className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Input Area</h3>
                            <p className="text-muted-foreground text-sm">Place your inputs or upload zones here.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Settings / Actions */}
                <div className="lg:col-span-5">
                    <Card className="sticky top-6 border-border/50 shadow-soft">
                        <CardHeader>
                            <CardTitle>Tool Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-muted/50 border border-border rounded-lg p-4">
                                <h4 className="font-medium text-foreground mb-1">Configuration</h4>
                                <p className="text-sm text-muted-foreground">Configure your options here.</p>
                            </div>

                            {/* Add settings controls here */}

                            <Button
                                onClick={handleAction}
                                disabled={isProcessing}
                                className="w-full py-6 text-base"
                                size="lg"
                            >
                                {isProcessing ? <RefreshCw className="animate-spin mr-2" /> : <Wrench className="mr-2" />}
                                Run Tool
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default ToolTemplate;
