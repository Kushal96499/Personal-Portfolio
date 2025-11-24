import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";

interface CommandOutput {
  command: string;
  output: string[];
}

const Terminal = () => {
  const [displayedCommands, setDisplayedCommands] = useState<CommandOutput[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const commands: CommandOutput[] = [
    {
      command: "nmap -sV 192.168.1.1",
      output: [
        "Starting Nmap scan...",
        "PORT     STATE SERVICE    VERSION",
        "22/tcp   open  ssh        OpenSSH 8.2",
        "80/tcp   open  http       nginx 1.18.0",
        "443/tcp  open  ssl/https  nginx 1.18.0",
        "Scan complete. 3 services detected."
      ]
    },
    {
      command: "python security_audit.py --target webapp",
      output: [
        "Initializing security audit...",
        "✓ SQL Injection tests: PASSED",
        "✓ XSS vulnerability scan: PASSED",
        "✓ Authentication checks: PASSED",
        "⚠ HTTPS enforcement: WARNING",
        "Audit complete. 1 warning found."
      ]
    },
    {
      command: "wireshark -i eth0 -f 'port 443'",
      output: [
        "Capturing on eth0...",
        "Packets captured: 1,247",
        "TLS handshakes: 34",
        "Encrypted traffic: 98.7%",
        "No suspicious activity detected."
      ]
    },
    {
      command: "metasploit --exploit web_vulnerabilities",
      output: [
        "Loading Metasploit Framework...",
        "Scanning for vulnerabilities...",
        "Found 0 critical vulnerabilities",
        "Found 2 medium vulnerabilities",
        "System security: GOOD"
      ]
    }
  ];

  useEffect(() => {
    if (currentCommandIndex >= commands.length) {
      setTimeout(() => {
        setDisplayedCommands([]);
        setCurrentCommandIndex(0);
        setCurrentCharIndex(0);
        setIsTyping(true);
      }, 3000);
      return;
    }

    const currentCommand = commands[currentCommandIndex];
    
    if (isTyping && currentCharIndex <= currentCommand.command.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
        if (currentCharIndex === currentCommand.command.length) {
          setIsTyping(false);
          setTimeout(() => {
            setDisplayedCommands(prev => [...prev, currentCommand]);
            setCurrentCommandIndex(prev => prev + 1);
            setCurrentCharIndex(0);
            setIsTyping(true);
          }, 500);
        }
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [currentCharIndex, currentCommandIndex, isTyping, commands]);

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-dark opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Live <span className="text-gradient">Terminal</span>
          </h2>
          <p className="text-muted-foreground">
            Watch cybersecurity tools in action
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-lg overflow-hidden glow-cyan">
            {/* Terminal Header */}
            <div className="bg-card/50 border-b border-border/50 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-primary/80" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <TerminalIcon size={16} className="text-primary" />
                <span className="text-sm text-muted-foreground">root@kushal-security:~$</span>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm bg-background/90 min-h-[400px]">
              {displayedCommands.map((cmd, index) => (
                <div key={index} className="mb-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="text-secondary">$</span>
                    <span>{cmd.command}</span>
                  </div>
                  {cmd.output.map((line, lineIndex) => (
                    <motion.div
                      key={lineIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: lineIndex * 0.1 }}
                      className={`pl-4 ${
                        line.includes("✓") ? "text-green-400" :
                        line.includes("⚠") ? "text-yellow-400" :
                        line.includes("✗") ? "text-red-400" :
                        "text-muted-foreground"
                      }`}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              ))}
              
              {/* Current typing command */}
              {isTyping && currentCommandIndex < commands.length && (
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-secondary">$</span>
                  <span>
                    {commands[currentCommandIndex].command.substring(0, currentCharIndex)}
                    <span className="animate-pulse">▋</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Terminal;
