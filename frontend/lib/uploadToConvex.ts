import { api } from "@/convex/_generated/api";

/**
 * Uploads a file to Convex storage.
 * @param file - The File object to upload
 * @param generateUploadUrl - The bound Convex mutation (from useMutation)
 * @returns storageId string
 */
export async function uploadToConvex(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<string> {
  const uploadUrl = await generateUploadUrl();

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }
  // 3. Convex returns { storageId } in the response body
  const { storageId } = await res.json();
  if (!storageId) throw new Error("Upload succeeded but no storageId returned");
  return storageId as string;
}
