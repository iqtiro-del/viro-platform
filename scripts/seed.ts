import { db } from "../server/db";
import { users, products } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const [testUser] = await db
    .insert(users)
    .values({
      username: "demo_user",
      password: hashedPassword,
      fullName: "Demo User",
      email: "demo@tiro.iq",
      phone: "+964 750 123 4567",
      bio: "Professional developer and designer with 5+ years experience",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      isVerified: true,
      balance: "50000",
      totalEarnings: "120000",
      rating: "4.8",
      totalReviews: 25,
    })
    .returning()
    .onConflictDoNothing();

  console.log("✅ Created test user:", testUser?.username);

  // Create sample products
  if (testUser) {
    const sampleProducts = [
      {
        title: "Professional Website Design",
        description: "I will create a modern, responsive website for your business using the latest web technologies. Includes: Custom design, Mobile optimization, SEO setup, Contact forms, and more!",
        price: "250000",
        category: "Web Development",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        sellerId: testUser.id,
        isActive: true,
      },
      {
        title: "Mobile App Development (iOS & Android)",
        description: "Full-stack mobile app development with React Native. Cross-platform compatibility, beautiful UI/UX, backend integration, and app store deployment.",
        price: "800000",
        category: "Mobile Apps",
        imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
        sellerId: testUser.id,
        isActive: true,
      },
      {
        title: "Logo Design + Brand Identity",
        description: "Complete brand identity package including: Custom logo design, Color palette, Typography guide, Business card design, and social media templates.",
        price: "150000",
        category: "Graphic Design",
        imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
        sellerId: testUser.id,
        isActive: true,
      },
      {
        title: "Professional Video Editing",
        description: "High-quality video editing for YouTube, social media, or commercial use. Includes color grading, transitions, music, sound effects, and subtitles.",
        price: "120000",
        category: "Video Editing",
        imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
        sellerId: testUser.id,
        isActive: true,
      },
      {
        title: "SEO Content Writing (10 Articles)",
        description: "SEO-optimized articles for your website or blog. Well-researched, engaging content that ranks well on search engines. 1000+ words per article.",
        price: "200000",
        category: "Content Writing",
        imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
        sellerId: testUser.id,
        isActive: true,
      },
      {
        title: "Social Media Marketing Campaign",
        description: "Complete social media marketing strategy and execution. Includes content creation, scheduling, engagement, and monthly analytics reports.",
        price: "350000",
        category: "Digital Marketing",
        imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800",
        sellerId: testUser.id,
        isActive: true,
      },
    ];

    const createdProducts = await db
      .insert(products)
      .values(sampleProducts)
      .returning()
      .onConflictDoNothing();

    console.log(`✅ Created ${createdProducts.length} sample products`);
  }

  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
