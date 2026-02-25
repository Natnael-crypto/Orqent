"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const ContentSections = () => {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      {/* Product / Features - Bento Grid Style */}
      <section id="product" className="section-padding py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
              Built for speed. <br />
              <span className="text-muted-foreground">Designed for scale.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl">
              From solo developers to enterprise teams, Orqent provides the
              infrastructure to deploy AI agents instantly.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[400px]">
            {/* Usage Analysis - Large Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-secondary/30 border border-border/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 group-hover:to-primary/10 transition-colors duration-500" />
              <div className="p-8 md:p-12 relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-medium mb-2">
                    Deep Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    Track token usage, costs, and conversation quality in
                    real-time.
                  </p>
                </div>
                {/* Abstract Visual Representation instead of Icon */}
                <div className="mt-8 relative w-full h-48 rounded-xl overflow-hidden shadow-2xl border border-border/20">
                  <Image
                    src="/section-analytics.jpg"
                    alt="Analytics Interface"
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </motion.div>

            {/* Team Collaboration - Tall Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:row-span-2 relative group overflow-hidden rounded-3xl bg-secondary/30 border border-border/50"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5" />
              <div className="h-1/2 p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-medium mb-2">
                  Team Sync
                </h3>
                <p className="text-muted-foreground">
                  Collaborate on prompts and agent configs with your entire team.
                </p>
              </div>
              <div className="h-1/2 relative overflow-hidden">
                <Image
                  src="/section-team.jpg"
                  alt="Team Collaboration"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Global Infrastructure - Medium Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-1 relative group overflow-hidden rounded-3xl bg-black text-white p-8 md:p-12 flex flex-col justify-end min-h-[300px]"
            >
              <div className="absolute inset-0">
                <Image
                  src="/section-infrastructure.jpg"
                  alt="Infrastructure"
                  fill
                  className="object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-light mb-2">99.99%</div>
                <div className="text-sm text-zinc-400 font-medium tracking-wide uppercase">Uptime SLA</div>
              </div>
            </motion.div>

            {/* Security - Medium Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-1 relative group overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 font-display text-9xl leading-none select-none overflow-hidden">
                S
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl font-medium mb-2">Enterprise Ready</h3>
                <p className="text-primary-foreground/70 text-sm">
                  SOC 2 Type II compliant. End-to-end encryption.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Demo - Cinematic Full Width */}
      <section className="py-24 md:py-32 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-background"
          >
            <div className="p-4 border-b border-border bg-subtle/50 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <div className="text-xs font-mono text-muted-foreground opacity-50">dashboard.Orqent.ai</div>
              <div className="w-4" /> {/* Spacer */}
            </div>
            <Image
              src="/product-mockup.jpg"
              alt="Orqent Dashboard"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* About - Typography Focused */}
      <section id="about" className="section-padding py-24 md:py-40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-light leading-tight mb-12">
              Before Orqent, building AI support was complex. <br />
              <span className="text-muted-foreground">Now it&apos;s just one line of code.</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-20 text-left">
              {[
                { label: "Founded", value: "2024" },
                { label: "Location", value: "San Francisco" },
                { label: "Customers", value: "2,000+" },
                { label: "SLA", value: "99.9%" },
              ].map((stat, i) => (
                <div key={i} className="border-t border-border pt-6">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="text-2xl md:text-3xl font-light">{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContentSections;
