"use client";

import { motion, useScroll } from "framer-motion";
import { useRef } from "react";

const steps = [
    {
        title: "Widget Creation",
        description:
            "Design your chat widget with multi-step forms. Configure names, user-level prompt engineering, logo selection, and visual style.",
    },
    {
        title: "Conversation History",
        description:
            "Access comprehensive logs of every interaction. Dive deep into detailed conversation histories to understand user intent.",
    },
    {
        title: "Powerful Integrations",
        description:
            " seamlessly connect your account with external tool APIs and MCP servers to expand your agent's capabilities.",
    },
    {
        title: "Account Management",
        description:
            "Full control over your workspace. Manage team members, permissions, and global settings from a unified dashboard.",
    },
    {
        title: "Usage Analytics",
        description:
            "Monitor performance in real-time. Track token usage, response times, and active user metrics.",
    },
    {
        title: "Weekly Insights",
        description:
            "Receive automated weekly reports detailing conversation analytics for each of your deployed chat widgets.",
    },
    {
        title: "Customization & Deployment",
        description:
            "Fine-tune the UI to match your brand perfectly. Customize colors, typography, and layout before going live.",
    },
];

const HowItWorks = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    return (
        <section ref={containerRef} className="section-padding py-24 md:py-32 bg-background relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
                        Complete control, <br />
                        <span className="text-muted-foreground">step by step.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                        Everything you need to build, manage, and analyze your AI agents.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Vertical Line Background */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border md:left-1/2 md:-ml-px" />

                    {/* Vertical Line Fill */}
                    <motion.div
                        style={{ scaleY: scrollYProgress }}
                        className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-foreground origin-top md:left-1/2 md:-ml-px"
                    />

                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <StepItem key={index} step={step} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const StepItem = ({ step, index }: { step: typeof steps[0]; index: number }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex items-start md:items-center gap-8 md:gap-0 ${isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
        >
            {/* Number Marker */}
            <div className="absolute left-0 md:left-1/2 -ml-2.5 md:-ml-5 w-10 h-10 rounded-full border-4 border-background bg-foreground text-background flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                {index + 1}
            </div>

            {/* Content Spacer for Desktop */}
            <div className="hidden md:block w-1/2" />

            {/* Content */}
            <div className={`flex-1 pl-12 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                <h3 className="text-2xl font-medium mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                </p>
            </div>
        </motion.div>
    );
};

export default HowItWorks;
