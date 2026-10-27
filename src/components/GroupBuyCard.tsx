'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { GroupBuy, Store } from '@/types';
import { getById, Collections } from '@/lib/db';
import { summarize, getParticipations } from '@/lib/groupbuy';
import { Tag, Users, Timer, MapPin, ArrowRight, Package } from 'lucide-react';

interface GroupBuyCardProps {
    groupBuy: GroupBuy;
}

/**
 * Compact card for the group buy feed / dashboard.
 * Shows the product, price drop, unlock progress, and deadline.
 */
export default function GroupBuyCard({ groupBuy: gb }: GroupBuyCardProps) {
    const store = getById<Store>(Collections.STORES, gb.storeId);
    const summary = summarize(gb, getParticipations(gb.id));

    const savingPct = Math.round(
        ((gb.individualPrice - gb.dealPrice) / gb.individualPrice) * 100,
    );

    const deadline = new Date(gb.deadline);
    let deadlineLabel = '';
    if (gb.status === 'open') {
        // Relative countdown is intentionally approximate at render time.
        // eslint-disable-next-line react-hooks/purity
        const diff = deadline.getTime() - Date.now();
        const hours = Math.ceil(diff / (60 * 60 * 1000));
        if (diff <= 0) {
            deadlineLabel = 'Closed';
        } else if (hours < 24) {
            deadlineLabel = `${hours}h left`;
        } else {
            deadlineLabel = `${Math.ceil(hours / 24)}d left`;
        }
    }

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden flex flex-col">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{gb.productName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {store?.name} · {store?.category}
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <StatusBadge status={gb.status} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
                {/* Price — wraps as a unit instead of clipping when the column is tight */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
                    <div className="flex items-baseline gap-2 shrink-0">
                        <span className="text-xl font-bold text-primary">₹{gb.dealPrice}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{gb.individualPrice}</span>
                    </div>
                    <Badge className="bg-[#d4e9e2] text-[#006241] border-[#00754A]/30 border text-[10px] font-semibold">
                        {savingPct}% OFF per {gb.unit || 'unit'}
                    </Badge>
                </div>

                {/* Progress */}
                {gb.status !== 'completed' && gb.status !== 'cancelled' && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs gap-2 flex-wrap min-w-0">
                            <span className="flex items-center gap-1 font-medium">
                                <Users className="w-3.5 h-3.5" />
                                {summary.committedQty}/{gb.minQuantity} pledged
                            </span>
                            {summary.unlocked ? (
                                <span className="text-[#00754A] font-medium">Deal unlocked! 🎉</span>
                            ) : (
                                <span className="text-muted-foreground">{summary.remainingToMin} more to unlock</span>
                            )}
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full ${summary.unlocked ? 'bg-[#00754A]' : 'gradient-primary'}`}
                                style={{ width: `${summary.progressPct}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-muted-foreground min-w-0">
                    <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        {summary.participantCount} student{summary.participantCount !== 1 ? 's' : ''} · saves ₹{summary.totalSavings} so far
                    </p>
                    {gb.status === 'open' && (
                        <p className="flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 shrink-0" />
                            Deadline {deadline.toLocaleString('en-IN', { day: 'numeric', month: 'short' })} · {deadlineLabel}
                        </p>
                    )}
                    {gb.status === 'ready' && (
                        <p className="flex items-center gap-1.5 text-[#00754A] font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            Collect at {gb.pickupLocation}
                        </p>
                    )}
                    {(gb.status === 'completed' || gb.status === 'cancelled') && (
                        <p className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 shrink-0" />
                            {gb.status === 'completed' ? `Delivered · ₹${summary.totalSavings} community savings` : 'Missed the minimum'}
                        </p>
                    )}
                </div>

                <Link href={`/group-buy/${gb.id}`} className="block pt-1">
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors gap-2">
                        View Details
                        <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
