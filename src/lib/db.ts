// ===============================
// MikroMile — localStorage Database Layer
// ===============================
// A simple CRUD abstraction over localStorage, acting as a temporary DB.
// Each "collection" is stored as a JSON array under a key like "mikromile_users".

const PREFIX = "mikromile_";

function getCollection<T>(name: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PREFIX + name);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setCollection<T>(name: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + name, JSON.stringify(data));
}

// ---------- Generic CRUD ----------

export function getAll<T>(collection: string): T[] {
  return getCollection<T>(collection);
}

export function getById<T extends { id: string }>(
  collection: string,
  id: string,
): T | undefined {
  return getCollection<T>(collection).find((item) => item.id === id);
}

export function getByField<T>(
  collection: string,
  field: keyof T,
  value: unknown,
): T[] {
  return getCollection<T>(collection).filter((item) => item[field] === value);
}

export function create<T extends { id: string }>(
  collection: string,
  item: T,
): T {
  const items = getCollection<T>(collection);
  items.push(item);
  setCollection(collection, items);
  return item;
}

export function update<T extends { id: string }>(
  collection: string,
  id: string,
  updates: Partial<T>,
): T | undefined {
  const items = getCollection<T>(collection);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...updates };
  setCollection(collection, items);
  return items[index];
}

export function remove<T extends { id: string }>(
  collection: string,
  id: string,
): boolean {
  const items = getCollection<T>(collection);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  setCollection(collection, filtered);
  return true;
}

export function clearCollection(collection: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + collection);
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}

// ---------- Collection Names ----------

export const Collections = {
  USERS: "users",
  COMMUNITIES: "communities",
  TRIPS: "trips",
  REQUESTS: "requests",
  MEETING_POINTS: "meeting_points",
  TRANSACTIONS: "transactions",
  REVIEWS: "reviews",
  REWARDS: "rewards",
  NOTIFICATIONS: "notifications",
  STORES: "stores",
  GROUP_BUYS: "group_buys",
  PARTICIPATIONS: "participations",
} as const;
