const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface ImgBBResponse {
    success?: boolean;
    data?: {
        display_url?: string;
        url?: string;
    };
    error?: {
        message?: string;
    };
}

export async function uploadImageToImgBB(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();

    if (!apiKey) {
        throw new Error(
            "ImgBB API key is missing. Add NEXT_PUBLIC_IMGBB_API_KEY to .env.local and restart the dev server."
        );
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image file (JPG, PNG, or WEBP).");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error("Image file must be smaller than 5MB.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
        `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`,
        {
            method: "POST",
            body: formData,
        }
    );

    const payload = (await res.json().catch(() => null)) as ImgBBResponse | null;

    if (!res.ok || !payload?.success) {
        const serverMsg =
            payload?.error?.message || "Failed to upload image to ImgBB.";
        throw new Error(serverMsg);
    }

    const imageUrl = payload.data?.display_url || payload.data?.url;

    if (!imageUrl) {
        throw new Error("ImgBB did not return a valid image URL.");
    }

    return imageUrl;
}