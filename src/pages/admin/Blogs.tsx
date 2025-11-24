import { useState, useEffect } from 'react';
import { api, Blog } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TagInput } from '@/components/admin/TagInput';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface BlogFormData {
    title: string;
    description: string;
    content: string;
    thumbnail_url: string;
    tags: string[];
    visible: boolean;
}

const Blogs = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        description: '',
        content: '',
        thumbnail_url: '',
        tags: [],
        visible: true,
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const data = await api.getBlogs();
            setBlogs(data);
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingBlog) {
                await api.updateBlog(editingBlog.id, formData);
                toast.success('Blog updated successfully!');
            } else {
                await api.createBlog(formData);
                toast.success('Blog created successfully!');
            }

            await fetchBlogs();
            resetForm();
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error('Failed to save blog:', error);
            toast.error(error.message || 'Failed to save blog');
        }
    };

    const handleEdit = (blog: Blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            description: blog.description || '',
            content: blog.content,
            thumbnail_url: blog.thumbnail_url || '',
            tags: blog.tags || [],
            visible: blog.visible,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            await api.deleteBlog(id);
            toast.success('Blog deleted successfully!');
            await fetchBlogs();
        } catch (error) {
            console.error('Failed to delete blog:', error);
            toast.error('Failed to delete blog');
        }
    };

    const toggleVisibility = async (blog: Blog) => {
        try {
            await api.updateBlog(blog.id, { visible: !blog.visible });
            toast.success(`Blog ${!blog.visible ? 'published' : 'hidden'}!`);
            await fetchBlogs();
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
            toast.error('Failed to update blog');
        }
    };

    const resetForm = () => {
        setEditingBlog(null);
        setFormData({
            title: '',
            description: '',
            content: '',
            thumbnail_url: '',
            tags: [],
            visible: true,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading blogs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-orbitron text-gradient">Blogs & Updates</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your blog posts and articles</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="fixed left-[50%] top-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] w-[95%] md:w-full md:max-w-[900px] max-h-[85vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-[16px] flex flex-col overflow-hidden outline-none">
                        <DialogHeader className="p-6 pb-2 border-b border-border/50">
                            <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
                            <DialogDescription>
                                {editingBlog ? 'Update your blog post details' : 'Add a new blog post to your portfolio'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>
                            <form id="blog-form" onSubmit={handleSubmit} className="space-y-6 max-w-full pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Enter blog title"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <TagInput
                                            tags={formData.tags || []}
                                            onChange={(tags) => setFormData({ ...formData, tags })}
                                            placeholder="Add tags (Web Security, Pentesting, etc.)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description or excerpt (shown in blog cards)"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <ImageUpload
                                    label="Thumbnail Image"
                                    folder="blogs"
                                    currentImageUrl={formData.thumbnail_url}
                                    onImageUploaded={(url) => setFormData({ ...formData, thumbnail_url: url })}
                                    onImageRemoved={() => setFormData({ ...formData, thumbnail_url: '' })}
                                />

                                <div className="space-y-2">
                                    <Label>Content *</Label>
                                    <Tabs defaultValue="write" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-4">
                                            <TabsTrigger value="write">Write</TabsTrigger>
                                            <TabsTrigger value="preview">Preview</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="write" className="mt-0">
                                            <Textarea
                                                id="content"
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                placeholder="Write your blog content here... (Markdown supported)"
                                                rows={15}
                                                required
                                                className="font-mono text-sm min-h-[400px]"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Supports markdown formatting • Reading time will be calculated automatically
                                            </p>
                                        </TabsContent>
                                        <TabsContent value="preview" className="mt-0">
                                            <div className="min-h-[400px] p-6 border rounded-md bg-background/50 overflow-y-auto max-h-[600px]">
                                                <div className="prose prose-invert prose-lg max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                                        components={{
                                                            img: ({ node, ...props }) => (
                                                                <img
                                                                    {...props}
                                                                    className="max-w-full h-auto rounded-lg my-4 mx-auto block shadow-md"
                                                                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                                                                />
                                                            ),
                                                            table: ({ node, ...props }) => (
                                                                <div className="overflow-x-auto my-6 rounded-lg border border-border/50">
                                                                    <table {...props} className="w-full border-collapse text-sm md:text-base" />
                                                                </div>
                                                            ),
                                                            thead: ({ node, ...props }) => (
                                                                <thead {...props} className="bg-primary/5 text-primary font-bold" />
                                                            ),
                                                            th: ({ node, ...props }) => (
                                                                <th {...props} className="p-3 text-left border-b border-border/50 whitespace-nowrap" />
                                                            ),
                                                            td: ({ node, ...props }) => (
                                                                <td {...props} className="p-3 border-b border-border/10" />
                                                            ),
                                                            p: ({ node, ...props }) => (
                                                                <p {...props} className="leading-[1.8] mb-4 text-foreground/90" />
                                                            ),
                                                            ul: ({ node, ...props }) => (
                                                                <ul {...props} className="list-disc pl-6 mb-4 space-y-2" />
                                                            ),
                                                            ol: ({ node, ...props }) => (
                                                                <ol {...props} className="list-decimal pl-6 mb-4 space-y-2" />
                                                            ),
                                                            li: ({ node, ...props }) => (
                                                                <li {...props} className="leading-[1.7]" />
                                                            ),
                                                            code: ({ node, className, children, ...props }) => {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                const isInline = !match && !String(children).includes('\n');
                                                                return isInline ? (
                                                                    <code {...props} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <div className="overflow-x-auto my-4 rounded-lg bg-black/50 p-4 border border-border/30">
                                                                        <code {...props} className="block font-mono text-sm leading-relaxed text-gray-300 min-w-max">
                                                                            {children}
                                                                        </code>
                                                                    </div>
                                                                );
                                                            },
                                                            blockquote: ({ node, ...props }) => (
                                                                <blockquote {...props} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-6" />
                                                            ),
                                                            a: ({ node, ...props }) => (
                                                                <a {...props} className="text-primary hover:underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" />
                                                            ),
                                                            h1: ({ node, ...props }) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4 text-gradient" />,
                                                            h2: ({ node, ...props }) => <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-foreground" />,
                                                            h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-bold mt-6 mb-3 text-foreground/90" />,
                                                        }}
                                                    >
                                                        {formData.content || '*No content yet*'}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="visible"
                                        checked={formData.visible}
                                        onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                                    />
                                    <Label htmlFor="visible" className="cursor-pointer">
                                        Publish immediately
                                    </Label>
                                </div>
                            </form>
                        </div>
                        <DialogFooter className="p-6 border-t border-border/50 bg-background/95 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    setIsDialogOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" form="blog-form">
                                {editingBlog ? 'Update Post' : 'Create Post'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {blogs.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">No blog posts yet</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Post
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        {blog.thumbnail_url && (
                                            <img
                                                src={blog.thumbnail_url}
                                                alt={blog.title}
                                                className="w-full h-32 object-cover rounded-md mb-2"
                                            />
                                        )}
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl">{blog.title}</CardTitle>
                                            {!blog.visible && (
                                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                                    Draft
                                                </Badge>
                                            )}
                                        </div>

                                        {blog.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {blog.description}
                                            </p>
                                        )}

                                        {blog.tags && blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {blog.tags.map((tag) => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(blog.created_at).toLocaleDateString()}
                                            </span>
                                            {blog.reading_time && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {blog.reading_time} min read
                                                </span>
                                            )}
                                            {blog.updated_at && blog.updated_at !== blog.created_at && (
                                                <span>Updated: {new Date(blog.updated_at).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleVisibility(blog)}
                                            title={blog.visible ? 'Hide post' : 'Publish post'}
                                        >
                                            {blog.visible ? (
                                                <Eye className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(blog)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(blog.id)}
                                            className="hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Blogs;
