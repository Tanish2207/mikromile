'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { create, getByField, Collections } from '@/lib/db';
import { Trip, User } from '@/types';
import { MapPin, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

export default function CreateTripPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [destinationArea, setDestinationArea] = useState('');
    const [destinationShop, setDestinationShop] = useState('');
    const [note, setNote] = useState('');
    const [expectedReturnTime, setExpectedReturnTime] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) router.push('/login');
    }, [mounted, isLoggedIn, router]);

    if (!mounted || !currentUser) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!destinationArea || !destinationShop || !expectedReturnTime) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const trip: Trip = {
            id: `trip-${uuid().slice(0, 8)}`,
            helperId: currentUser.id,
            communityId: currentUser.communityId,
            destinationArea,
            destinationShop,
            note: note || undefined,
            expectedReturnTime: new Date(expectedReturnTime).toISOString(),
            shopLocation: {
                lat: 19.0278 + (Math.random() - 0.5) * 0.01,
                lng: 72.8558 + (Math.random() - 0.5) * 0.01,
                address: address || `${destinationShop}, ${destinationArea}`,
            },
            status: 'active',
            createdAt: new Date().toISOString(),
        };

        create(Collections.TRIPS, trip);

        // Create notifications for all community members (except the helper)
        const users = getByField<User>(Collections.USERS, 'communityId', currentUser.communityId);
        users
            .filter((u: { id: string }) => u.id !== currentUser.id)
            .forEach((u: { id: string }) => {
                create(Collections.NOTIFICATIONS, {
                    id: `notif-${uuid().slice(0, 8)}`,
                    userId: u.id,
                    title: 'New Trip Posted! 🚀',
                    message: `${currentUser.name} is going to ${destinationShop} in ${destinationArea}.`,
                    type: 'trip_posted',
                    read: false,
                    relatedTripId: trip.id,
                    createdAt: new Date().toISOString(),
                });
            });

        toast.success('Trip posted! Your community has been notified.');
        router.push(`/trips/${trip.id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2 mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </Link>

                <Card className="border-border/50 shadow-xl overflow-hidden">
                    <div className="h-2 gradient-primary" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <MapPin className="w-6 h-6 text-primary" />
                            Post a Trip
                        </CardTitle>
                        <CardDescription>
                            Let your community know where you're heading — they might need something from there!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="area">Destination Area *</Label>
                                    <Input
                                        id="area"
                                        placeholder="e.g. Matunga, Dadar"
                                        value={destinationArea}
                                        onChange={(e) => setDestinationArea(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shop">Shop / Store Name *</Label>
                                    <Input
                                        id="shop"
                                        placeholder="e.g. Aarti Xerox"
                                        value={destinationShop}
                                        onChange={(e) => setDestinationShop(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Full Address (optional)</Label>
                                <Input
                                    id="address"
                                    placeholder="e.g. Shop No. 5, near VJTI Gate"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="return-time" className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Expected Return Time *
                                </Label>
                                <Input
                                    id="return-time"
                                    type="datetime-local"
                                    value={expectedReturnTime}
                                    onChange={(e) => setExpectedReturnTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Note (optional)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="e.g. Going for printouts, can pick up small items..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="min-h-[80px]"
                                />
                            </div>

                            {/* Map Placeholder */}
                            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                                <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">Google Maps Integration</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add your Google Maps API key in <code className="bg-muted px-1 rounded">.env.local</code> to enable location picker
                                </p>
                            </div>

                            <Button type="submit" className="w-full gradient-primary text-white h-12 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/25">
                                <Sparkles className="w-5 h-5" />
                                Post Trip
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
