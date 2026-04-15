'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Community, Reward } from '@/types';
import { getById, getByField, Collections } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, Star, Package, Trophy, Mail, Phone, GraduationCap, Users, Gift } from 'lucide-react';

export default function ProfilePage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [community, setCommunity] = useState<Community | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) { router.push('/login'); return; }
        if (!currentUser) return;
        setCommunity(getById<Community>(Collections.COMMUNITIES, currentUser.communityId) || null);
        setRewards(
            getByField<Reward>(Collections.REWARDS, 'userId', currentUser.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
    }, [mounted, isLoggedIn, currentUser, router]);

    if (!mounted || !currentUser) return null;

    const initials = currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Profile Header */}
                <Card className="overflow-hidden border-border/50 shadow-lg">
                    <div className="h-24 gradient-primary relative">
                        <div className="absolute -bottom-10 left-6">
                            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                                <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <CardContent className="pt-14 pb-6 px-6">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                                <p className="text-muted-foreground text-sm">{currentUser.college}</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-center px-4 py-2 rounded-xl bg-muted">
                                    <p className="text-xl font-bold text-primary">{currentUser.averageRating.toFixed(1)}</p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
                                        <Star className="w-3 h-3 text-amber-500" /> Rating
                                    </p>
                                </div>
                                <div className="text-center px-4 py-2 rounded-xl bg-muted">
                                    <p className="text-xl font-bold text-primary">{currentUser.totalDeliveries}</p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
                                        <Package className="w-3 h-3" /> Deliveries
                                    </p>
                                </div>
                                <div className="text-center px-4 py-2 rounded-xl bg-muted">
                                    <p className="text-xl font-bold text-amber-500">{currentUser.totalRewardPoints}</p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center">
                                        <Trophy className="w-3 h-3" /> Points
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Info */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-primary" />
                                Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { icon: Mail, label: 'Email', value: currentUser.email },
                                { icon: Phone, label: 'Phone', value: currentUser.phoneNumber },
                                { icon: GraduationCap, label: 'College', value: currentUser.college },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3 text-sm">
                                    <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground w-16">{item.label}</span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                            <Separator />
                            {community && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground w-16">Community</span>
                                    <Badge variant="secondary">{community.name}</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Rewards */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Gift className="w-4 h-4 text-amber-500" />
                                Recent Rewards
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {rewards.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Gift className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No rewards yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Complete deliveries to earn points!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rewards.slice(0, 5).map((r) => (
                                        <div key={r.id} className="flex items-center justify-between text-sm">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{r.reason}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </p>
                                            </div>
                                            <Badge className="gradient-primary text-white border-0 ml-2">
                                                +{r.points}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
