// Default category images mapping
import instagramImage from "@assets/stock_images/instagram_app_icon_s_a38179b5.jpg";
import designImage from "@assets/stock_images/graphic_design_tools_3e0fc2bd.jpg";
import developmentImage from "@assets/stock_images/programming_code_com_38e46ac7.jpg";
import writingImage from "@assets/stock_images/writing_paper_pen_no_9e56c035.jpg";
import marketingImage from "@assets/stock_images/digital_marketing_so_7cb49cc6.jpg";
import musicImage from "@assets/stock_images/music_headphones_aud_3ecbf0d1.jpg";
import tiktokImage from "@assets/stock_images/tiktok_app_social_me_3db68c54.jpg";
import videoImage from "@assets/stock_images/video_camera_film_pr_04d2757b.jpg";

export const categoryImages: Record<string, string> = {
  "Instagram": instagramImage,
  "Design": designImage,
  "Development": developmentImage,
  "Writing": writingImage,
  "Marketing": marketingImage,
  "Music & Audio": musicImage,
  "TikTok": tiktokImage,
  "Video & Animation": videoImage,
};

export function getProductImage(category: string, customImageUrl?: string | null): string {
  // If custom image URL exists and is not empty, use it
  if (customImageUrl && customImageUrl.trim() !== "") {
    return customImageUrl;
  }
  
  // Otherwise, use default category image
  return categoryImages[category] || categoryImages["Design"]; // Fallback to Design category
}
