'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TripCard from '@/components/TripCard';
import { Trip } from '@/types';
import { getByField, Collections } from '@/lib/db';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function MyTripsPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) { router.push('/login'); return; }
        if (!currentUser) return;
        const myTrips = getByField<Trip>(Collections.TRIPS, 'helperId', currentUser.id);
        setTrips(myTrips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, [mounted, isLoggedIn, currentUser, router]);

    if (!mounted || !currentUser) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary" />
                        My Trips
                    </h1>
                    <Link href="/trips/create">
                        <Button className="gradient-primary text-white gap-2 rounded-xl">
                            <Plus className="w-4 h-4" />
                            New Trip
                        </Button>
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">You haven&apos;t posted any trips yet</p>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">Post a trip when you&apos;re heading out!</p>
                            <Link href="/trips/create">
                                <Button variant="outline" className="gap-2">
                                    <Plus className="w-4 h-4" /> Post a Trip
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trips.map((trip) => (
                            <TripCard key={trip.id} trip={trip} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
