export interface ReadImageResult {
  mimeType: string;
  data: string; // base64, no data: prefix
  previewUrl: string; // full data: URL for <img>
}

export function readImageFile(file: File): Promise<ReadImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",");
      resolve({ mimeType: file.type, data: base64, previewUrl: result });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
