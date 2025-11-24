import { motion } from "framer-motion";
import { Calendar, Clock, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { api } from "@/services/api";
import type { Blog } from "@/integrations/supabase/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';


const categories = ["All", "Web Security", "Pentesting", "Scripting", "Cloud Security"];

const BlogComponent = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBlog) {
        setSelectedBlog(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [selectedBlog]);

  const fetchBlogs = async () => {
    try {
      const data = await api.getPublicBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs by category (based on tags)
  const filteredBlogs = selectedCategory === "All"
    ? blogs
    : blogs.filter(blog => blog.tags?.includes(selectedCategory));

  return (
    <section id="blog" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Cybersecurity Blog
          </h2>
          <p className="text-muted-foreground text-lg">
            Articles, tutorials, and insights on cybersecurity
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                ? "bg-primary text-primary-foreground glow-cyan"
                : "glass text-foreground hover:bg-primary/10"
                }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts found.</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedBlog(post)}
                className="cursor-pointer"
              >
                <Card className="glass border-border/50 overflow-hidden group hover:glow-cyan transition-all duration-300 h-full">
                  {post.thumbnail_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">
                            {post.tags[0]}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {post.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.reading_time} min read</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {post.tags && post.tags.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(1, 4).map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Blog Detail Modal */}
        <Dialog open={!!selectedBlog} onOpenChange={(open) => !open && setSelectedBlog(null)}>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
          <DialogContent className="fixed left-[50%] top-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] w-[95%] md:w-full md:max-w-[900px] max-h-[85vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-[16px] flex flex-col overflow-hidden outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200">


            <div className="flex-1 overflow-y-auto scroll-smooth p-5 md:p-8" style={{ scrollbarGutter: 'stable' }}>
              {selectedBlog && (
                <div className="space-y-8 max-w-full pr-[24px]" style={{ boxSizing: 'border-box' }}>
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold font-orbitron text-gradient leading-tight">
                      {selectedBlog.title}
                    </h2>
                    <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedBlog.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                      {selectedBlog.reading_time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{selectedBlog.reading_time} min read</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail - Fully Responsive Container */}
                  {selectedBlog.thumbnail_url && (
                    <div className="w-full flex justify-center mb-6 overflow-hidden rounded-lg bg-black/5">
                      <img
                        src={selectedBlog.thumbnail_url}
                        alt={selectedBlog.title}
                        className="max-w-full h-auto object-contain max-h-[500px]"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="blog-content prose prose-invert prose-lg max-w-none">
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
                      {selectedBlog.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default BlogComponent;
