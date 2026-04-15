'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User } from '@/types';
import { getByField, Collections } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Package, Medal, Crown, Award } from 'lucide-react';

export default function LeaderboardPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) { router.push('/login'); return; }
        if (!currentUser) return;
        const communityUsers = getByField<User>(Collections.USERS, 'communityId', currentUser.communityId);
        const sorted = communityUsers.sort((a, b) => b.totalRewardPoints - a.totalRewardPoints);
        setUsers(sorted);
    }, [mounted, isLoggedIn, currentUser, router]);

    if (!mounted || !currentUser) return null;

    const rankIcon = (idx: number) => {
        if (idx === 0) return <Crown className="w-6 h-6 text-amber-500" />;
        if (idx === 1) return <Medal className="w-6 h-6 text-slate-400" />;
        if (idx === 2) return <Award className="w-6 h-6 text-amber-600" />;
        return <span className="text-lg font-bold text-muted-foreground w-6 text-center">#{idx + 1}</span>;
    };

    const currentUserRank = users.findIndex((u) => u.id === currentUser.id) + 1;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    Leaderboard
                </h1>

                {/* Your rank card */}
                <Card className="overflow-hidden border-border/50">
                    <div className="h-1.5 gradient-primary" />
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-primary/30">
                                    <AvatarFallback className="gradient-primary text-white font-bold">
                                        {currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">Your Rank</p>
                                    <p className="text-sm text-muted-foreground">
                                        #{currentUserRank} out of {users.length} members
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{currentUser.totalRewardPoints}</p>
                                <p className="text-xs text-muted-foreground">points</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leaderboard list */}
                <Card className="border-border/50 shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Community Rankings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 p-2">
                        {users.map((user, idx) => {
                            const isMe = user.id === currentUser.id;
                            const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();

                            return (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${isMe ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
                                        }`}
                                >
                                    <div className="shrink-0 w-8 flex justify-center">
                                        {rankIcon(idx)}
                                    </div>
                                    <Avatar className={`h-10 w-10 shrink-0 ${idx < 3 ? 'border-2 border-primary/30' : 'border border-border'}`}>
                                        <AvatarFallback className={`text-sm font-semibold ${idx < 3 ? 'gradient-primary text-white' : 'bg-secondary text-secondary-foreground'}`}>
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm truncate">{user.name}</p>
                                            {isMe && (
                                                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">You</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500" />
                                                {user.averageRating?.toFixed(1) || '–'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3 h-3" />
                                                {user.totalDeliveries} deliveries
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-primary">{user.totalRewardPoints}</p>
                                        <p className="text-[10px] text-muted-foreground">pts</p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
