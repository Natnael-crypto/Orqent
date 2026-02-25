"use client";

import { useState, useEffect } from "react";
import { User, Mail, Building, Lock, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<{ name: string; email: string; companyName?: string } | null>(null);
    const [profileData, setProfileData] = useState({
        name: "",
        companyName: "",
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setProfileData({
                        name: data.user.name || "",
                        companyName: data.user.companyName || "",
                    });
                }
            } catch (error: unknown) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileData),
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                });
            } else {
                const data = await res.json();
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Failed to update profile",
                });
            }
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "New passwords do not match",
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "New password must be at least 6 characters",
            });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Password updated successfully",
                });
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                const data = await res.json();
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Failed to update password",
                });
            }
        } catch (error: unknown) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and security preferences.</p>
            </div>

            <Separator />

            <div className="grid gap-8">
                {/* Profile Information */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Your personal and business details.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 opacity-60" /> Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="bg-slate-50/50"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 opacity-60" /> Email Address
                                    </Label>
                                    <Input disabled value={user?.email || ""} className="bg-slate-100/50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                                        <Building className="w-3.5 h-3.5 opacity-60" /> Company Name
                                    </Label>
                                    <Input
                                        id="companyName"
                                        value={profileData.companyName}
                                        onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                                        className="bg-slate-50/50"
                                        placeholder="Your company"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-3 p-3 text-sm bg-blue-50/50 text-blue-800 rounded-lg border border-blue-100">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <p>Email updates are locked for security reasons. Contact support to change your registered email.</p>
                                </div>

                                <Button type="submit" disabled={saving} className="w-full md:w-auto px-8">
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Security - Change Password */}
                <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Lock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Update your password to keep your account secure.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">Current Password</Label>
                                <Input
                                    id="oldPassword"
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <Button type="submit" disabled={saving} className="w-full md:w-auto mt-4 px-8">
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
