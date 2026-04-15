'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Trip, User } from '@/types';
import { getById, getByField, Collections } from '@/lib/db';
import { ItemRequest } from '@/types';
import { MapPin, Clock, Package, ArrowRight } from 'lucide-react';

interface TripCardProps {
    trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
    const helper = getById<User>(Collections.USERS, trip.helperId);
    const requests = getByField<ItemRequest>(Collections.REQUESTS, 'tripId', trip.id);
    const acceptedCount = requests.filter((r) => r.status === 'accepted' || r.status === 'purchased' || r.status === 'delivered').length;

    const initials = helper?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?';

    const returnTime = new Date(trip.expectedReturnTime);
    const timeStr = returnTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden">
            <div className="h-1 gradient-primary" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarFallback className="gradient-primary text-white text-sm font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{helper?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">⭐ {helper?.averageRating?.toFixed(1) || 'N/A'}</p>
                        </div>
                    </div>
                    <StatusBadge status={trip.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-sm">{trip.destinationShop}</p>
                            <p className="text-xs text-muted-foreground">{trip.destinationArea}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">Returns by {timeStr}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            {requests.length} request{requests.length !== 1 ? 's' : ''} · {acceptedCount} accepted
                        </p>
                    </div>
                </div>

                {trip.note && (
                    <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 italic">
                        &ldquo;{trip.note}&rdquo;
                    </p>
                )}

                <Link href={`/trips/${trip.id}`}>
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors gap-2">
                        View Trip
                        <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
