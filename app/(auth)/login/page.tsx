"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoginUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { mutate: login, isPending } = useLoginUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login({ email, password });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left Side: Informative Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="hidden lg:flex flex-col space-y-8 p-8"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
                                Welcome back to <span className="font-medium">Orqent</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed">
                                The most powerful AI chat widget platform designed for modern business scale.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Real-time Analytics", desc: "Track every interaction and token usage with precision." },
                                { title: "Customizable Widgets", desc: "Match your brand identity with our advanced UI engine." },
                                { title: "Seamless Integrations", desc: "Connect with your favorite tools and MCP servers instantly." }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="mt-1 bg-primary/10 p-1 rounded-full">
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-border/50">
                            <p className="text-sm text-muted-foreground italic">
                                "Orqent transformed how we handle customer support. The AI agents are incredibly intuitive."
                            </p>
                            <p className="mt-2 text-sm font-medium">— Sarah Chen, CTO at TechFlow</p>
                        </div>
                    </motion.div>

                    {/* Right Side: Login Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-md mx-auto"
                    >
                        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
                            <CardHeader className="space-y-1 pb-8">
                                <div className="flex justify-center mb-4 lg:hidden">
                                    <Link href="/" className="text-2xl font-bold tracking-tighter">
                                        Orqent
                                    </Link>
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-center lg:text-left">Login</CardTitle>
                                <CardDescription className="text-center lg:text-left">
                                    Enter your credentials to access your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-background/20 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Link
                                                href="#"
                                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-background/20 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full mt-2" disabled={isPending}>
                                        {isPending ? "Logging in..." : "Log in"}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-4 pb-8">
                                <div className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
                                        Sign up
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
