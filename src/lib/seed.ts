// ===============================
// MikroMile — Seed Data
// ===============================
// Pre-populates localStorage with sample users, a community, and a trip.

import { User, Community, Trip, ItemRequest, Notification, Store, GroupBuy, Participation } from "@/types";
import { getAll, create, Collections, clearAll } from "@/lib/db";

const SEED_KEY = "mikromile_seeded_v3";

export const DUMMY_USERS: User[] = [
  {
    id: "user-aman",
    name: "Aman Sharma",
    email: "aman@vjti.ac.in",
    profilePhoto: "",
    phoneNumber: "9876543210",
    college: "VJTI Mumbai",
    communityId: "community-vjti",
    totalRewardPoints: 120,
    averageRating: 4.5,
    totalDeliveries: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-priya",
    name: "Priya Desai",
    email: "priya@vjti.ac.in",
    profilePhoto: "",
    phoneNumber: "9876543211",
    college: "VJTI Mumbai",
    communityId: "community-vjti",
    totalRewardPoints: 80,
    averageRating: 4.8,
    totalDeliveries: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-rohit",
    name: "Rohit Patil",
    email: "rohit@vjti.ac.in",
    profilePhoto: "",
    phoneNumber: "9876543212",
    college: "VJTI Mumbai",
    communityId: "community-vjti",
    totalRewardPoints: 50,
    averageRating: 4.2,
    totalDeliveries: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-sneha",
    name: "Sneha Kulkarni",
    email: "sneha@vjti.ac.in",
    profilePhoto: "",
    phoneNumber: "9876543213",
    college: "VJTI Mumbai",
    communityId: "community-vjti",
    totalRewardPoints: 30,
    averageRating: 4.0,
    totalDeliveries: 3,
    createdAt: new Date().toISOString(),
  },
];

export const DUMMY_COMMUNITY: Community = {
  id: "community-vjti",
  name: "VJTI Hostel",
  description:
    "Community for VJTI hostel students to help each other with quick errands.",
  inviteCode: "VJTI2025",
  members: ["user-aman", "user-priya", "user-rohit", "user-sneha"],
  createdBy: "user-aman",
  createdAt: new Date().toISOString(),
};

export const DUMMY_TRIP: Trip = {
  id: "trip-1",
  helperId: "user-aman",
  communityId: "community-vjti",
  destinationArea: "Matunga",
  destinationShop: "Sai Kirana & General Stores",
  note: "Going to collect the MikroMile group order (noodles case) at 5 PM. I can bring your items to the hostel gate too!",
  expectedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  shopLocation: {
    lat: 19.0278,
    lng: 72.8558,
    address: "Sai Kirana & General Stores, near VJTI Gate, Matunga, Mumbai",
  },
  status: "active",
  groupBuyId: "gb-noodles",
  createdAt: new Date().toISOString(),
};

export const DUMMY_REQUESTS: ItemRequest[] = [
  {
    id: "req-1",
    tripId: "trip-1",
    requesterId: "user-priya",
    itemName: "Notebook (200 pages)",
    quantity: 1,
    preferredBrand: "Classmate",
    estimatedPrice: 60,
    urgency: "medium",
    note: "Ruled pages please",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "req-2",
    tripId: "trip-1",
    requesterId: "user-rohit",
    itemName: "Gel Pens",
    quantity: 2,
    estimatedPrice: 40,
    urgency: "low",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "req-3",
    tripId: "trip-1",
    requesterId: "user-sneha",
    itemName: "Crocin Strip",
    quantity: 1,
    estimatedPrice: 25,
    urgency: "high",
    note: "Fever since morning, urgent!",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "user-priya",
    title: "New Trip Posted",
    message: "Aman Sharma is going to Sai Kirana & General Stores in Matunga.",
    type: "trip_posted",
    read: false,
    relatedTripId: "trip-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    userId: "user-rohit",
    title: "New Trip Posted",
    message: "Aman Sharma is going to Sai Kirana & General Stores in Matunga.",
    type: "trip_posted",
    read: false,
    relatedTripId: "trip-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-3",
    userId: "user-sneha",
    title: "New Trip Posted",
    message: "Aman Sharma is going to Sai Kirana & General Stores in Matunga.",
    type: "trip_posted",
    read: false,
    relatedTripId: "trip-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-4",
    userId: "user-priya",
    title: "Group Order Ready! 🎉",
    message:
      "The Maggi noodles group order is packed at Sai Kirana. Collect at Hostel Gate A.",
    type: "group_buy_update",
    read: false,
    relatedGroupBuyId: "gb-noodles",
    createdAt: new Date().toISOString(),
  },
];

// ---------- Group Buy seed data ----------

export const DUMMY_STORES: Store[] = [
  {
    id: "store-sharma",
    name: "Sharma Book Depot",
    category: "Stationery",
    address: "Shop 12, Khodadad Circle, Matunga",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "store-kirana",
    name: "Sai Kirana & General Stores",
    category: "Grocery",
    address: "Near VJTI Gate, Matunga",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * One seeded group buy demonstrating the READY state (collect flow).
 * Open and past deals are intentionally left out — create your own via
 * /group-buy/create when demoing (e.g. an OPEN deal for the join-to-unlock
 * flow, or a COMPLETED deal for the savings/history section).
 */
export const DUMMY_GROUP_BUYS: GroupBuy[] = [
  {
    id: "gb-noodles",
    communityId: "community-vjti",
    organizerId: "user-aman",
    storeId: "store-kirana",
    productName: "Instant Noodles Case (Maggi, 12-pack)",
    unit: "case",
    description:
      "Midnight snack reserves. Order confirmed — store is preparing one consolidated order.",
    individualPrice: 336,
    dealPrice: 280,
    minQuantity: 30,
    deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    pickupLocation: "Hostel Gate A",
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "ready",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export const DUMMY_PARTICIPATIONS: Participation[] = [
  // gb-noodles — ready for pickup, payments simulated as paid
  { id: "part-nd-1", groupBuyId: "gb-noodles", userId: "user-aman", quantity: 12, status: "paid", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "part-nd-2", groupBuyId: "gb-noodles", userId: "user-priya", quantity: 10, status: "paid", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "part-nd-3", groupBuyId: "gb-noodles", userId: "user-rohit", quantity: 8, status: "paid", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "part-nd-4", groupBuyId: "gb-noodles", userId: "user-sneha", quantity: 4, status: "paid", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

export function seedDatabase(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return; // already seeded

  clearAll();

  // Seed users
  DUMMY_USERS.forEach((u) => create(Collections.USERS, u));

  // Seed community
  create(Collections.COMMUNITIES, DUMMY_COMMUNITY);

  // Seed trip
  create(Collections.TRIPS, DUMMY_TRIP);

  // Seed requests
  DUMMY_REQUESTS.forEach((r) => create(Collections.REQUESTS, r));

  // Seed notifications
  DUMMY_NOTIFICATIONS.forEach((n) => create(Collections.NOTIFICATIONS, n));

  // Seed partner stores
  DUMMY_STORES.forEach((s) => create(Collections.STORES, s));

  // Seed group buys + participations
  DUMMY_GROUP_BUYS.forEach((g) => create(Collections.GROUP_BUYS, g));
  DUMMY_PARTICIPATIONS.forEach((p) => create(Collections.PARTICIPATIONS, p));

  localStorage.setItem(SEED_KEY, "true");
}

export function resetDatabase(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEED_KEY);
  clearAll();
  seedDatabase();
}
