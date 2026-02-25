"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-start px-4 pt-4 md:px-8 md:pt-6 pointer-events-none">
      {/* Left Section: Logo + Navigation */}
      <div className="pointer-events-auto flex items-center gap-6 bg-background/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-full px-6 py-3 transition-transform hover:scale-[1.01]">
        <Link href="/" className="text-xl font-medium tracking-tight text-foreground">
          Orqent
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {["Product", "Platform", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-normal text-foreground/80 hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Right Section: Auth + Mobile Toggle */}
      <div className="flex flex-col items-end gap-2">
        <div className="pointer-events-auto flex items-center gap-3 bg-background/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-full px-5 py-3 transition-transform hover:scale-[1.01]">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-normal text-foreground/80 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="hidden sm:block text-sm font-medium px-5 py-2 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Get started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="pointer-events-auto md:hidden w-48 bg-background/60 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-4 flex flex-col gap-2 mt-2 mr-2 animate-in fade-in slide-in-from-top-2">
            {["Product", "Platform", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-foreground/80 hover:text-foreground transition-colors py-2 px-2 hover:bg-white/5 rounded-md"
              >
                {item}
              </a>
            ))}
            <div className="h-px bg-white/10 my-1" />
            <Link
              href="/login"
              className="text-sm text-foreground/80 hover:text-foreground py-2 px-2 hover:bg-white/5 rounded-md"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-center bg-foreground text-background py-2 rounded-full mt-1"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
