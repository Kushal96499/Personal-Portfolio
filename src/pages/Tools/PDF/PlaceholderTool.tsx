import React from 'react';
import { Construction } from 'lucide-react';
import UniversalToolLayout from '@/components/UniversalToolLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PlaceholderTool = ({ title = "Coming Soon" }: { title?: string }) => {
    return (
        <UniversalToolLayout
            title={title}
            description="This tool is currently being rebuilt with our new secure client-side architecture."
        >
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Construction className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Under Construction</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    We are working hard to bring you the best client-side PDF tools.
                    This feature will be available shortly.
                </p>
                <Link to="/tools/pdf">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        Back to PDF Tools
                    </Button>
                </Link>
            </div>
        </UniversalToolLayout>
    );
};

export default PlaceholderTool;
