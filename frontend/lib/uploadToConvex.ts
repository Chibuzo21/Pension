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
  // 1. Ask Convex for a short-lived upload URL
  const uploadUrl = await generateUploadUrl();

  // 2. PUT the file directly to that URL
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  // 3. Convex returns the storageId in the response JSON
  const { storageId } = await res.json();
  return storageId as string;
}
