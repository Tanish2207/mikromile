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
export type NotificationType =
  | "trip_posted"
  | "request_accepted"
  | "request_rejected"
  | "meeting_point"
  | "delivery_complete";

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
  createdAt: string;
}
