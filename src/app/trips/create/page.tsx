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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { create, getByField, Collections } from '@/lib/db';
import { Trip, User, GroupBuy } from '@/types';
import { MapPin, Clock, ArrowLeft, Sparkles, Boxes } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

// Leaflet/OpenStreetMap map (no Google API key needed). ssr:false is required —
// react-leaflet touches `window` on import.
const TripMap = dynamic(() => import('@/components/TripMap'), {
    ssr: false,
    loading: () => (
        <div className="h-[320px] w-full rounded-[12px] bg-secondary animate-pulse" />
    ),
});

// VJTI campus — the default pin the user can drag anywhere.
const DEFAULT_LAT = 19.0278;
const DEFAULT_LNG = 72.8558;

export default function CreateTripPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [destinationArea, setDestinationArea] = useState('');
    const [destinationShop, setDestinationShop] = useState('');
    const [note, setNote] = useState('');
    const [expectedReturnTime, setExpectedReturnTime] = useState('');
    const [address, setAddress] = useState('');
    const [pinLat, setPinLat] = useState(DEFAULT_LAT);
    const [pinLng, setPinLng] = useState(DEFAULT_LNG);
    const [groupBuyChoice, setGroupBuyChoice] = useState('none');
    const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) router.push('/login');
        if (mounted && currentUser) {
            // Confirmed/ready orders are the ones a trip can actually collect.
            const list = getByField<GroupBuy>(
                Collections.GROUP_BUYS,
                'communityId',
                currentUser.communityId,
            ).filter((g) => g.status === 'confirmed' || g.status === 'ready');
            setGroupBuys(list);
        }
    }, [mounted, isLoggedIn, router, currentUser]);

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
                lat: pinLat,
                lng: pinLng,
                address: address || `${destinationShop}, ${destinationArea}`,
            },
            status: 'active',
            groupBuyId: groupBuyChoice !== 'none' ? groupBuyChoice : undefined,
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

                            {/* Optional group buy link */}
                            {groupBuys.length > 0 && (
                                <div className="space-y-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                                    <Label className="flex items-center gap-1.5">
                                        <Boxes className="w-4 h-4 text-primary" />
                                        Carrying a MikroMile Group Order? (optional)
                                    </Label>
                                    <Select value={groupBuyChoice} onValueChange={(v) => setGroupBuyChoice(v ?? 'none')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Not carrying one" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No — regular errand</SelectItem>
                                            {groupBuys.map((g) => (
                                                <SelectItem key={g.id} value={g.id}>
                                                    {g.productName} ({g.status === 'ready' ? 'ready for pickup' : 'order confirmed'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-muted-foreground">
                                        Participants of that deal will see your trip on its page. The deal
                                        completes even with no helper — this is purely a hand up.
                                    </p>
                                </div>
                            )}

                            {/* Location picker — OpenStreetMap */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Shop Location (search, tap the map or drag the pin)
                                </Label>
                                <TripMap
                                    lat={pinLat}
                                    lng={pinLng}
                                    address={address || (destinationShop ? `${destinationShop}, ${destinationArea}` : undefined)}
                                    onPick={(lat, lng) => {
                                        setPinLat(lat);
                                        setPinLng(lng);
                                    }}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Pinned at {pinLat.toFixed(4)}, {pinLng.toFixed(4)} · community members see
                                    this pin on the trip page. Map data &copy; OpenStreetMap contributors.
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
