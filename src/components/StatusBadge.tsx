'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RequestStatus, TripStatus, Urgency } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
    // Trip statuses
    active: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400' },
    full: { label: 'Full', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
    completed: { label: 'Completed', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400' },
    // Request statuses
    pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
    accepted: { label: 'Accepted', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    rejected: { label: 'Rejected', className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400' },
    purchased: { label: 'Purchased', className: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-400' },
    delivered: { label: 'Delivered', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400' },
    // Transaction
    held_in_escrow: { label: 'In Escrow', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400' },
    released: { label: 'Released', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400' },
    refunded: { label: 'Refunded', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400' },
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
