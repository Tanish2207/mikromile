'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Notification } from '@/types';
import { getByField, update, Collections } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, MapPin, Package, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, React.ReactNode> = {
    trip_posted: <MapPin className="w-5 h-5 text-primary" />,
    request_accepted: <Check className="w-5 h-5 text-emerald-500" />,
    request_rejected: <Trash2 className="w-5 h-5 text-red-500" />,
    meeting_point: <MapPin className="w-5 h-5 text-blue-500" />,
    delivery_complete: <Star className="w-5 h-5 text-amber-500" />,
};

export default function NotificationsPage() {
    const { currentUser, isLoggedIn } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const loadNotifs = () => {
        if (!currentUser) return;
        const notifs = getByField<Notification>(Collections.NOTIFICATIONS, 'userId', currentUser.id);
        setNotifications(notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    useEffect(() => {
        if (mounted && !isLoggedIn) { router.push('/login'); return; }
        loadNotifs();
    }, [mounted, isLoggedIn, currentUser, router]);

    const markAllRead = () => {
        notifications.forEach((n) => {
            if (!n.read) update<Notification>(Collections.NOTIFICATIONS, n.id, { read: true });
        });
        loadNotifs();
    };

    const markRead = (id: string) => {
        update<Notification>(Collections.NOTIFICATIONS, id, { read: true });
        loadNotifs();
    };

    if (!mounted || !currentUser) return null;

    const unread = notifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-6 h-6 text-primary" />
                        Notifications
                        {unread > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">({unread} unread)</span>
                        )}
                    </h1>
                    {unread > 0 && (
                        <Button variant="ghost" size="sm" className="gap-2 text-primary" onClick={markAllRead}>
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-16 text-center">
                            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No notifications yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You&apos;ll get notified when someone in your community posts a trip.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => (
                            <Card
                                key={notif.id}
                                className={`border-border/50 transition-all hover:shadow-md cursor-pointer ${!notif.read ? 'bg-primary/5 border-primary/20' : ''
                                    }`}
                                onClick={() => markRead(notif.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-primary/10' : 'bg-muted'
                                            }`}>
                                            {iconMap[notif.type] || <Bell className="w-5 h-5 text-muted-foreground" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <div className="w-2.5 h-2.5 rounded-full gradient-primary shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(notif.createdAt).toLocaleString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {notif.relatedTripId && (
                                            <Link
                                                href={`/trips/${notif.relatedTripId}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button variant="ghost" size="sm" className="shrink-0 text-xs text-primary">
                                                    View
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
