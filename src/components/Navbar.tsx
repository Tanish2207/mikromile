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
    Boxes,
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
        <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.06),0_0_2px_rgba(0,0,0,0.07)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-full bg-[#006241] flex items-center justify-center group-hover:scale-105 transition-transform">
                            <MapPin className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-xl font-semibold tracking-[-0.01em] text-[#006241]">
                            MikroMile
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-5">
                        {[
                            { href: '/dashboard', label: 'Dashboard', icon: Package },
                            { href: '/trips/create', label: 'Post Trip', icon: Route },
                            { href: '/group-buy', label: 'Group Buy', icon: Boxes },
                            { href: '/my-trips', label: 'My Trips', icon: MapPin },
                            { href: '/my-requests', label: 'My Requests', icon: Package },
                            { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
                        ].map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="nav-underline flex items-center gap-1.5 text-[14px] font-medium tracking-[-0.01em] text-[rgba(0,0,0,0.87)] hover:text-[#006241] transition-colors"
                            >
                                <l.icon className="w-4 h-4" />
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Link href="/notifications">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px] bg-[#00754A] text-white border-0 rounded-full">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>

                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none ring-0 focus:ring-0 hover:bg-accent transition-colors flex items-center justify-center">
                                <Avatar className="h-9 w-9 border-2 border-primary/20">
                                    <AvatarFallback className="text-sm font-semibold bg-[#006241] text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <div className="flex items-center gap-3 p-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-[#006241] text-white text-sm">
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
                    <div className="md:hidden pb-4 border-t border-[rgba(0,0,0,0.06)] mt-2 pt-3 space-y-1">
                        {[
                            { href: '/dashboard', label: 'Dashboard', icon: Package },
                            { href: '/trips/create', label: 'Post Trip', icon: Route },
                            { href: '/group-buy', label: 'Group Buy', icon: Boxes },
                            { href: '/my-trips', label: 'My Trips', icon: MapPin },
                            { href: '/my-requests', label: 'My Requests', icon: Package },
                            { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
                        ].map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2 rounded-[12px] px-3 py-2 text-[16px] tracking-[-0.01em] text-[rgba(0,0,0,0.87)] hover:bg-[#f9f9f9]"
                            >
                                <l.icon className="w-4 h-4" /> {l.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
