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
import { create, getAll, Collections } from '@/lib/db';
import { GroupBuy, Store, User } from '@/types';
import { Boxes, Store as StoreIcon, ArrowLeft, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateGroupBuyPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [stores, setStores] = useState<Store[]>([]);
    const [storeChoice, setStoreChoice] = useState<string>('');
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreCategory, setNewStoreCategory] = useState('General');
    const [newStoreAddress, setNewStoreAddress] = useState('');

    const [productName, setProductName] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');
    const [individualPrice, setIndividualPrice] = useState('');
    const [dealPrice, setDealPrice] = useState('');
    const [minQuantity, setMinQuantity] = useState('');
    const [maxQuantity, setMaxQuantity] = useState('');
    const [deadline, setDeadline] = useState('');
    const [pickupLocation, setPickupLocation] = useState('Hostel Gate A');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
        setStores(getAll<Store>(Collections.STORES));
        // Default deadline: 3 days from now
        const def = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        setDeadline(def.toISOString().slice(0, 16));
    }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn) router.push('/login');
    }, [mounted, isLoggedIn, router]);

    if (!mounted || !currentUser) return null;

    const isNewStore = storeChoice === 'new';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        const ind = parseFloat(individualPrice);
        const deal = parseFloat(dealPrice);
        const min = parseInt(minQuantity);

        if (!productName || !isFinite(ind) || !isFinite(deal) || !min) {
            toast.error('Please fill product name, prices and minimum quantity.');
            setSubmitting(false);
            return;
        }
        if (deal >= ind) {
            toast.error('Deal price must be lower than the individual price.');
            setSubmitting(false);
            return;
        }

        let storeId = storeChoice;
        if (isNewStore) {
            if (!newStoreName) {
                toast.error('Enter the new store name.');
                setSubmitting(false);
                return;
            }
            const newStore: Store = {
                id: `store-${Math.random().toString(36).slice(2, 10)}`,
                name: newStoreName,
                category: newStoreCategory || 'General',
                address: newStoreAddress || 'Near campus',
                createdAt: new Date().toISOString(),
            };
            create(Collections.STORES, newStore);
            storeId = newStore.id;
        }
        if (!storeId) {
            toast.error('Pick a store (or add a new one).');
            setSubmitting(false);
            return;
        }

        const gb: GroupBuy = {
            id: `gb-${Math.random().toString(36).slice(2, 10)}`,
            communityId: currentUser.communityId,
            organizerId: currentUser.id,
            storeId,
            productName,
            unit: unit || undefined,
            description: description || undefined,
            individualPrice: ind,
            dealPrice: deal,
            minQuantity: min,
            maxQuantity: maxQuantity ? parseInt(maxQuantity) : undefined,
            deadline: new Date(deadline).toISOString(),
            pickupLocation: pickupLocation || 'Hostel Gate A',
            status: 'open',
            createdAt: new Date().toISOString(),
        };

        create(Collections.GROUP_BUYS, gb);

        // Notify the community (except the organizer).
        const members = getAll<User>(Collections.USERS).filter(
            (u) => u.communityId === currentUser.communityId,
        );
        members
            .filter((u) => u.id !== currentUser.id)
            .forEach((u) => {
                create(Collections.NOTIFICATIONS, {
                    id: `notif-${Math.random().toString(36).slice(2, 10)}`,
                    userId: u.id,
                    title: 'New Group Buy! 🛒',
                    message: `Pledge now: ${gb.productName} at ₹${gb.dealPrice} instead of ₹${gb.individualPrice} — minimum ${gb.minQuantity} ${gb.unit || 'units'}.`,
                    type: 'group_buy_new',
                    read: false,
                    relatedGroupBuyId: gb.id,
                    createdAt: new Date().toISOString(),
                });
            });

        toast.success('Group buy created! Your community has been notified.');
        router.push(`/group-buy/${gb.id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 py-8">
                <Link href="/group-buy">
                    <Button variant="ghost" size="sm" className="gap-2 mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Group Buy
                    </Button>
                </Link>

                <Card className="border-border/50 shadow-xl overflow-hidden">
                    <div className="h-2 gradient-primary" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Boxes className="w-6 h-6 text-primary" />
                            Start a Group Buy
                        </CardTitle>
                        <CardDescription>
                            Pool your hostel&apos;s demand. Agree a bulk price with a local store
                            &mdash; it unlocks when the minimum is pledged.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Product */}
                            <div className="space-y-2">
                                <Label htmlFor="product">Product Name *</Label>
                                <Input
                                    id="product"
                                    placeholder="e.g. Notebook (200 pages, ruled)"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unit (optional)</Label>
                                    <Input
                                        id="unit"
                                        placeholder="e.g. notebook, pack, case"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pickup">Pickup Location</Label>
                                    <Input
                                        id="pickup"
                                        value={pickupLocation}
                                        onChange={(e) => setPickupLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Store */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">
                                    <StoreIcon className="w-4 h-4" />
                                    Store *
                                </Label>
                                <Select value={storeChoice} onValueChange={(v) => setStoreChoice(v ?? '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a partner store or add new" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stores.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name} ({s.category})
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new">＋ Add a new store…</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isNewStore && (
                                <div className="grid sm:grid-cols-3 gap-3 rounded-xl border border-dashed border-border p-4">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="store-name">Store Name *</Label>
                                        <Input
                                            id="store-name"
                                            placeholder="e.g. Sharma Book Depot"
                                            value={newStoreName}
                                            onChange={(e) => setNewStoreName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="store-cat">Category</Label>
                                        <Select value={newStoreCategory} onValueChange={(v) => v && setNewStoreCategory(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Stationery">Stationery</SelectItem>
                                                <SelectItem value="Grocery">Grocery</SelectItem>
                                                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                                                <SelectItem value="General">General</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 sm:col-span-3">
                                        <Label htmlFor="store-addr">Address (optional)</Label>
                                        <Input
                                            id="store-addr"
                                            placeholder="e.g. Shop 12, Khodadad Circle, Matunga"
                                            value={newStoreAddress}
                                            onChange={(e) => setNewStoreAddress(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ind-price">Individual Price (₹) *</Label>
                                    <Input
                                        id="ind-price"
                                        type="number"
                                        min="1"
                                        placeholder="60"
                                        value={individualPrice}
                                        onChange={(e) => setIndividualPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deal-price">Deal Price (₹) *</Label>
                                    <Input
                                        id="deal-price"
                                        type="number"
                                        min="1"
                                        placeholder="45"
                                        value={dealPrice}
                                        onChange={(e) => setDealPrice(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min-qty">Min Quantity *</Label>
                                    <Input
                                        id="min-qty"
                                        type="number"
                                        min="2"
                                        placeholder="50"
                                        value={minQuantity}
                                        onChange={(e) => setMinQuantity(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max-qty">Max Quantity (optional)</Label>
                                    <Input
                                        id="max-qty"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 200"
                                        value={maxQuantity}
                                        onChange={(e) => setMaxQuantity(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Pledge Deadline *</Label>
                                    <Input
                                        id="deadline"
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc">Description (optional)</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="e.g. Classmate-style ruled notebooks, bulk order for the semester…"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[70px]"
                                />
                            </div>

                            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1 flex items-start gap-2">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                                <p>
                                    When the deadline arrives with the minimum met, the order is confirmed
                                    automatically. Payments are only collected at confirmation (simulated escrow)
                                    &mdash; if the minimum is missed, everyone is refunded.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gradient-primary text-white h-12 text-base font-semibold rounded-xl gap-2 shadow-lg shadow-primary/25"
                            >
                                <Sparkles className="w-5 h-5" />
                                {submitting ? 'Creating…' : 'Launch Group Buy'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
