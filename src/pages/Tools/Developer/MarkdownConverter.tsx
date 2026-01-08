import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // Import a dark theme for code blocks
import { Copy, Download, FileCode, RefreshCw, ArrowRightLeft, FileJson, Type, Image as ImageIcon, Link as LinkIcon, List, Heading1, Quote, Code, Bold, Italic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ToolPageLayout from "@/components/ui/ToolPageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Initialize Turndown service
// @ts-ignore
const Turndown = TurndownService.default || TurndownService;
const turndownService = new Turndown({
    headingStyle: "atx",
    codeBlockStyle: "fenced"
});

const MarkdownConverter = () => {
    const [mode, setMode] = useState<"md-to-html" | "html-to-md">("md-to-html");
    const [markdownInput, setMarkdownInput] = useState("# Hello Cyberpunk\n\nWelcome to the **Advanced Converter**.\n\n- Real-time conversion\n- Neon aesthetics\n- robust logic\n\n```javascript\nconsole.log('Hello World');\n```");
    const [htmlInput, setHtmlInput] = useState("<h1>Hello Cyberpunk</h1><p>Welcome to the <strong>Advanced Converter</strong>.</p><ul><li>Real-time conversion</li><li>Neon aesthetics</li><li>robust logic</li></ul><pre><code class=\"language-javascript\">console.log('Hello World');</code></pre>");

    const [convertedHtml, setConvertedHtml] = useState("");
    const [convertedMarkdown, setConvertedMarkdown] = useState("");

    // Preview Ref for highlighting
    const previewRef = useRef<HTMLDivElement>(null);

    // --- Effects ---

    // MD -> HTML Conversion
    useEffect(() => {
        if (mode === "md-to-html") {
            try {
                const html = marked.parse(markdownInput) as string;
                setConvertedHtml(html);
            } catch (e) {
                console.error("Markdown parsing error", e);
            }
        }
    }, [markdownInput, mode]);

    // HTML -> MD Conversion
    useEffect(() => {
        if (mode === "html-to-md") {
            try {
                const md = turndownService.turndown(htmlInput);
                setConvertedMarkdown(md);
            } catch (e) {
                console.error("HTML parsing error", e);
            }
        }
    }, [htmlInput, mode]);

    // Syntax Highlighting in Preview
    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [convertedHtml, mode]);

    // --- Handlers ---

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    const handleDownload = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${filename} downloaded!`);
    };

    const insertMarkdown = (syntax: string, placeholder: string = "") => {
        const textarea = document.getElementById("md-textarea") as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const selection = text.substring(start, end) || placeholder;

        let newText = "";
        let newCursorPos = 0;

        // Simple insertion logic
        switch (syntax) {
            case "bold": newText = `${before}**${selection}**${after}`; newCursorPos = end + 4; break;
            case "italic": newText = `${before}*${selection}*${after}`; newCursorPos = end + 2; break;
            case "h1": newText = `${before}# ${selection}${after}`; newCursorPos = end + 2; break;
            case "list": newText = `${before}- ${selection}${after}`; newCursorPos = end + 2; break;
            case "quote": newText = `${before}> ${selection}${after}`; newCursorPos = end + 2; break;
            case "code": newText = `${before}\`\`\`\n${selection}\n\`\`\`${after}`; newCursorPos = end + 8; break;
            case "link": newText = `${before}[${selection}](url)${after}`; newCursorPos = end + 3; break;
            case "image": newText = `${before}![alt](url)${after}`; newCursorPos = end + 7; break;
            default: return;
        }

        setMarkdownInput(newText);
        // Need to defer focus to set cursor correctly, but React state update might conflict. 
        // For simplicity, just updating text.
    };

    // --- Render Helpers ---

    const ToolbarButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="h-8 w-8 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-950/30"
            title={label}
        >
            <Icon size={16} />
        </Button>
    );

    const HOW_IT_WORKS = [
        "Choose your conversion mode: Markdown to HTML or HTML to Markdown.",
        "Type or paste your content in the input panel.",
        "View the converted code in the output panel.",
        "See a live preview of how the content renders in the browser.",
        "Use the toolbar to quickly insert Markdown syntax.",
        "Copy or download your result when finished."
    ];

    const DISCLAIMER = "Conversion is performed client-side using 'marked' and 'turndown' libraries. While we strive for accuracy, complex nested structures may sometimes require manual adjustment.";

    return (
        <ToolPageLayout
            title="Markdown ↔ HTML Converter"
            description="Advanced two-way converter with live preview and syntax highlighting."
            about={
                <div>
                    <p>
                        A real-time bidirectional converter between Markdown and HTML. Perfect for writers and developers, it features live preview, syntax highlighting, and instant copying of valid code.
                    </p>
                    <p className="mt-2">
                        Switch seamlessly between modes to convert documentation, blog posts, or code snippets without leaving your browser.
                    </p>
                </div>
            }
            parentPath="/tools/other"
            parentName="Developer Tools"
            howItWorks={HOW_IT_WORKS}
            disclaimer={DISCLAIMER}
        >
            <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-200px)] flex flex-col gap-6">

                {/* Top Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-lg">

                    <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full sm:w-auto">
                        <TabsList className="bg-black/50 border border-white/10">
                            <TabsTrigger value="md-to-html" className="data-[state=active]:bg-cyan-950/50 data-[state=active]:text-cyan-400">
                                Markdown → HTML
                            </TabsTrigger>
                            <TabsTrigger value="html-to-md" className="data-[state=active]:bg-purple-950/50 data-[state=active]:text-purple-400">
                                HTML → Markdown
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (mode === "md-to-html") {
                                    setMarkdownInput("");
                                    setConvertedHtml("");
                                } else {
                                    setHtmlInput("");
                                    setConvertedMarkdown("");
                                }
                            }}
                            className="border-red-500/20 hover:bg-red-500/10 hover:text-red-400 text-xs"
                        >
                            <RefreshCw size={14} className="mr-2" /> Clear
                        </Button>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[600px]">

                    {/* PANEL 1: INPUT */}
                    <motion.div
                        layout
                        className="relative group flex flex-col h-full"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className={`absolute -inset-[1px] bg-gradient-to-br ${mode === "md-to-html" ? "from-cyan-500/30 to-blue-500/30" : "from-purple-500/30 to-pink-500/30"} rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm`}></div>
                        <div className="relative flex-grow bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">

                            {/* Header */}
                            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {mode === "md-to-html" ? <FileCode size={16} className="text-cyan-400" /> : <FileJson size={16} className="text-purple-400" />}
                                    <span className="text-sm font-bold text-white/90">
                                        {mode === "md-to-html" ? "Markdown Input" : "HTML Input"}
                                    </span>
                                </div>
                                {mode === "md-to-html" && (
                                    <div className="flex items-center gap-1">
                                        <ToolbarButton icon={Bold} label="Bold" onClick={() => insertMarkdown("bold")} />
                                        <ToolbarButton icon={Italic} label="Italic" onClick={() => insertMarkdown("italic")} />
                                        <ToolbarButton icon={Heading1} label="Heading" onClick={() => insertMarkdown("h1")} />
                                        <ToolbarButton icon={List} label="List" onClick={() => insertMarkdown("list")} />
                                        <ToolbarButton icon={Quote} label="Quote" onClick={() => insertMarkdown("quote")} />
                                        <ToolbarButton icon={Code} label="Code Block" onClick={() => insertMarkdown("code")} />
                                        <ToolbarButton icon={LinkIcon} label="Link" onClick={() => insertMarkdown("link")} />
                                        <ToolbarButton icon={ImageIcon} label="Image" onClick={() => insertMarkdown("image")} />
                                    </div>
                                )}
                            </div>

                            {/* Editor */}
                            <Textarea
                                id={mode === "md-to-html" ? "md-textarea" : "html-textarea"}
                                value={mode === "md-to-html" ? markdownInput : htmlInput}
                                onChange={(e) => mode === "md-to-html" ? setMarkdownInput(e.target.value) : setHtmlInput(e.target.value)}
                                placeholder={mode === "md-to-html" ? "Type Markdown here..." : "Paste HTML here..."}
                                className="flex-grow resize-none border-none bg-transparent focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed text-gray-300 selection:bg-cyan-500/30"
                                spellCheck={false}
                            />

                            {/* Footer Actions */}
                            <div className="p-3 border-t border-white/5 flex gap-2 justify-end bg-black/20">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(mode === "md-to-html" ? markdownInput : htmlInput, "Input")}
                                    className="text-xs h-8"
                                >
                                    <Copy size={14} className="mr-2" /> Copy
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownload(mode === "md-to-html" ? markdownInput : htmlInput, mode === "md-to-html" ? "input.md" : "input.html", "text/plain")}
                                    className="text-xs h-8"
                                >
                                    <Download size={14} className="mr-2" /> Save
                                </Button>
                            </div>
                        </div>
                    </motion.div>


                    {/* PANEL 2: OUTPUT CODE */}
                    <motion.div
                        layout
                        className="relative group flex flex-col h-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="absolute -inset-[1px] bg-gradient-to-br from-gray-700/30 to-gray-500/30 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur-sm"></div>
                        <div className="relative flex-grow bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                            <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Code size={16} className="text-gray-400" />
                                    <span className="text-sm font-bold text-white/90">
                                        {mode === "md-to-html" ? "HTML Output" : "Markdown Output"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow overflow-auto p-4 bg-[#0d1117]">
                                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
                                    {mode === "md-to-html" ? convertedHtml : convertedMarkdown}
                                </pre>
                            </div>

                            <div className="p-3 border-t border-white/5 flex gap-2 justify-end bg-black/20">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopy(mode === "md-to-html" ? convertedHtml : convertedMarkdown, "Output")}
                                    className="text-xs h-8"
                                >
                                    <Copy size={14} className="mr-2" /> Copy Code
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownload(mode === "md-to-html" ? convertedHtml : convertedMarkdown, mode === "md-to-html" ? "output.html" : "output.md", "text/plain")}
                                    className="text-xs h-8"
                                >
                                    <Download size={14} className="mr-2" /> Download
                                </Button>
                            </div>
                        </div>
                    </motion.div>


                    {/* PANEL 3: LIVE PREVIEW */}
                    <motion.div
                        layout
                        className="relative group flex flex-col h-full lg:col-span-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="absolute -inset-[1px] bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                        <div className="relative flex-grow bg-white text-black rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Type size={16} className="text-emerald-600" />
                                    <span className="text-sm font-bold text-gray-800">Live Preview</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Browser Render</span>
                            </div>

                            <div
                                className="flex-grow overflow-auto p-6 prose prose-sm max-w-none prose-img:rounded-lg prose-headings:text-gray-900 prose-a:text-blue-600"
                                ref={previewRef}
                                dangerouslySetInnerHTML={{ __html: mode === "md-to-html" ? convertedHtml : (marked.parse(convertedMarkdown) as string) }}
                            />
                        </div>
                    </motion.div>

                </div>
            </div>
        </ToolPageLayout>
    );
};

export default MarkdownConverter;
