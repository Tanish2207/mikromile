'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Package } from 'lucide-react';

export default function LoginPage() {
    const { allUsers, login } = useAuth();
    const router = useRouter();

    const handleLogin = (userId: string) => {
        login(userId);
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 gradient-hero opacity-5" />
            <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-lg space-y-6">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.01em] text-[#006241]">Welcome to MikroMile</h1>
                    <p className="text-muted-foreground">Choose an account to continue</p>
                </div>

                {/* User Cards */}
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Select Account</CardTitle>
                        <CardDescription>Pick a demo account to explore the app</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {allUsers.map((user) => {
                            const initials = user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase();

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => handleLogin(user.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:shadow-md group border border-transparent hover:border-border/50 text-left"
                                >
                                    <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                                        <AvatarFallback className="gradient-primary text-white font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-amber-500" />
                                            {user.averageRating.toFixed(1)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {user.totalDeliveries}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    This is a demo. No real authentication is used.
                </p>
            </div>
        </div>
    );
}
