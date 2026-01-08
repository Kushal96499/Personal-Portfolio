import React from 'react';
import { GitCompare } from 'lucide-react';
import UniversalToolLayout from '@/components/UniversalToolLayout';

const ComparePDF = () => {
    const HOW_IT_WORKS = [
        "Upload two PDF files",
        "The tool will highlight differences",
        "Download the comparison report"
    ];

    return (
        <UniversalToolLayout
            title="Compare PDF"
            description="Compare two PDF files and highlight differences."
            steps={HOW_IT_WORKS}
            isProcessing={false}
            error={null}
            onResetError={() => { }}
            about={
                <>
                    <p>
                        This tool allows you to visually compare two PDF documents side-by-side to identify differences.
                        It highlights changes in text and layout, making it easy to review revisions or detect alterations between file versions.
                    </p>
                </>
            }
        >
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#0A0A0A] border border-white/5 rounded-xl p-8 text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                    <GitCompare className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
                <p className="text-gray-400 max-w-md">
                    The PDF Comparison tool is currently under development. This advanced feature will allow you to visually compare two documents side-by-side.
                </p>
            </div>
        </UniversalToolLayout>
    );
};

export default ComparePDF;
