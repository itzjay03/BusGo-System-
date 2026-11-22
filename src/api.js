import { auth } from "./firebase";

export async function getAuthHeaders(extra = {}) {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Not signed in. Please log in again.");
  }

  return { ...extra, Authorization: `Bearer ${token}` };
}