"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegisterUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Rocket, ShieldCheck, Zap } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const { mutate: register, isPending } = useRegisterUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        register({ name, email, password, companyName });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />

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
                                Join the future of <span className="font-medium text-primary">interaction</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-light leading-relaxed">
                                Set up your AI chat widget in minutes and start engaging your visitors like never before.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { icon: Rocket, title: "Fast Deployment", desc: "Get up and running with just one line of code." },
                                { icon: Zap, title: "AI-Powered", desc: "Leverage the latest LLMs to automate your support flow." },
                                { icon: ShieldCheck, title: "Enterprise Grade", desc: "Secure, scalable, and compliant with modern standards." }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start bg-secondary/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                                    <div className="mt-1 bg-primary/10 p-2 rounded-xl">
                                        <feature.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <p className="text-sm font-medium text-primary mb-1">Limited Time Offer</p>
                            <p className="text-sm text-muted-foreground">
                                Sign up today and get a <span className="text-foreground font-semibold">14-day free trial</span>. No credit card required.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Side: Register Form */}
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
                                <CardTitle className="text-2xl font-bold tracking-tight text-center lg:text-left">Create an account</CardTitle>
                                <CardDescription className="text-center lg:text-left">
                                    Enter your details to get started with Orqent
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="bg-background/20 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all"
                                        />
                                    </div>
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
                                        <Label htmlFor="companyName">Company (Optional)</Label>
                                        <Input
                                            id="companyName"
                                            placeholder="Acme Inc."
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="bg-background/20 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
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
                                        {isPending ? "Creating account..." : "Sign up"}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-4 pb-8">
                                <div className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                                        Log in
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
