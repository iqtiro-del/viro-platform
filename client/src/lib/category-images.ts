// Import stock images for each category
import instagramImg from '@assets/ويط_1762928206296.jpg';
import tiktokImg from '@assets/طيط_1762928365919.jpg';
import designImg from '@assets/stock_images/graphic_designer_wor_d8dc611a.jpg';
import programmingImg from '@assets/ءءءءءءءءءءءءءءءءءء_1762929983714.jpg';
import marketingImg from '@assets/غغغغغغغغ_1762928798341.jpg';
import writingImg from '@assets/شسءسءس_1762929001931.jpg';
import videoImg from '@assets/كمنتالبيسشسيبلاتنم_1762929251207.jpg';
import musicImg from '@assets/ثقفغعهخحخهعغفقث_1762929435287.jpg';
import netflixImg from '@assets/IMG_3421_1766299780162.jpeg';
import youtubeImg from '@assets/IMG_3420_1766308410139.jpeg';

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
  "Netflix": netflixImg,
  "YouTube": youtubeImg,
};

// Categories with fixed images that sellers cannot change
export const fixedImageCategories = ["Netflix", "YouTube"];

export function getProductImage(category: string, customImageUrl?: string | null): string {
  // For fixed image categories (like Netflix), always use the category image
  if (fixedImageCategories.includes(category)) {
    return categoryImages[category] || categoryImages["Design"];
  }
  
  // If custom image URL exists and is not empty, use it
  if (customImageUrl && customImageUrl.trim() !== "") {
    return customImageUrl;
  }
  
  // Otherwise, use default category image
  return categoryImages[category] || categoryImages["Design"]; // Fallback to Design category
}
