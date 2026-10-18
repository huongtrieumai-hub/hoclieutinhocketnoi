/**
 * Cloudinary Cloud Storage Integration Service
 * Cloud Name: onjpako3
 * Upload Preset: ml_default
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'onjpako3',
  uploadPreset: 'ml_default',
  apiUrl: 'https://api.cloudinary.com/v1_1/onjpako3/auto/upload',
};

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw' | string;
  format: string;
  originalFilename: string;
  bytes: number;
}

export const CloudinaryService = {
  /**
   * Upload an image, audio, video, or raw media file directly from local computer to Cloudinary CDN
   * @param file File or Blob object selected from user's computer
   * @param onProgress Optional progress callback percentage (0 to 100)
   */
  async uploadFile(
    file: File | Blob,
    onProgress?: (percent: number) => void
  ): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    // Browser XMLHttpRequest with progress support
    if (typeof window !== 'undefined' && typeof XMLHttpRequest !== 'undefined') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', CLOUDINARY_CONFIG.apiUrl, true);

        if (onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              const secureUrl = data.secure_url || data.url;
              console.log('[Cloudinary] Successfully uploaded media to Cloudinary CDN:', secureUrl);
              resolve({
                url: secureUrl,
                secureUrl: secureUrl,
                publicId: data.public_id,
                resourceType: data.resource_type,
                format: data.format,
                originalFilename: data.original_filename || (file instanceof File ? file.name : 'uploaded_file'),
                bytes: data.bytes,
              });
            } catch (err) {
              reject(new Error('Lỗi phản hồi dữ liệu Cloudinary: ' + String(err)));
            }
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData.error?.message || `Lỗi tải lên Cloudinary (Mã HTTP ${xhr.status})`));
            } catch {
              reject(new Error(`Tải lên Cloudinary thất bại (Mã HTTP ${xhr.status})`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Lỗi kết nối mạng tới Cloudinary (onjpako3). Vui lòng kiểm tra lại đường truyền internet!'));
        };

        xhr.send(formData);
      });
    }

    // Standard Fetch API fallback
    if (onProgress) onProgress(30);
    const res = await fetch(CLOUDINARY_CONFIG.apiUrl, {
      method: 'POST',
      body: formData,
    });
    if (onProgress) onProgress(90);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary Upload Error (HTTP ${res.status}): ${errText}`);
    }
    const data = await res.json();
    if (onProgress) onProgress(100);
    const secureUrl = data.secure_url || data.url;
    console.log('[Cloudinary] Successfully uploaded media to Cloudinary CDN:', secureUrl);
    return {
      url: secureUrl,
      secureUrl: secureUrl,
      publicId: data.public_id,
      resourceType: data.resource_type,
      format: data.format,
      originalFilename: data.original_filename || (file instanceof File ? file.name : 'uploaded_file'),
      bytes: data.bytes,
    };
  },

  /**
   * Helper to convert Data URL / Base64 to Blob if needed
   */
  dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },
};
