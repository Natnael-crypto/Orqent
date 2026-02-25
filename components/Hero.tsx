"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -50]);
  const contentScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  return (
    <section ref={containerRef} className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="AI Interaction"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" />
        </div>

        {/* Content */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY, scale: contentScale }}
          className="relative z-10 w-full section-padding"
        >
          <div className="max-w-4xl">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-light tracking-tight text-white leading-[0.95] mb-8">
              Intelligent chat,
              <br />
              <span className="text-white/80">built for scale.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 max-w-lg mb-10 font-light leading-relaxed">
              Deploy AI-powered chat widgets across your products. Manage
              conversations, track usage, and optimize performance from one
              platform.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium px-8 py-4 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                Start building
              </Link>
              <Link
                href="#product"
                className="text-sm font-medium px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                See how it works
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
