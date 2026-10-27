// ===============================
// MikroMile — Group Buy Logic
// ===============================
// Domain helpers for the Community Commerce (Group Buy) pillar.
//
// IMPORTANT DESIGN RULE: group buys are self-sufficient. A group buy NEVER
// depends on a helper/errand trip — the consolidated order is collected at a
// community pickup point automatically. Trips CAN carry it (Trip.groupBuyId),
// but that is only an optional convenience layer.

import {
  GroupBuy,
  Participation,
  ParticipationStatus,
  Store,
  User,
  Notification,
} from "@/types";
import { getById, getByField, getAll, create, update, Collections } from "@/lib/db";

/** Participation statuses that count toward the deal total. */
const COMMITTING_STATUSES: ParticipationStatus[] = ["pledged", "paid", "collected"];

/** All participations for a group buy, newest first. */
export function getParticipations(groupBuyId: string): Participation[] {
  return getByField<Participation>(Collections.PARTICIPATIONS, "groupBuyId", groupBuyId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export interface GroupBuySummary {
  /** Pledged quantity across all active participants. */
  committedQty: number;
  participantCount: number;
  /** Whether minQuantity has been reached (deal unlocked). */
  unlocked: boolean;
  /** 0–100 progress toward minQuantity. */
  progressPct: number;
  remainingToMin: number;
  /** Total ₹ the community saves vs buying individually at individual price. */
  totalSavings: number;
  maxReached: boolean;
}

export function summarize(groupBuy: GroupBuy, parts?: Participation[]): GroupBuySummary {
  const active = (parts ?? getParticipations(groupBuy.id)).filter((p) =>
    COMMITTING_STATUSES.includes(p.status),
  );
  const committedQty = active.reduce((sum, p) => sum + p.quantity, 0);
  const unlocked = committedQty >= groupBuy.minQuantity;
  const progressPct = Math.min(
    100,
    Math.round((committedQty / Math.max(groupBuy.minQuantity, 1)) * 100),
  );
  const maxReached = !!groupBuy.maxQuantity && committedQty >= groupBuy.maxQuantity;
  return {
    committedQty,
    participantCount: active.length,
    unlocked,
    progressPct,
    remainingToMin: Math.max(groupBuy.minQuantity - committedQty, 0),
    totalSavings: committedQty * (groupBuy.individualPrice - groupBuy.dealPrice),
    maxReached,
  };
}

export function isPastDeadline(groupBuy: GroupBuy): boolean {
  return Date.now() >= new Date(groupBuy.deadline).getTime();
}

export function canAcceptPledges(groupBuy: GroupBuy): boolean {
  return groupBuy.status === "open" && !isPastDeadline(groupBuy);
}

function notify(userIds: string[], payload: Omit<Notification, "id" | "userId" | "createdAt">) {
  userIds.forEach((userId) => {
    create(Collections.NOTIFICATIONS, {
      ...payload,
      id: `notif-${Math.random().toString(36).slice(2, 10)}`,
      userId,
      createdAt: new Date().toISOString(),
    } as Notification);
  });
}

/** Everyone in the group buy's community, optionally excluding some users. */
function communityAudience(groupBuy: GroupBuy, excludeIds: string[] = []): string[] {
  return (getAll<User>(Collections.USERS) as User[])
    .filter((u) => u.communityId === groupBuy.communityId && !excludeIds.includes(u.id))
    .map((u) => u.id);
}

function storeOf(groupBuy: GroupBuy): Store | undefined {
  return getById<Store>(Collections.STORES, groupBuy.storeId);
}

export function getStore(groupBuy: GroupBuy): Store | undefined {
  return storeOf(groupBuy);
}

/**
 * Deadline pass. Intended to run when group buy pages mount:
 *  - open + minimum reached → auto-confirm the order with the store
 *  - open + below minimum → cancel and refund every pledge (simulated)
 */
export function processDeadlines(groupBuy?: GroupBuy): void {
  const targets = groupBuy
    ? [groupBuy]
    : getByField<GroupBuy>(Collections.GROUP_BUYS, "status", "open");

  targets.forEach((gb) => {
    if (gb.status !== "open" || !isPastDeadline(gb)) return;
    const committed = summarize(gb).committedQty;
    if (committed >= gb.minQuantity) {
      confirmGroupBuy(gb);
    } else {
      getParticipations(gb.id).forEach((p) => {
        if (COMMITTING_STATUSES.includes(p.status)) {
          update<Participation>(Collections.PARTICIPATIONS, p.id, { status: "refunded" });
        }
      });
      update<GroupBuy>(Collections.GROUP_BUYS, gb.id, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      });
      notify([gb.organizerId], {
        title: "Group Buy Cancelled 😕",
        message: `"${gb.productName}" missed its minimum (${committed}/${gb.minQuantity}). All pledges were refunded.`,
        type: "group_buy_update",
        read: false,
        relatedGroupBuyId: gb.id,
      });
      notify(communityAudience(gb, [gb.organizerId]), {
        title: "Group Buy Cancelled 😕",
        message: `"${gb.productName}" didn't reach its minimum of ${gb.minQuantity}. Your pledge money has been refunded.`,
        type: "group_buy_update",
        read: false,
        relatedGroupBuyId: gb.id,
      });
    }
  });
}

/** Organizer cancels a group buy. All pledges are refunded (simulated). */
export function cancelGroupBuy(gb: GroupBuy): void {
  if (gb.status !== "open" && gb.status !== "confirmed") return;
  getParticipations(gb.id).forEach((p) => {
    if (COMMITTING_STATUSES.includes(p.status)) {
      update<Participation>(Collections.PARTICIPATIONS, p.id, { status: "refunded" });
    }
  });
  update<GroupBuy>(Collections.GROUP_BUYS, gb.id, {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
  notify(communityAudience(gb, [gb.organizerId]), {
    title: "Group Buy Cancelled 😕",
    message: `"${gb.productName}" was cancelled by the coordinator. Your pledge money has been refunded.`,
    type: "group_buy_update",
    read: false,
    relatedGroupBuyId: gb.id,
  });
}

/** Join (or adjust) a pledge while a group buy is open. */
export function pledge(groupBuyId: string, userId: string, quantity: number): Participation | undefined {
  const gb = getById<GroupBuy>(Collections.GROUP_BUYS, groupBuyId);
  if (!gb || !canAcceptPledges(gb)) return undefined;

  const myPart = getByField<Participation>(Collections.PARTICIPATIONS, "groupBuyId", groupBuyId).find(
    (p) => p.userId === userId && COMMITTING_STATUSES.includes(p.status),
  );
  if (myPart) {
    return update<Participation>(Collections.PARTICIPATIONS, myPart.id, { quantity });
  }
  const part: Participation = {
    id: `part-${Math.random().toString(36).slice(2, 10)}`,
    groupBuyId,
    userId,
    quantity,
    status: "pledged",
    createdAt: new Date().toISOString(),
  };
  return create(Collections.PARTICIPATIONS, part);
}

/** Withdraw my pledge while the group buy is still open (simulated refund). */
export function withdrawPledge(groupBuyId: string, userId: string): boolean {
  const gb = getById<GroupBuy>(Collections.GROUP_BUYS, groupBuyId);
  if (!gb || !canAcceptPledges(gb)) return false;
  const myPart = getByField<Participation>(Collections.PARTICIPATIONS, "groupBuyId", groupBuyId).find(
    (p) => p.userId === userId && COMMITTING_STATUSES.includes(p.status),
  );
  if (!myPart) return false;
  update<Participation>(Collections.PARTICIPATIONS, myPart.id, { status: "refunded" });
  return true;
}

/** Organizer confirms the order with the store. Everyone's pledge is charged (simulated escrow). */
export function confirmGroupBuy(gb: GroupBuy): void {
  if (gb.status !== "open") return;
  getParticipations(gb.id)
    .filter((p) => p.status === "pledged")
    .forEach((p) => update<Participation>(Collections.PARTICIPATIONS, p.id, { status: "paid" }));
  update<GroupBuy>(Collections.GROUP_BUYS, gb.id, {
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
  });
  const committed = summarize(gb).committedQty;
  notify(communityAudience(gb, [gb.organizerId]), {
    title: "Deal Unlocked! 🔓",
    message: `"${gb.productName}" hit its minimum (${committed}/${gb.minQuantity}). Order placed with ${storeOf(gb)?.name ?? "the store"} at ₹${gb.dealPrice} per ${gb.unit || "unit"}.`,
    type: "group_buy_update",
    read: false,
    relatedGroupBuyId: gb.id,
  });
}

/** Organizer marks the consolidated order as ready at the community pickup point. */
export function markReady(gb: GroupBuy, pickupTimeISO?: string): void {
  if (gb.status !== "confirmed") return;
  update<GroupBuy>(Collections.GROUP_BUYS, gb.id, {
    status: "ready",
    readyAt: new Date().toISOString(),
    pickupTime: pickupTimeISO || gb.pickupTime,
  });
  const storeName = storeOf(gb)?.name ?? "the store";
  notify(communityAudience(gb, [gb.organizerId]), {
    title: "Group Order Ready! 🎉",
    message: `"${gb.productName}" is packed at ${storeName}. Collect it at ${gb.pickupLocation}.`,
    type: "group_buy_update",
    read: false,
    relatedGroupBuyId: gb.id,
  });
}

/**
 * Participant collects their share at the pickup point.
 * When every share is collected, the group buy completes and the organizer
 * earns +2 reward points per unit.
 */
export function collect(gb: GroupBuy, userId: string): boolean {
  if (gb.status !== "ready") return false;
  const myPart = getByField<Participation>(Collections.PARTICIPATIONS, "groupBuyId", gb.id).find(
    (p) => p.userId === userId && COMMITTING_STATUSES.includes(p.status),
  );
  if (!myPart) return false;
  update<Participation>(Collections.PARTICIPATIONS, myPart.id, { status: "collected" });

  // Completion check — everyone who committed has collected.
  const activeParts = getParticipations(gb.id).filter((p) => COMMITTING_STATUSES.includes(p.status));
  const allCollected =
    activeParts.length > 0 && activeParts.every((p) => p.status === "collected");

  if (allCollected) {
    update<GroupBuy>(Collections.GROUP_BUYS, gb.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    const totalUnits = activeParts.reduce((sum, p) => sum + p.quantity, 0);
    const rewardPoints = totalUnits * 2;
    const organizer = getById<User>(Collections.USERS, gb.organizerId);
    create(Collections.REWARDS, {
      id: `reward-${Math.random().toString(36).slice(2, 10)}`,
      userId: gb.organizerId,
      points: rewardPoints,
      reason: `Organized group buy "${gb.productName}" — ${totalUnits} units collected`,
      createdAt: new Date().toISOString(),
    });
    if (organizer) {
      update<User>(Collections.USERS, organizer.id, {
        totalRewardPoints: organizer.totalRewardPoints + rewardPoints,
      });
      notify([organizer.id], {
        title: "Group Buy Completed! 🏆",
        message: `"${gb.productName}" has been fully distributed. You earned ${rewardPoints} reward points.`,
        type: "group_buy_update",
        read: false,
        relatedGroupBuyId: gb.id,
      });
    }
  }
  return true;
}
