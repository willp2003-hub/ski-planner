import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";

export async function uploadProfilePhoto(uid, file) {
  const storageRef = ref(storage, `profilePhotos/${uid}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadPostPhoto(userId, file) {
  const name = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `postPhotos/${userId}/${name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
