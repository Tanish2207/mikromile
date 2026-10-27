'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RequestCard from '@/components/RequestCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trip, ItemRequest, User, Urgency, Transaction, Notification as NotifType } from '@/types';
import { getById, getByField, create, update, Collections } from '@/lib/db';
import {
    MapPin,
    Clock,
    ArrowLeft,
    Package,
    Star,
    Send,
    CheckCircle2,
    XCircle,
    IndianRupee,
} from 'lucide-react';
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

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [helper, setHelper] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    // Request form
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [preferredBrand, setPreferredBrand] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState('');
    const [urgency, setUrgency] = useState<Urgency>('medium');
    const [reqNote, setReqNote] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadData = () => {
        const t = getById<Trip>(Collections.TRIPS, id);
        setTrip(t || null);
        if (t) {
            setHelper(getById<User>(Collections.USERS, t.helperId) || null);
            const reqs = getByField<ItemRequest>(Collections.REQUESTS, 'tripId', t.id);
            setRequests(reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
    };

    useEffect(() => {
        if (mounted && !isLoggedIn) {
            router.push('/login');
            return;
        }
        loadData();
    }, [mounted, isLoggedIn, id]);

    const isHelper = currentUser?.id === trip?.helperId;

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !trip) return;
        if (!itemName || !estimatedPrice) {
            toast.error('Please fill item name and estimated price.');
            return;
        }

        const req: ItemRequest = {
            id: `req-${uuid().slice(0, 8)}`,
            tripId: trip.id,
            requesterId: currentUser.id,
            itemName,
            quantity: parseInt(quantity) || 1,
            preferredBrand: preferredBrand || undefined,
            estimatedPrice: parseFloat(estimatedPrice),
            urgency,
            note: reqNote || undefined,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        create(Collections.REQUESTS, req);

        // Create escrow transaction
        const txn: Transaction = {
            id: `txn-${uuid().slice(0, 8)}`,
            requesterId: currentUser.id,
            helperId: trip.helperId,
            requestId: req.id,
            estimatedAmount: parseFloat(estimatedPrice),
            finalAmount: 0,
            status: 'held_in_escrow',
            createdAt: new Date().toISOString(),
        };
        create(Collections.TRANSACTIONS, txn);

        // Notify helper
        create(Collections.NOTIFICATIONS, {
            id: `notif-${uuid().slice(0, 8)}`,
            userId: trip.helperId,
            title: 'New Request! 📦',
            message: `${currentUser.name} requested "${itemName}" (₹${estimatedPrice}).`,
            type: 'trip_posted',
            read: false,
            relatedTripId: trip.id,
            relatedRequestId: req.id,
            createdAt: new Date().toISOString(),
        });

        toast.success('Request submitted!');
        setItemName('');
        setQuantity('1');
        setPreferredBrand('');
        setEstimatedPrice('');
        setReqNote('');
        loadData();
    };

    const handleAccept = (reqId: string) => {
        update<ItemRequest>(Collections.REQUESTS, reqId, { status: 'accepted' });
        const req = getById<ItemRequest>(Collections.REQUESTS, reqId);
        if (req) {
            create(Collections.NOTIFICATIONS, {
                id: `notif-${uuid().slice(0, 8)}`,
                userId: req.requesterId,
                title: 'Request Accepted! ✅',
                message: `${currentUser?.name} accepted your request for "${req.itemName}".`,
                type: 'request_accepted',
                read: false,
                relatedTripId: trip?.id,
                relatedRequestId: reqId,
                createdAt: new Date().toISOString(),
            });
        }
        toast.success('Request accepted!');
        loadData();
    };

    const handleReject = (reqId: string) => {
        update<ItemRequest>(Collections.REQUESTS, reqId, { status: 'rejected' });
        const req = getById<ItemRequest>(Collections.REQUESTS, reqId);
        if (req) {
            // Refund the transaction
            const txns = getByField<Transaction>(Collections.TRANSACTIONS, 'requestId', reqId);
            txns.forEach((t) => update<Transaction>(Collections.TRANSACTIONS, t.id, { status: 'refunded' }));

            create(Collections.NOTIFICATIONS, {
                id: `notif-${uuid().slice(0, 8)}`,
                userId: req.requesterId,
                title: 'Request Rejected',
                message: `Your request for "${req.itemName}" was declined.`,
                type: 'request_rejected',
                read: false,
                relatedTripId: trip?.id,
                relatedRequestId: reqId,
                createdAt: new Date().toISOString(),
            });
        }
        toast.info('Request rejected.');
        loadData();
    };

    const handleMarkDelivered = (reqId: string) => {
        update<ItemRequest>(Collections.REQUESTS, reqId, { status: 'delivered' });
        const req = getById<ItemRequest>(Collections.REQUESTS, reqId);
        if (req) {
            // Release the transaction
            const txns = getByField<Transaction>(Collections.TRANSACTIONS, 'requestId', reqId);
            txns.forEach((t) => update<Transaction>(Collections.TRANSACTIONS, t.id, { status: 'released', finalAmount: t.estimatedAmount }));

            // Add reward points to helper
            if (currentUser) {
                create(Collections.REWARDS, {
                    id: `reward-${uuid().slice(0, 8)}`,
                    userId: currentUser.id,
                    points: 10,
                    reason: `Delivered "${req.itemName}" to ${getById<User>(Collections.USERS, req.requesterId)?.name || 'user'}`,
                    createdAt: new Date().toISOString(),
                });
                update<User>(Collections.USERS, currentUser.id, {
                    totalRewardPoints: (currentUser.totalRewardPoints || 0) + 10,
                    totalDeliveries: (currentUser.totalDeliveries || 0) + 1,
                });
            }

            create(Collections.NOTIFICATIONS, {
                id: `notif-${uuid().slice(0, 8)}`,
                userId: req.requesterId,
                title: 'Item Delivered! 🎉',
                message: `Your "${req.itemName}" has been delivered. Rate your experience!`,
                type: 'delivery_complete',
                read: false,
                relatedTripId: trip?.id,
                relatedRequestId: reqId,
                createdAt: new Date().toISOString(),
            });
        }
        toast.success('Marked as delivered! +10 reward points 🎉');
        loadData();
    };

    if (!mounted || !trip || !currentUser) return null;

    const returnTime = new Date(trip.expectedReturnTime);
    const timeStr = returnTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = returnTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const helperInitials = helper?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?';

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2 mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>

                {/* Trip Info Card */}
                <Card className="overflow-hidden border-border/50 shadow-lg">
                    <div className="h-2 gradient-primary" />
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-14 w-14 border-2 border-primary/20">
                                    <AvatarFallback className="gradient-primary text-white text-lg font-bold">
                                        {helperInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h1 className="text-xl font-bold">{helper?.name}</h1>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-amber-500" />
                                        {helper?.averageRating?.toFixed(1)} · {helper?.totalDeliveries} deliveries
                                    </p>
                                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            {trip.destinationShop}, {trip.destinationArea}
                                        </span>
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            Returns {dateStr} at {timeStr}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={trip.status} />
                        </div>

                        {trip.note && (
                            <div className="mt-4 bg-muted/50 rounded-lg px-4 py-3 text-sm italic text-muted-foreground">
                                &ldquo;{trip.note}&rdquo;
                            </div>
                        )}

                        {/* Location map — OpenStreetMap pin at the shop */}
                        <div className="mt-4 space-y-2">
                            <TripMap
                                lat={trip.shopLocation.lat}
                                lng={trip.shopLocation.lng}
                                address={trip.shopLocation.address}
                            />
                            <p className="text-xs text-muted-foreground">
                                {trip.shopLocation.address} · Map data &copy; OpenStreetMap contributors
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Requests List */}
                    <div className="lg:col-span-3 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Requests ({requests.length})
                        </h2>

                        {requests.length === 0 ? (
                            <Card className="border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-muted-foreground">No requests yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isHelper ? 'Waiting for community members to request items.' : 'Be the first to request an item!'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {requests.map((req) => (
                                    <div key={req.id}>
                                        <RequestCard
                                            request={req}
                                            showActions={isHelper}
                                            onAccept={handleAccept}
                                            onReject={handleReject}
                                        />
                                        {isHelper && req.status === 'accepted' && (
                                            <div className="mt-2 ml-12 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-[#00754A] hover:bg-[#006241] text-white"
                                                    onClick={() => handleMarkDelivered(req.id)}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Mark Delivered
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Request Form (only for non-helpers on active trips) */}
                    {!isHelper && trip.status === 'active' && (
                        <div className="lg:col-span-2">
                            <Card className="border-border/50 shadow-md sticky top-20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Send className="w-4 h-4 text-primary" />
                                        Request an Item
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="item-name" className="text-sm">Item Name *</Label>
                                            <Input
                                                id="item-name"
                                                placeholder="e.g. Notebook, Crocin"
                                                value={itemName}
                                                onChange={(e) => setItemName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="qty" className="text-sm">Quantity</Label>
                                                <Input
                                                    id="qty"
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <IndianRupee className="w-3 h-3" />
                                                        Est. Price *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    min="1"
                                                    placeholder="50"
                                                    value={estimatedPrice}
                                                    onChange={(e) => setEstimatedPrice(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="brand" className="text-sm">Preferred Brand (optional)</Label>
                                            <Input
                                                id="brand"
                                                placeholder="e.g. Classmate"
                                                value={preferredBrand}
                                                onChange={(e) => setPreferredBrand(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm">Urgency</Label>
                                            <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High — Urgent!</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="req-note" className="text-sm">Note (optional)</Label>
                                            <Textarea
                                                id="req-note"
                                                placeholder="Any specifics..."
                                                value={reqNote}
                                                onChange={(e) => setReqNote(e.target.value)}
                                                className="min-h-[60px]"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full gradient-primary text-white gap-2 shadow-md">
                                            <Send className="w-4 h-4" />
                                            Submit Request
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
