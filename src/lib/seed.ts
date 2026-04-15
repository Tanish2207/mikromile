// ===============================
// MikroMile — Seed Data
// ===============================
// Pre-populates localStorage with sample users, a community, and a trip.

import { User, Community, Trip, ItemRequest, Notification } from "@/types";
import { getAll, create, Collections, clearAll } from "@/lib/db";

const SEED_KEY = "mikromile_seeded";

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
  name: "VJTI Boys Hostel",
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
  destinationShop: "Aarti Xerox",
  note: "Heading there for some printouts, can pick up stuff.",
  expectedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  shopLocation: {
    lat: 19.0278,
    lng: 72.8558,
    address: "Aarti Xerox, Matunga, Mumbai",
  },
  status: "active",
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
    message: "Aman Sharma is going to Aarti Xerox in Matunga.",
    type: "trip_posted",
    read: false,
    relatedTripId: "trip-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    userId: "user-rohit",
    title: "New Trip Posted",
    message: "Aman Sharma is going to Aarti Xerox in Matunga.",
    type: "trip_posted",
    read: false,
    relatedTripId: "trip-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-3",
    userId: "user-sneha",
    title: "New Trip Posted",
    message: "Aman Sharma is going to Aarti Xerox in Matunga.",
    type: "trip_posted",
    read: false,
    relatedTripId: "trip-1",
    createdAt: new Date().toISOString(),
  },
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

  localStorage.setItem(SEED_KEY, "true");
}

export function resetDatabase(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEED_KEY);
  clearAll();
  seedDatabase();
}
