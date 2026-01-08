import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { Blog } from "@/integrations/supabase/types";
import { format } from "date-fns";
import PageWrapper from "@/components/PageWrapper";
import { BlurImage } from "@/components/ui/BlurImage";

const Blog = () => {
    const [posts, setPosts] = useState<Blog[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await api.getPublicBlogs();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    const allTags = Array.from(new Set(posts.flatMap(post => post.tags || [])));

    return (
        <div className="min-h-screen text-white selection:bg-white/20">
            <Navbar />

            <main className="pt-32 pb-20 container mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-20 space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter"
                    >
                        Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Magazine</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/50 max-w-2xl mx-auto font-light"
                    >
                        Thoughts on engineering, design, and the future of tech.
                    </motion.p>
                </div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl mx-auto mb-16 space-y-6"
                >
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" />
                        <Input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 bg-white/5 border-white/10 h-12 rounded-full text-white placeholder:text-white/30 focus:bg-white/10 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        <Button
                            variant={selectedTag === null ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedTag(null)}
                            className="rounded-full"
                        >
                            All
                        </Button>
                        {allTags.map(tag => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedTag(tag)}
                                className="rounded-full text-white/60 hover:text-white"
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                </motion.div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col h-full"
                        >
                            <Link to={`/blog/${post.slug}`} className="block flex-grow">
                                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6 bg-white/5">
                                    {post.thumbnail_url ? (
                                        <BlurImage
                                            src={post.thumbnail_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10">
                                            <Search className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-black/50 backdrop-blur-md border-white/10 text-white hover:bg-black/70 transition-colors">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {post.reading_time || 5} min read
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                                        </span>
                                        <span>•</span>
                                        <span className="text-white/60">{post.tags?.[0] || 'Tech'}</span>
                                    </div>

                                    <h2 className="text-2xl font-bold leading-tight group-hover:text-white/80 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-white/50 line-clamp-3 font-light leading-relaxed">
                                        {post.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                {!loading && filteredPosts.length === 0 && (
                    <div className="text-center py-20 text-white/30">
                        <p>No articles found matching your criteria.</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Blog;
