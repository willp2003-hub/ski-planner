import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

// --- User Profiles ---

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, data);
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  }
}

// --- Posts ---

export async function getUserPosts(userId) {
  const q = query(
    collection(db, "posts"),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createPost(data) {
  const ref = await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePost(postId, data) {
  await updateDoc(doc(db, "posts", postId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, "posts", postId));
}

// --- Trips ---

export async function getUserTrips(userId) {
  const q = query(
    collection(db, "trips"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createTrip(data) {
  const ref = await addDoc(collection(db, "trips"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTrip(tripId, data) {
  await updateDoc(doc(db, "trips", tripId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrip(tripId) {
  await deleteDoc(doc(db, "trips", tripId));
}

// --- Feed ---

export async function getAllRecentPosts(count = 50) {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
