import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { Blog } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";

const Blog = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.getPublicBlogs();
      setPosts(data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="blog" className="py-32 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Cybersecurity Blogs
            </h2>
            <p className="text-white/60 max-w-xl text-lg font-light">
              Insights on security, development, and technology.
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex bg-white/5 border-white/10 hover:bg-white/10 text-white backdrop-blur-sm" asChild>
            <Link to="/blog">View All Posts</Link>
          </Button>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40">Loading articles...</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40">No articles published yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/blog/${post.slug}`} className="block h-full group">
                <Card className="h-full flex flex-col bg-white/[0.04] border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-300 overflow-hidden relative shadow-lg hover:shadow-2xl hover:-translate-y-1">
                  <div className="aspect-video bg-[#1A1A1A] relative overflow-hidden border-b border-white/5">
                    {/* 3D Glass Mask Effect */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <FileText className="w-12 h-12 text-white/10" />
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-black/40 backdrop-blur-md border border-white/10 text-white/90 hover:bg-black/60 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase">
                        {post.tags && post.tags.length > 0 ? post.tags[0] : 'Tech'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-grow relative z-10">
                    <div className="flex items-center gap-4 text-xs font-medium text-white/40 mb-4 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.reading_time ? `${post.reading_time} min read` : '5 min read'}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-white/60 text-sm mb-6 line-clamp-3 leading-relaxed font-light">
                      {post.description || "Click to read more about this topic..."}
                    </p>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 mt-auto relative z-10">
                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" className="w-full bg-white/5 border-white/10" asChild>
            <Link to="/blog">View All Posts</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Blog;
