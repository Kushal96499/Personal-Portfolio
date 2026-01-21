import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    type?: 'website' | 'article';
    pathname?: string;
}

export const SEO = ({
    title,
    description,
    keywords,
    ogImage = '/og-image.png',
    type = 'website',
    pathname = ''
}: SEOProps) => {
    const siteUrl = 'https://kushalkumawat.in';
    const fullUrl = `${siteUrl}${pathname}`;

    const pageTitle = title
        ? `${title} | Kushal Kumawat`
        : 'Kushal Kumawat - Full-Stack Developer | Modern Web Solutions';

    const defaultKeywords = 'Kushal Kumawat, Full-Stack Developer, Web Development, React, Next.js, Tailwind CSS, Portfolio Website, Freelance Web Developer';

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{pageTitle}</title>
            <meta name="title" content={pageTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${siteUrl}${ogImage}`} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={pageTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
        </Helmet>
    );
};
