// ============================================
// Cloudflare R2 Uploads Helper
// ============================================

/**
 * Upload a generated PDF buffer to an R2 bucket
 */
export async function uploadReceiptToR2(
  bucket: R2Bucket,
  pdfBuffer: Uint8Array,
  fileName: string,
): Promise<string> {
  await bucket.put(fileName, pdfBuffer, {
    httpMetadata: { contentType: 'application/pdf' },
  });
  return fileName;
}

/**
 * Retrieve a generated PDF buffer from the R2 bucket
 */
export async function getReceiptFromR2(
  bucket: R2Bucket,
  fileName: string,
): Promise<ArrayBuffer | null> {
  const object = await bucket.get(fileName);
  if (!object) {
    return null;
  }
  return object.arrayBuffer();
}
