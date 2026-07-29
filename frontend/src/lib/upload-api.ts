export interface UploadResponse {
  contract_id?: string;
  title?: string;
  message?: string;
  [key: string]: unknown;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function uploadContract(
  title: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve({});
        }
      } else {
        let detail = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body?.detail) detail = body.detail;
        } catch {
          // ignore parse error
        }
        reject(new Error(detail));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error — could not reach the server.")),
    );

    xhr.open("POST", `${API_BASE_URL}/contracts/upload`);
    xhr.send(formData);
  });
}
