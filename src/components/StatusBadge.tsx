'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RequestStatus, TripStatus, Urgency } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
    // Trip statuses
    active: { label: 'Active', className: 'bg-[#d4e9e2] text-[#006241] border-[#00754A]/30' },
    full: { label: 'Full', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
    completed: { label: 'Completed', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400' },
    // Request statuses
    pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
    accepted: { label: 'Accepted', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    rejected: { label: 'Rejected', className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400' },
    purchased: { label: 'Purchased', className: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-400' },
    delivered: { label: 'Delivered', className: 'bg-[#d4e9e2] text-[#006241] border-[#00754A]/30' },
    // Transaction
    held_in_escrow: { label: 'In Escrow', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    released: { label: 'Released', className: 'bg-[#d4e9e2] text-[#006241] border-[#00754A]/30' },
    // Group Buy statuses
    open: { label: 'Open', className: 'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400' },
    confirmed: { label: 'Confirmed', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    ready: { label: 'Ready for Pickup', className: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-400' },
    // Participation statuses
    refunded: { label: 'Refunded', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
    pledged: { label: 'Pledged', className: 'bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-400' },
    paid: { label: 'Paid', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    collected: { label: 'Collected', className: 'bg-[#d4e9e2] text-[#006241] border-[#00754A]/30' },
};

const urgencyConfig: Record<Urgency, { label: string; className: string }> = {
    low: { label: 'Low', className: 'bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-400' },
    medium: { label: 'Medium', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
    high: { label: 'Urgent', className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400 animate-pulse' },
};

export function StatusBadge({ status }: { status: TripStatus | RequestStatus | string }) {
    const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return (
        <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
            {config.label}
        </Badge>
    );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
    const config = urgencyConfig[urgency];
    return (
        <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
            {config.label}
        </Badge>
    );
}
