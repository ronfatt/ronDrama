// ==============================================================================
// R.ON DRAMA STUDIO — CLIENT-SIDE ZERO-DEPENDENCY ZIP GENERATOR
// Standard PKZip (STORE format, 0% compression) for browser instant downloads
// ==============================================================================

interface ZipEntry {
  filename: string;
  data: Uint8Array;
}

// Precomputed CRC32 lookup table
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function calculateCRC32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZipArchive(entries: ZipEntry[]): Blob {
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let currentOffset = 0;

  for (const entry of entries) {
    const filenameBytes = new TextEncoder().encode(entry.filename);
    const crc = calculateCRC32(entry.data);
    const size = entry.data.length;

    // 1. Local File Header (30 bytes + filename length)
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const lv = new DataView(localHeader.buffer);

    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true);         // Version needed to extract (2.0)
    lv.setUint16(6, 0, true);          // General purpose bit flag
    lv.setUint16(8, 0, true);          // Compression method (0 = Store)
    lv.setUint16(10, 0x5460, true);    // Last mod file time
    lv.setUint16(12, 0x5460, true);    // Last mod file date
    lv.setUint32(14, crc, true);       // CRC-32
    lv.setUint32(18, size, true);      // Compressed size
    lv.setUint32(22, size, true);      // Uncompressed size
    lv.setUint16(26, filenameBytes.length, true); // Filename length
    lv.setUint16(28, 0, true);         // Extra field length
    localHeader.set(filenameBytes, 30);

    localHeaders.push(localHeader);
    localHeaders.push(entry.data);

    // 2. Central Directory Header (46 bytes + filename length)
    const centralHeader = new Uint8Array(46 + filenameBytes.length);
    const cv = new DataView(centralHeader.buffer);

    cv.setUint32(0, 0x02014b50, true); // Central file header signature
    cv.setUint16(4, 20, true);         // Version made by
    cv.setUint16(6, 20, true);         // Version needed to extract
    cv.setUint16(8, 0, true);          // General purpose bit flag
    cv.setUint16(10, 0, true);         // Compression method (0 = Store)
    cv.setUint16(12, 0x5460, true);    // Last mod file time
    cv.setUint16(14, 0x5460, true);    // Last mod file date
    cv.setUint32(16, crc, true);       // CRC-32
    cv.setUint32(20, size, true);      // Compressed size
    cv.setUint32(24, size, true);      // Uncompressed size
    cv.setUint16(28, filenameBytes.length, true); // Filename length
    cv.setUint16(30, 0, true);         // Extra field length
    cv.setUint16(32, 0, true);         // File comment length
    cv.setUint16(34, 0, true);         // Disk number start
    cv.setUint16(36, 0, true);         // Internal file attributes
    cv.setUint32(38, 0, true);         // External file attributes
    cv.setUint32(42, currentOffset, true); // Relative offset of local header
    centralHeader.set(filenameBytes, 46);

    centralHeaders.push(centralHeader);

    currentOffset += localHeader.length + size;
  }

  const centralDirOffset = currentOffset;
  let centralDirSize = 0;
  for (const h of centralHeaders) {
    centralDirSize += h.length;
  }

  // 3. End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);              // EOCD signature
  ev.setUint16(4, 0, true);                       // Number of this disk
  ev.setUint16(6, 0, true);                       // Disk where central directory starts
  ev.setUint16(8, entries.length, true);          // Total entries on this disk
  ev.setUint16(10, entries.length, true);         // Total entries in central directory
  ev.setUint32(12, centralDirSize, true);         // Size of central directory
  ev.setUint32(16, centralDirOffset, true);       // Offset of start of central directory
  ev.setUint16(20, 0, true);                      // ZIP file comment length

  const allParts = [...localHeaders, ...centralHeaders, eocd] as unknown as BlobPart[];
  return new Blob(allParts, { type: 'application/zip' });
}

export async function downloadReferencePackZip(
  folderName: string,
  files: Array<{ filename: string; textContent?: string; dataUrl?: string }>
) {
  const entries: ZipEntry[] = [];

  for (const file of files) {
    if (file.textContent) {
      entries.push({
        filename: `${folderName}/${file.filename}`,
        data: new TextEncoder().encode(file.textContent),
      });
    } else if (file.dataUrl) {
      try {
        if (file.dataUrl.startsWith('data:')) {
          const base64Data = file.dataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          entries.push({
            filename: `${folderName}/${file.filename}`,
            data: bytes,
          });
        } else {
          try {
            const res = await fetch(file.dataUrl);
            const blob = await res.blob();
            const arrayBuffer = await blob.arrayBuffer();
            entries.push({
              filename: `${folderName}/${file.filename}`,
              data: new Uint8Array(arrayBuffer),
            });
          } catch {
            entries.push({
              filename: `${folderName}/${file.filename}.url.txt`,
              data: new TextEncoder().encode(`Reference Image URL: ${file.dataUrl}`),
            });
          }
        }
      } catch (err) {
        console.warn('Failed to parse file for zip, skipping binary', file.filename, err);
      }
    }
  }

  const zipBlob = createZipArchive(entries);
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
