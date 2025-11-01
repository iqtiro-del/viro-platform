// Default category images mapping - Modern professional stock images
export const categoryImages: Record<string, string> = {
  "Instagram": "/attached_assets/stock_images/instagram_social_med_c8519eb0.jpg",
  "Design": "/attached_assets/stock_images/graphic_design_creat_1bd5ede7.jpg",
  "Development": "/attached_assets/stock_images/programming_coding_d_1c88c7e8.jpg",
  "Writing": "/attached_assets/stock_images/content_writing_blog_4204903c.jpg",
  "Marketing": "/attached_assets/stock_images/digital_marketing_an_facee684.jpg",
  "Music & Audio": "/attached_assets/stock_images/music_production_aud_fe34ddfd.jpg",
  "TikTok": "/attached_assets/stock_images/tiktok_video_recordi_5bb32005.jpg",
  "Video & Animation": "/attached_assets/stock_images/video_editing_animat_804f56fe.jpg",
};

export function getProductImage(category: string, customImageUrl?: string | null): string {
  // If custom image URL exists and is not empty, use it
  if (customImageUrl && customImageUrl.trim() !== "") {
    return customImageUrl;
  }
  
  // Otherwise, use default category image
  return categoryImages[category] || categoryImages["Design"]; // Fallback to Design category
}
