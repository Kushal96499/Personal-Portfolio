import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import type { Blog } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';

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
                        onClick={() => navigate('/')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
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
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {blog.content}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-border/50">
                    <Button
                        onClick={() => navigate('/')}
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
