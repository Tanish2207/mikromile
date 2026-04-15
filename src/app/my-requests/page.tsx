'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RequestCard from '@/components/RequestCard';
import { ItemRequest, Trip } from '@/types';
import { getByField, getById, Collections } from '@/lib/db';
import { Package, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyRequestsPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) { router.push('/login'); return; }
        if (!currentUser) return;
        const myReqs = getByField<ItemRequest>(Collections.REQUESTS, 'requesterId', currentUser.id);
        setRequests(myReqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, [mounted, isLoggedIn, currentUser, router]);

    if (!mounted || !currentUser) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    My Requests
                </h1>

                {requests.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">You haven&apos;t requested anything yet</p>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">Check the dashboard for active trips!</p>
                            <Link href="/dashboard">
                                <Button variant="outline" className="gap-2">
                                    Browse Trips <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {requests.map((req) => {
                            const trip = getById<Trip>(Collections.TRIPS, req.tripId);
                            return (
                                <div key={req.id}>
                                    <Link href={`/trips/${req.tripId}`}>
                                        <div className="text-xs text-muted-foreground mb-1 pl-1 hover:text-primary transition-colors">
                                            Trip → {trip?.destinationShop}, {trip?.destinationArea}
                                        </div>
                                    </Link>
                                    <RequestCard request={req} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
