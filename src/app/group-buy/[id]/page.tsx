'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { GroupBuy, Store, Participation, User, Trip } from '@/types';
import { getById, getByField, Collections } from '@/lib/db';
import {
    getParticipations,
    summarize,
    processDeadlines,
    canAcceptPledges,
    pledge,
    withdrawPledge,
    confirmGroupBuy,
    markReady,
    collect,
    getStore,
    cancelGroupBuy,
} from '@/lib/groupbuy';
import {
    Package,
    Store as StoreIcon,
    MapPin,
    Clock,
    ArrowLeft,
    Users,
    IndianRupee,
    CheckCircle2,
    Route,
    Tag,
    Timer,
    Info,
    Truck,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GroupBuyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [gb, setGb] = useState<GroupBuy | null>(null);
    const [store, setStore] = useState<Store | null>(null);
    const [organizer, setOrganizer] = useState<User | null>(null);
    const [parts, setParts] = useState<Participation[]>([]);
    const [helperTrips, setHelperTrips] = useState<Trip[]>([]);
    const [mounted, setMounted] = useState(false);

    // Pledge form
    const [quantity, setQuantity] = useState('1');
    const [pickupTime, setPickupTime] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadData = () => {
        const deal = getById<GroupBuy>(Collections.GROUP_BUYS, id);
        if (!deal) return;
        // Deadline pass for this deal (auto-confirm / auto-cancel).
        processDeadlines(deal);
        const fresh = getById<GroupBuy>(Collections.GROUP_BUYS, id)!;
        setGb(fresh);
        setStore(getStore(fresh) || null);
        setOrganizer(getById<User>(Collections.USERS, fresh.organizerId) || null);
        setParts(getParticipations(fresh.id));

        // Optional errand bridge: active trips carrying this group order.
        const trips = getByField<Trip>(Collections.TRIPS, 'groupBuyId', fresh.id).filter(
            (t) => t.status === 'active',
        );
        setHelperTrips(trips);
    };

    useEffect(() => {
        if (mounted && !isLoggedIn) {
            router.push('/login');
            return;
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, isLoggedIn, id]);

    useEffect(() => {
        if (gb) {
            const mine = parts.find((p) => p.userId === currentUser?.id && p.status !== 'refunded');
            setQuantity(String(mine?.quantity ?? 1));
            if (gb.pickupTime) setPickupTime(gb.pickupTime.slice(0, 16));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gb?.status]);

    if (!mounted || !isLoggedIn || !currentUser || !gb) return null;

    const summary = summarize(gb, parts);
    const isOrganizer = currentUser.id === gb.organizerId;
    const myPart = parts.find((p) => p.userId === currentUser.id && p.status !== 'refunded');
    const pledgesOpen = canAcceptPledges(gb);

    const deadline = new Date(gb.deadline);
    const diffHrs = Math.ceil((deadline.getTime() - Date.now()) / (60 * 60 * 1000));
    const deadlineStr = deadline.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    const savingPct = Math.round(((gb.individualPrice - gb.dealPrice) / gb.individualPrice) * 100);

    const initials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase();

    // ---------- Actions ----------
    const reload = () => loadData();

    const handlePledge = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity);
        if (!qty || qty < 1) {
            toast.error('Enter a quantity of at least 1.');
            return;
        }
        const wasAlreadyPledged = !!myPart;
        const result = pledge(gb.id, currentUser.id, qty);
        if (!result) {
            toast.error('This deal is not accepting pledges.');
            return;
        }
        toast.success(
            wasAlreadyPledged ? 'Pledge updated!' : `Pledged ${qty} × ${gb.productName}!`,
        );
        reload();
    };

    const handleWithdraw = () => {
        if (!withdrawPledge(gb.id, currentUser.id)) {
            toast.error('Pledge can only be withdrawn while the deal is open.');
            return;
        }
        toast.info('Pledge withdrawn — refund simulated.');
        reload();
    };

    const handleConfirm = () => {
        if (!summary.unlocked) {
            toast.error(`Minimum not reached yet (${summary.committedQty}/${gb.minQuantity}).`);
            return;
        }
        confirmGroupBuy(gb);
        toast.success('Order placed with the store! Pledges charged (simulated escrow).');
        reload();
    };

    const handleCancel = () => {
        if (!window.confirm('Cancel this group buy? All pledges will be refunded (simulated).')) return;
        cancelGroupBuy(gb);
        toast.info('Group buy cancelled. Pledges refunded (simulated).');
        reload();
    };

    const handleMarkReady = () => {
        const iso = pickupTime ? new Date(pickupTime).toISOString() : undefined;
        markReady(gb, iso);
        toast.success('Marked ready! Participants are notified to collect it.');
        reload();
    };

    const handleCollect = () => {
        if (!collect(gb, currentUser.id)) {
            toast.error('Nothing to collect yet.');
            return;
        }
        toast.success(`Collected your ${myPart?.quantity ?? ''} × ${gb.productName}!`);
        reload();
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Link href="/group-buy">
                    <Button variant="ghost" size="sm" className="gap-2 mb-2">
                        <ArrowLeft className="w-4 h-4" />
                        All Group Buys
                    </Button>
                </Link>

                {/* Deal header card */}
                <Card className="overflow-hidden border-border/50 shadow-lg">
                    <div className="h-2 gradient-primary" />
                    <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    {gb.productName}
                                </h1>
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <StoreIcon className="w-4 h-4 text-primary" />
                                        {store?.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {store?.address}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Coordinated by {organizer?.name}
                                </p>
                            </div>
                            <StatusBadge status={gb.status} />
                        </div>

                        {gb.description && (
                            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                                {gb.description}
                            </p>
                        )}

                        {/* Price comparison */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Individual price</p>
                                <p className="text-lg font-semibold line-through text-muted-foreground">
                                    ₹{gb.individualPrice}
                                </p>
                            </div>
                            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Deal price</p>
                                <p className="text-lg font-bold text-primary">₹{gb.dealPrice}</p>
                            </div>
                            <div className="rounded-xl border border-[#00754A]/30 bg-[#00754A]/5 p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1">You save</p>
                                <p className="text-lg font-bold text-[#00754A]">{savingPct}%</p>
                            </div>
                        </div>

                        {gb.status === 'open' && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Timer className="w-4 h-4" />
                                {diffHrs > 0
                                    ? `Pledges close ${deadlineStr} (${diffHrs < 24 ? `${diffHrs}h` : `${Math.ceil(diffHrs / 24)}d`} left)`
                                    : 'Pledging closed'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Progress + participants */}
                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border-border/50 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        Demand Pool ({parts.filter((p) => p.status !== 'refunded').length})
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {summary.unlocked ? 'Unlocked 🎉' : `${summary.remainingToMin} more to go`}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-semibold">{summary.committedQty} / {gb.minQuantity} {gb.unit || 'units'}</span>
                                        <span className="text-muted-foreground text-xs">₹{summary.totalSavings.toLocaleString('en-IN')} saved so far</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${summary.unlocked ? 'bg-[#00754A]' : 'gradient-primary'}`}
                                            style={{ width: `${summary.progressPct}%` }}
                                        />
                                    </div>
                                    {!summary.unlocked && gb.status === 'open' && (
                                        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                            Need {summary.remainingToMin} more {gb.unit || 'units'} for {store?.name} to apply the bulk price of ₹{gb.dealPrice}.
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    {parts.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-4 text-center">
                                            No pledges yet — be the first!
                                        </p>
                                    ) : (
                                        parts.map((p) => {
                                            const user = getById<User>(Collections.USERS, p.userId);
                                            return (
                                                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs gradient-primary text-white">
                                                                {initials(user?.name || '?')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {user?.name}
                                                                {p.userId === currentUser.id && <span className="text-muted-foreground"> (you)</span>}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {p.quantity} × {gb.unit || 'unit'} · ₹{(p.quantity * gb.dealPrice).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={p.status} />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Optional errand bridge */}
                        {(gb.status === 'confirmed' || gb.status === 'ready') && (
                            <Card className="border-dashed border-2 border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Route className="w-4 h-4 text-primary" />
                                        Errand Trips Carrying This Order
                                        <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        The deal completes without any helper — collect at {gb.pickupLocation} yourself. But if someone is
                                        already heading to the store, their trip can carry it for you.
                                    </p>
                                    {helperTrips.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No trips attached yet. Helpers can attach a trip from the{' '}
                                            <Link href="/trips/create" className="text-primary underline">Post Trip</Link> form.
                                        </p>
                                    ) : (
                                        helperTrips.map((t) => {
                                            const helper = getById<User>(Collections.USERS, t.helperId);
                                            return (
                                                <Link key={t.id} href={`/trips/${t.id}`} className="block">
                                                    <div className="flex items-center justify-between rounded-lg border border-[#00754A]/30 bg-[#00754A]/5 px-3 py-2.5 hover:bg-[#00754A]/10 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs gradient-primary text-white">
                                                                    {initials(helper?.name || '?')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-medium flex items-center gap-1">
                                                                    {helper?.name}
                                                                    <Truck className="w-3.5 h-3.5 text-[#00754A]" />
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Returns by {new Date(t.expectedReturnTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs text-[#00754A] border-[#00754A]/30">
                                                            Carrying order
                                                        </Badge>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right rail — sticky as ONE unit so its stacked cards
                        (pledge / share / coordinator) never slide over each
                        other; self-start keeps the grid cell from stretching,
                        which is what makes sticky travel possible. */}
                    <div className="lg:col-span-2 lg:sticky lg:top-20 lg:self-start space-y-4">
                        {/* Pledge form */}
                        {pledgesOpen && (
                            <Card className="border-border/50 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <IndianRupee className="w-4 h-4 text-primary" />
                                        {myPart ? 'Adjust Your Pledge' : 'Pledge Your Quantity'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePledge} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="qty" className="text-sm">
                                                How many {gb.unit || 'units'} do you want?
                                            </Label>
                                            <Input
                                                id="qty"
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">At individual price</span>
                                                <span className="line-through">₹{(parseInt(quantity) * gb.individualPrice).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold">
                                                <span>At deal price</span>
                                                <span className="text-primary">₹{(parseInt(quantity) * gb.dealPrice).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-[#00754A] text-xs font-medium">
                                                <span>You save</span>
                                                <span>₹{(parseInt(quantity) * (gb.individualPrice - gb.dealPrice)).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full gradient-primary text-white gap-2 shadow-md">
                                            <Tag className="w-4 h-4" />
                                            {myPart ? 'Update Pledge' : 'Join Group Buy'}
                                        </Button>
                                        {myPart && myPart.status === 'pledged' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full text-destructive hover:text-destructive"
                                                onClick={handleWithdraw}
                                            >
                                                Withdraw Pledge
                                            </Button>
                                        )}
                                        <p className="text-[11px] text-muted-foreground text-center">
                                            Payment is charged only when the minimum is reached (simulated escrow).
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* My status / collect */}
                        {!pledgesOpen && myPart && (
                            <Card className="border-border/50 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary" />
                                        Your Share
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Quantity</span>
                                        <span className="font-semibold">{myPart.quantity} × {gb.unit || 'unit'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">To pay</span>
                                        <span className="font-semibold">₹{(myPart.quantity * gb.dealPrice).toLocaleString('en-IN')}</span>
                                    </div>
                                    <StatusBadge status={myPart.status} />

                                    {gb.status === 'ready' && (myPart.status === 'paid' || myPart.status === 'pledged') && (
                                        <>
                                            <Separator />
                                            <div className="rounded-lg bg-[#00754A]/5 border border-[#00754A]/30 p-3 text-sm space-y-1">
                                                <p className="font-medium flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-[#00754A]" />
                                                    Collect at {gb.pickupLocation}
                                                </p>
                                                {gb.pickupTime && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(gb.pickupTime).toLocaleString('en-IN', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                            <Button className="w-full bg-[#00754A] hover:bg-[#006241] text-white gap-2" onClick={handleCollect}>
                                                <CheckCircle2 className="w-4 h-4" />
                                                I&apos;ve Collected It
                                            </Button>
                                        </>
                                    )}
                                    {myPart.status === 'refunded' && (
                                        <p className="text-xs text-muted-foreground">Your pledge was refunded.</p>
                                    )}
                                    {myPart.status === 'collected' && (
                                        <p className="text-xs text-[#00754A] font-medium">
                                            Picked up earlier — enjoy! 🎉
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Organizer panel */}
                        {isOrganizer && gb.status !== 'completed' && gb.status !== 'cancelled' && (
                            <Card className="border-primary/30 shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <StoreIcon className="w-4 h-4 text-primary" />
                                        Coordinator Panel
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {gb.status === 'open' && (
                                        <>
                                            <p className="text-xs text-muted-foreground">
                                                When the minimum is reached, confirm to place the consolidated order with {store?.name}.
                                                Payment from each participant is charged then.
                                            </p>
                                            <Button
                                                className="w-full gradient-primary text-white gap-2"
                                                disabled={!summary.unlocked}
                                                onClick={handleConfirm}
                                            >
                                                <StoreIcon className="w-4 h-4" />
                                                {summary.unlocked ? 'Confirm Order with Store' : `Locked — ${summary.remainingToMin} more`}
                                            </Button>
                                            <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleCancel}>
                                                Cancel Group Buy
                                            </Button>
                                        </>
                                    )}
                                    {gb.status === 'confirmed' && (
                                        <>
                                            <p className="text-xs text-muted-foreground">
                                                The store is preparing one consolidated order. When it&apos;s packed, mark it ready so
                                                participants know to collect it.
                                            </p>
                                            <div className="space-y-2">
                                                <Label htmlFor="pickup-time" className="text-sm">Pickup Time</Label>
                                                <Input
                                                    id="pickup-time"
                                                    type="datetime-local"
                                                    value={pickupTime}
                                                    onChange={(e) => setPickupTime(e.target.value)}
                                                />
                                            </div>
                                            <Button className="w-full gradient-primary text-white gap-2" onClick={handleMarkReady}>
                                                <CheckCircle2 className="w-4 h-4" />
                                                Mark Ready for Pickup
                                            </Button>
                                        </>
                                    )}
                                    {gb.status === 'ready' && (
                                        <p className="text-xs text-muted-foreground">
                                            Participants now collect their shares at {gb.pickupLocation}. You&apos;ll earn
                                            +2 reward points per unit once everything is picked up.
                                            {myPart && myPart.status === 'paid' && ' Collect yours from the “Your Share” card above.'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
