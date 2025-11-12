// Import stock images for each category
import instagramImg from '@assets/ويط_1762928206296.jpg';
import tiktokImg from '@assets/طيط_1762928365919.jpg';
import designImg from '@assets/stock_images/graphic_designer_wor_d8dc611a.jpg';
import programmingImg from '@assets/stock_images/programming_coding_d_b288b022.jpg';
import marketingImg from '@assets/stock_images/digital_marketing_st_f28637b9.jpg';
import writingImg from '@assets/stock_images/writing_notebook_typ_9fd0cc29.jpg';
import videoImg from '@assets/stock_images/video_editing_animat_7913d37d.jpg';
import musicImg from '@assets/stock_images/music_production_aud_9f10bf1e.jpg';

// Default category images mapping - Professional stock images
export const categoryImages: Record<string, string> = {
  "Instagram": instagramImg,
  "Design": designImg,
  "Development": programmingImg,
  "Programming": programmingImg,
  "Writing": writingImg,
  "Marketing": marketingImg,
  "Music & Audio": musicImg,
  "TikTok": tiktokImg,
  "Video & Animation": videoImg,
};

export function getProductImage(category: string, customImageUrl?: string | null): string {
  // If custom image URL exists and is not empty, use it
  if (customImageUrl && customImageUrl.trim() !== "") {
    return customImageUrl;
  }
  
  // Otherwise, use default category image
  return categoryImages[category] || categoryImages["Design"]; // Fallback to Design category
}
