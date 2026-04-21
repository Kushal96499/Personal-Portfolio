import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionWrapper from "@/components/ui/SectionWrapper";

const faqs = [
    {
        question: "What cybersecurity services do you provide?",
        answer: "I specialize in comprehensive security solutions including penetration testing, vulnerability assessments, and secure code audits. My focus is on identifying critical flaws in web infrastructures before they can be exploited by malicious actors."
    },
    {
        question: "How do you integrate security into the development lifecycle?",
        answer: "I follow DevSecOps best practices, ensuring that security is a first-class citizen from design to deployment. This includes automated security scanning, dependency monitoring, and implementing robust OWASP-standard defenses in every application I build."
    },
    {
        question: "Which technologies do you use for full-stack development?",
        answer: "My core stack includes React/Next.js for high-performance frontends, paired with Node.js or Python (FastAPI/Django) for secure backends. I utilize Supabase and PostgreSQL for data management, ensuring all data is encrypted and access is strictly controlled."
    },
    {
        question: "Can you build custom cybersecurity tools?",
        answer: "Yes, I have extensive experience building specialized tools such as network scanners, password strength analyzers, and intrusion detection simulators. You can find several interactive examples in the 'Tools' section of this portfolio."
    },
    {
        question: "Are your web applications optimized for speed and SEO?",
        answer: "Absolutely. performance and search engine visibility are critical. I implement aggressive code splitting, image optimization, and technical SEO strategies (AEO/GEO) to ensure every site ranks high and loads in under 2 seconds."
    }
];

const FAQ = () => {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <SectionWrapper id="faq">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-white/60 text-lg font-light">
                        Quick answers to common questions about my technical expertise and security approach.
                    </p>
                </motion.div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem 
                            key={index} 
                            value={`item-${index}`}
                            className="border border-white/10 rounded-2xl bg-white/[0.02] px-6 py-2 overflow-hidden"
                        >
                            <AccordionTrigger className="text-left text-white hover:text-blue-400 font-medium text-lg transition-colors py-4">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/70 text-base font-light leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {/* Structured Data for SEO/AEO */}
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </div>
        </SectionWrapper>
    );
};

export default FAQ;
