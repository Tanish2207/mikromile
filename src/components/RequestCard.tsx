'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge, UrgencyBadge } from '@/components/StatusBadge';
import { ItemRequest, User } from '@/types';
import { getById, Collections } from '@/lib/db';
import { Check, X, IndianRupee } from 'lucide-react';

interface RequestCardProps {
    request: ItemRequest;
    showActions?: boolean;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
}

export default function RequestCard({ request, showActions, onAccept, onReject }: RequestCardProps) {
    const requester = getById<User>(Collections.USERS, request.requesterId);

    const initials = requester?.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?';

    return (
        <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0 border border-border">
                            <AvatarFallback className="text-xs font-semibold bg-secondary text-secondary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm">{request.itemName}</p>
                                <UrgencyBadge urgency={request.urgency} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{requester?.name}</span>
                                <span>Qty: {request.quantity}</span>
                                {request.preferredBrand && <span>Brand: {request.preferredBrand}</span>}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium">
                                <IndianRupee className="w-3.5 h-3.5" />
                                <span>{request.estimatedPrice}</span>
                            </div>
                            {request.note && (
                                <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 italic">
                                    {request.note}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <StatusBadge status={request.status} />
                        {showActions && request.status === 'pending' && (
                            <div className="flex gap-1.5">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
                                    onClick={() => onAccept?.(request.id)}
                                >
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                                    onClick={() => onReject?.(request.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
