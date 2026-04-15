'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Bell,
    LogOut,
    User,
    Trophy,
    Menu,
    X,
    Package,
    Route,
} from 'lucide-react';
import { getByField, Collections } from '@/lib/db';
import { Notification } from '@/types';

export default function Navbar() {
    const { currentUser, logout, isLoggedIn } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const unreadCount = isLoggedIn
        ? getByField<Notification>(Collections.NOTIFICATIONS, 'userId', currentUser?.id)
            .filter((n) => !n.read).length
        : 0;

    if (!isLoggedIn) return null;

    const initials = currentUser?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <nav className="sticky top-0 z-50 glass border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-[oklch(0.55_0.18_155)] to-[oklch(0.6_0.15_240)] bg-clip-text text-transparent">
                            MikroMile
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Package className="w-4 h-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/trips/create">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Route className="w-4 h-4" />
                                Post Trip
                            </Button>
                        </Link>
                        <Link href="/my-trips">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <MapPin className="w-4 h-4" />
                                My Trips
                            </Button>
                        </Link>
                        <Link href="/my-requests">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Package className="w-4 h-4" />
                                My Requests
                            </Button>
                        </Link>
                        <Link href="/leaderboard">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Trophy className="w-4 h-4" />
                                Leaderboard
                            </Button>
                        </Link>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Link href="/notifications">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] gradient-primary text-white border-0">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>

                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none ring-0 focus:ring-0 hover:bg-accent transition-colors flex items-center justify-center">
                                <Avatar className="h-9 w-9 border-2 border-primary/20">
                                    <AvatarFallback className="text-sm font-semibold gradient-primary text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <div className="flex items-center gap-3 p-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="gradient-primary text-white text-sm">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{currentUser?.name}</p>
                                        <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <Link href="/profile">
                                    <DropdownMenuItem className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                </Link>
                                <Link href="/leaderboard">
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Rewards & Leaderboard
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={logout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Switch Account
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-border/50 mt-2 pt-3 space-y-1">
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Package className="w-4 h-4" /> Dashboard
                            </Button>
                        </Link>
                        <Link href="/trips/create" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Route className="w-4 h-4" /> Post Trip
                            </Button>
                        </Link>
                        <Link href="/my-trips" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <MapPin className="w-4 h-4" /> My Trips
                            </Button>
                        </Link>
                        <Link href="/my-requests" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Package className="w-4 h-4" /> My Requests
                            </Button>
                        </Link>
                        <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Trophy className="w-4 h-4" /> Leaderboard
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
