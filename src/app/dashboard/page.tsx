'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TripCard from '@/components/TripCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trip, Community, Notification } from '@/types';
import { getAll, getById, getByField, Collections } from '@/lib/db';
import { Plus, MapPin, Bell, Users, Package, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [community, setCommunity] = useState<Community | null>(null);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
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

        const comm = getById<Community>(Collections.COMMUNITIES, currentUser.communityId);
        setCommunity(comm || null);

        // Get all trips from user's community
        const allTrips = getByField<Trip>(Collections.TRIPS, 'communityId', currentUser.communityId);
        // Sort by createdAt desc, show active first
        const sorted = allTrips.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTrips(sorted);

        const notifs = getByField<Notification>(Collections.NOTIFICATIONS, 'userId', currentUser.id);
        setUnreadNotifs(notifs.filter((n) => !n.read).length);
    }, [currentUser, isLoggedIn, router, mounted]);

    if (!mounted || !isLoggedIn || !currentUser) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Welcome header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            Hey, {currentUser.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {community ? `${community.name}` : 'Your community dashboard'}
                        </p>
                    </div>
                    <Link href="/trips/create">
                        <Button className="gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow gap-2 rounded-xl h-12 px-6">
                            <Plus className="w-5 h-5" />
                            Post a Trip
                        </Button>
                    </Link>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Package, label: 'Deliveries', value: currentUser.totalDeliveries, color: 'text-blue-500' },
                        { icon: Trophy, label: 'Reward Points', value: currentUser.totalRewardPoints, color: 'text-amber-500' },
                        { icon: TrendingUp, label: 'Rating', value: `${currentUser.averageRating.toFixed(1)} ⭐`, color: 'text-emerald-500' },
                        { icon: Bell, label: 'Notifications', value: unreadNotifs, color: 'text-violet-500' },
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

                {/* Community info bar */}
                {community && (
                    <Card className="border-border/50">
                        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{community.name}</p>
                                    <p className="text-xs text-muted-foreground">{community.members.length} members</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Invite Code:</span>
                                <Badge variant="secondary" className="font-mono text-sm">
                                    {community.inviteCode}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Active trips */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Active Trips
                        </h2>
                        <Badge variant="outline" className="text-xs">
                            {trips.filter((t) => t.status === 'active').length} active
                        </Badge>
                    </div>

                    {trips.length === 0 ? (
                        <Card className="border-dashed border-2 border-border">
                            <CardContent className="py-16 text-center">
                                <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">No trips posted yet</p>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">
                                    Be the first to post — heading somewhere?
                                </p>
                                <Link href="/trips/create">
                                    <Button variant="outline" className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Post a Trip
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
                </div>
            </main>
        </div>
    );
}
