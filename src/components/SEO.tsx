import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    type?: 'website' | 'article';
    pathname?: string;
    schema?: object | object[];
}

export const SEO = ({
    title,
    description,
    keywords,
    ogImage = '/og-image.png',
    type = 'website',
    pathname = '',
    schema
}: SEOProps) => {
    const siteUrl = 'https://kushalkumawat.in';
    const fullUrl = `${siteUrl}${pathname}`;

    const pageTitle = title
        ? `${title} | Kushal Kumawat`
        : 'Kushal Kumawat | Web Developer & Cybersecurity Enthusiast';

    const defaultKeywords = 'Kushal Kumawat, Web Developer, Freelance Web Developer, Cybersecurity Enthusiast, Secure Web Development, React, Next.js, Tailwind CSS, Portfolio Website, Cybersecurity Projects';

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Kushal Kumawat",
        "url": siteUrl,
        "jobTitle": "Cybersecurity Expert & Full Stack Developer",
        "sameAs": [
            "https://github.com/Kushal96499",
            "https://www.linkedin.com/in/kushal-ku"
        ],
        "description": description
    };

    const finalSchema = schema 
        ? (Array.isArray(schema) ? [personSchema, ...schema] : [personSchema, schema])
        : personSchema;

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

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(finalSchema)}
            </script>
        </Helmet>
    );
};
