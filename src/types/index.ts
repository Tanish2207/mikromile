// ===============================
// MikroMile — Shared TypeScript Types
// ===============================

// ---------- Enums ----------

export type TripStatus = "active" | "full" | "completed" | "cancelled";
export type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "purchased"
  | "delivered"
  | "cancelled";
export type Urgency = "low" | "medium" | "high";
export type TransactionStatus =
  | "pending"
  | "held_in_escrow"
  | "released"
  | "refunded";
export type GroupBuyStatus =
  | "open"
  | "confirmed"
  | "ready"
  | "completed"
  | "cancelled";
export type ParticipationStatus =
  | "pledged"
  | "paid"
  | "collected"
  | "refunded";
export type NotificationType =
  | "trip_posted"
  | "request_accepted"
  | "request_rejected"
  | "meeting_point"
  | "delivery_complete"
  | "group_buy_new"
  | "group_buy_update";

// ---------- Models ----------

export interface User {
  id: string;
  name: string;
  email: string;
  profilePhoto: string;
  phoneNumber: string;
  college: string;
  communityId: string;
  totalRewardPoints: number;
  averageRating: number;
  totalDeliveries: number;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  members: string[]; // user IDs
  createdBy: string; // user ID
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  category: string; // Stationery | Grocery | Pharmacy | General ...
  address: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  helperId: string;
  communityId: string;
  destinationArea: string;
  destinationShop: string;
  note?: string;
  expectedReturnTime: string;
  shopLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  status: TripStatus;
  /** Optional link to a Group Buy the helper is helping collect. Purely
   *  informational — a group buy never depends on any trip. */
  groupBuyId?: string;
  createdAt: string;
}

export interface ItemRequest {
  id: string;
  tripId: string;
  requesterId: string;
  itemName: string;
  quantity: number;
  preferredBrand?: string;
  estimatedPrice: number;
  urgency: Urgency;
  note?: string;
  status: RequestStatus;
  createdAt: string;
}

export interface MeetingPoint {
  id: string;
  requestId: string;
  latitude: number;
  longitude: number;
  address: string;
  finalConfirmedLocation: boolean;
}

export interface Transaction {
  id: string;
  requesterId: string;
  helperId: string;
  requestId: string;
  estimatedAmount: number;
  finalAmount: number;
  status: TransactionStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  requestId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedTripId?: string;
  relatedRequestId?: string;
  relatedGroupBuyId?: string;
  createdAt: string;
}

// ---------- Group Buy (Community Commerce) ----------

/**
 * A group buy ("pooled order") placed with a local store.
 * Lifecycle: open → confirmed → ready → completed, or cancelled.
 * It is deliberately independent of the Community Errands flow:
 * participants always pick up the consolidated order themselves at a
 * community pickup point. A helpful trip CAN carry it (see Trip.groupBuyId),
 * but it is never required for the group buy to complete.
 */
export interface GroupBuy {
  id: string;
  communityId: string;
  /** Community member coordinating this deal (MikroMile coordinator role). */
  organizerId: string;
  storeId: string;
  productName: string;
  unit?: string; // e.g. "notebook", "pack", "1L carton"
  description?: string;
  /** Store's counter price when buying one at a time. */
  individualPrice: number;
  /** Bulk price unlocked once minQuantity is pledged. */
  dealPrice: number;
  /** Pledged quantity needed to unlock the deal. */
  minQuantity: number;
  /** Optional cap on total quantity. */
  maxQuantity?: number;
  deadline: string; // ISO — pledges close at this time
  /** Where participants collect the consolidated order. */
  pickupLocation: string;
  /** Set when the store is marked ready. */
  pickupTime?: string;
  status: GroupBuyStatus;
  createdAt: string;
  confirmedAt?: string;
  readyAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

/** One student's stake in a group buy. Payment is simulated as escrow:
 *  pledged → paid (on confirm) → collected (at pickup), refunded on cancel. */
export interface Participation {
  id: string;
  groupBuyId: string;
  userId: string;
  quantity: number;
  status: ParticipationStatus;
  createdAt: string;
}
