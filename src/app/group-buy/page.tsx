'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GroupBuyCard from '@/components/GroupBuyCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroupBuy } from '@/types';
import { getByField, Collections } from '@/lib/db';
import { processDeadlines, summarize } from '@/lib/groupbuy';
import { Boxes, Plus, Tag, Users, History } from 'lucide-react';
import Link from 'next/link';

export default function GroupBuyPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) {
            router.push('/login');
            return;
        }
        if (!currentUser) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, isLoggedIn, mounted]);

    const load = () => {
        // Auto-confirm / auto-cancel deals whose deadlines just passed.
        processDeadlines();
        const deals = getByField<GroupBuy>(
            Collections.GROUP_BUYS,
            'communityId',
            currentUser!.communityId,
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setGroupBuys(deals);
    };

    if (!mounted || !isLoggedIn || !currentUser) return null;

    const open = groupBuys.filter((g) => g.status === 'open');
    const inProgress = groupBuys.filter((g) => g.status === 'confirmed');
    const ready = groupBuys.filter((g) => g.status === 'ready');
    const past = groupBuys.filter((g) => g.status === 'completed' || g.status === 'cancelled');

    const totalCommitted = groupBuys
        .filter((g) => g.status !== 'cancelled')
        .reduce((sum, g) => sum + summarize(g).committedQty, 0);
    const totalSavings = groupBuys
        .filter((g) => g.status !== 'cancelled')
        .reduce((sum, g) => sum + summarize(g).totalSavings, 0);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <Boxes className="w-6 h-6 text-primary" />
                            Group Buy
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Combine demand, unlock bulk discounts, purchase together.
                        </p>
                    </div>
                    <Link href="/group-buy/create">
                        <Button className="gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow gap-2 rounded-xl h-12 px-6">
                            <Plus className="w-5 h-5" />
                            New Group Buy
                        </Button>
                    </Link>
                </div>

                {/* Community savings strip */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { icon: Boxes, label: 'Deals running', value: open.length + inProgress.length + ready.length, color: 'text-primary' },
                        { icon: Users, label: 'Units committed', value: totalCommitted, color: 'text-blue-500' },
                        { icon: Tag, label: 'Community savings', value: `₹${totalSavings.toLocaleString('en-IN')}`, color: 'text-[#00754A]' },
                    ].map((stat) => (
                        <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Open deals */}
                <Section title="Accepting Pledges" deals={open} emptyLabel="No open deals right now" emptyHint="Start one — how many notebooks does your hostel need?" />

                {/* Ready for pickup */}
                {ready.length > 0 && (
                    <Section title="Ready for Pickup" deals={ready} emptyLabel="" emptyHint="" />
                )}

                {/* Confirmed / in progress */}
                {inProgress.length > 0 && (
                    <Section title="Order Confirmed — Waiting on Store" deals={inProgress} emptyLabel="" emptyHint="" />
                )}

                {/* History */}
                {past.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-muted-foreground" />
                            <h2 className="text-lg font-bold text-muted-foreground">Past Deals</h2>
                            <Badge variant="outline" className="text-xs">{past.length}</Badge>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {past.map((gb) => (
                                <GroupBuyCard key={gb.id} groupBuy={gb} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function Section({
    title,
    deals,
    emptyLabel,
    emptyHint,
}: {
    title: string;
    deals: GroupBuy[];
    emptyLabel: string;
    emptyHint: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-primary" />
                    {title}
                </h2>
                <Badge variant="outline" className="text-xs">{deals.length}</Badge>
            </div>

            {deals.length === 0 ? (
                emptyLabel ? (
                    <Card className="border-dashed border-2 border-border">
                        <CardContent className="py-16 text-center">
                            <Boxes className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">{emptyLabel}</p>
                            <p className="text-sm text-muted-foreground mt-1">{emptyHint}</p>
                        </CardContent>
                    </Card>
                ) : null
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deals.map((gb) => (
                        <GroupBuyCard key={gb.id} groupBuy={gb} />
                    ))}
                </div>
            )}
        </div>
    );
}
