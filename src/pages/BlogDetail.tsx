import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import type { Blog } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const BlogDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchBlog(slug);
        }
    }, [slug]);

    const fetchBlog = async (blogSlug: string) => {
        try {
            const data = await api.getBlogBySlug(blogSlug);
            if (!data) {
                toast.error('Blog post not found');
                navigate('/');
                return;
            }
            setBlog(data);
        } catch (error) {
            console.error('Failed to fetch blog:', error);
            toast.error('Failed to load blog post');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading blog post...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/blog')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Posts
                    </Button>
                </div>
            </header>

            {/* Blog Content */}
            <article className="container max-w-4xl py-12 px-4">
                {/* Banner Image */}
                {blog.thumbnail_url && (
                    <div className="mb-8 rounded-lg overflow-hidden border border-border/50">
                        <img
                            src={blog.thumbnail_url}
                            alt={blog.title}
                            className="w-full h-[400px] object-cover"
                        />
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                    {blog.title}
                </h1>

                {/* Description */}
                {blog.description && (
                    <p className="text-xl text-muted-foreground mb-6">
                        {blog.description}
                    </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(blog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                    </div>
                    {blog.reading_time && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{blog.reading_time} min read</span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {blog.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="gap-1">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={{
                            img: ({ node, ...props }) => (
                                <img
                                    {...props}
                                    className="max-w-full h-auto rounded-lg my-8 mx-auto block shadow-2xl border border-white/10"
                                    style={{ maxHeight: '600px', objectFit: 'contain' }}
                                />
                            ),
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-8 rounded-lg border border-white/10 bg-white/5">
                                    <table {...props} className="w-full border-collapse text-sm md:text-base" />
                                </div>
                            ),
                            thead: ({ node, ...props }) => (
                                <thead {...props} className="bg-white/10 text-white font-bold" />
                            ),
                            th: ({ node, ...props }) => (
                                <th {...props} className="p-4 text-left border-b border-white/10 whitespace-nowrap" />
                            ),
                            td: ({ node, ...props }) => (
                                <td {...props} className="p-4 border-b border-white/5" />
                            ),
                            p: ({ node, ...props }) => (
                                <p {...props} className="leading-loose mb-6 text-white/80 text-lg" />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul {...props} className="list-disc pl-6 mb-6 space-y-2 text-white/80" />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol {...props} className="list-decimal pl-6 mb-6 space-y-2 text-white/80" />
                            ),
                            li: ({ node, ...props }) => (
                                <li {...props} className="leading-relaxed pl-2" />
                            ),
                            code: ({ node, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !String(children).includes('\n');
                                return isInline ? (
                                    <code {...props} className="bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-blue-500/20">
                                        {children}
                                    </code>
                                ) : (
                                    <div className="overflow-x-auto my-6 rounded-xl bg-[#0A0A0A] p-6 border border-white/10 shadow-inner">
                                        <code {...props} className="block font-mono text-sm leading-relaxed text-gray-300 min-w-max">
                                            {children}
                                        </code>
                                    </div>
                                );
                            },
                            blockquote: ({ node, ...props }) => (
                                <blockquote {...props} className="border-l-4 border-blue-500/50 pl-6 italic text-white/60 my-8 text-xl" />
                            ),
                            a: ({ node, ...props }) => (
                                <a {...props} className="text-blue-400 hover:text-blue-300 hover:underline underline-offset-4 transition-colors font-medium" target="_blank" rel="noopener noreferrer" />
                            ),
                            h1: ({ node, ...props }) => <h1 {...props} className="text-4xl font-bold mt-12 mb-6 text-white tracking-tight" />,
                            h2: ({ node, ...props }) => <h2 {...props} className="text-3xl font-bold mt-10 mb-5 text-white tracking-tight" />,
                            h3: ({ node, ...props }) => <h3 {...props} className="text-2xl font-bold mt-8 mb-4 text-white/90" />,
                            hr: ({ node, ...props }) => <hr {...props} className="my-12 border-white/10" />,
                        }}
                    >
                        {blog.content}
                    </ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-border/50">
                    <Button
                        onClick={() => navigate('/blog')}
                        variant="outline"
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Posts
                    </Button>
                </div>
            </article>

            {/* Cyber Glow Effect */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
            </div>
        </div>
    );
};

export default BlogDetail;
