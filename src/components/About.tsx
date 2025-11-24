import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";

const About = () => {
  const timeline = [
    {
      icon: <Briefcase className="text-primary" />,
      title: "Intern at CodTech",
      period: "Current",
      description: "Working on cybersecurity projects and web development",
    },
    {
      icon: <Briefcase className="text-secondary" />,
      title: "Intern at Inlighn Tech",
      period: "Current",
      description: "Developing automated solutions and security tools",
    },
    {
      icon: <GraduationCap className="text-accent" />,
      title: "BCA Student",
      period: "Biyani College",
      description: "Pursuing Bachelor of Computer Applications",
    },
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-gradient">Me</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Passionate cybersecurity student with hands-on experience in web development,
            Python automation, and security tools. Currently interning at leading tech companies
            while pursuing my degree.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 mb-8 relative"
            >
              <div className="glass p-4 rounded-lg flex-shrink-0 glow-cyan w-16 h-16 flex items-center justify-center mx-auto sm:mx-0">
                {item.icon}
              </div>
              <div className="glass p-6 rounded-lg flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-primary mb-2">{item.period}</p>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
