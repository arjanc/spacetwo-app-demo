import type { FileDetail } from "../data-service"

export const fileDetailsData: Record<string, FileDetail> = {
  "1": {
    id: "1",
    title: "Blue Oranges",
    description:
      "A stunning photography piece exploring the contrast between warm and cool tones. This experimental work challenges traditional color theory by juxtaposing complementary colors in an unexpected natural setting.",
    image: "/images/card-1.png",
    author: {
      name: "Alex Chen",
      avatar: "https://picsum.photos/seed/user1/100/100",
      username: "@alexchen",
    },
    stats: {
      likes: 160,
      comments: 20,
      views: 1420,
    },
    tags: ["Photography", "Color Theory", "Nature", "Experimental"],
    type: "image",
    category: "Photography",
    createdAt: "3 days ago",
  },
  "2": {
    id: "2",
    title: "New Fiat 500",
    description:
      "Automotive photography showcasing the sleek design and modern aesthetics of the new Fiat 500. Shot with dramatic lighting to emphasize the vehicle's curves and contemporary styling.",
    image: "/images/card-2.png",
    author: {
      name: "Maria Rodriguez",
      avatar: "https://picsum.photos/seed/user2/100/100",
      username: "@mariarodriguez",
    },
    stats: {
      likes: 120,
      comments: 20,
      views: 980,
    },
    tags: ["Automotive", "Photography", "Design", "Commercial"],
    type: "image",
    category: "Photography",
    createdAt: "5 days ago",
  },
  "3": {
    id: "3",
    title: "The Crave",
    description:
      "A bold brand identity project that captures the essence of modern desire and aspiration. This comprehensive branding package includes logo design, color palette, and visual language.",
    image: "/images/card-3.png",
    author: {
      name: "David Kim",
      avatar: "https://picsum.photos/seed/user3/100/100",
      username: "@davidkim",
    },
    stats: {
      likes: 110,
      comments: 20,
      views: 850,
    },
    tags: ["Branding", "Logo Design", "Identity", "Typography"],
    type: "image",
    category: "Brand",
    createdAt: "1 week ago",
  },
  "4": {
    id: "4",
    title: "B&W Art",
    description:
      "Minimalist black and white illustration exploring the power of negative space and geometric forms. This piece demonstrates how simplicity can create powerful visual impact.",
    image: "/images/card-4.png",
    author: {
      name: "Sarah Johnson",
      avatar: "https://picsum.photos/seed/user4/100/100",
      username: "@sarahjohnson",
    },
    stats: {
      likes: 20,
      comments: 100,
      views: 650,
    },
    tags: ["Illustration", "Minimalism", "Black & White", "Geometric"],
    type: "image",
    category: "Illustration",
    createdAt: "2 weeks ago",
  },
  "5": {
    id: "5",
    title: "My Girlfriend",
    description:
      "An intimate portrait capturing a candid moment. This personal photography project explores themes of love, connection, and everyday beauty through a documentary lens.",
    image: "/images/card-5.png",
    author: {
      name: "Jake Thompson",
      avatar: "https://picsum.photos/seed/user5/100/100",
      username: "@jakethompson",
    },
    stats: {
      likes: 20,
      comments: 90,
      views: 420,
    },
    tags: ["Portrait", "Documentary", "Personal", "Candid"],
    type: "image",
    category: "Photography",
    createdAt: "4 days ago",
  },
  "nike-1": {
    id: "nike-1",
    title: "NK Jordan Animation",
    description:
      "Dynamic motion graphics showcasing the iconic Jordan brand. This animation combines sleek typography, bold colors, and fluid transitions to create an engaging brand experience.",
    image: "https://picsum.photos/seed/nike1/300/400",
    author: {
      name: "Alex Chen",
      avatar: "https://picsum.photos/seed/alex/100/100",
      username: "@alexchen",
    },
    stats: {
      likes: 247,
      comments: 32,
      views: 1420,
    },
    tags: ["Motion Graphics", "Branding", "Animation", "Sports"],
    type: "animation",
    category: "Motion",
    createdAt: "2 days ago",
    project: "Nike Space",
  },
  "nike-2": {
    id: "nike-2",
    title: "Air Max Campaign",
    description:
      "Visual campaign for the latest Air Max release featuring dynamic product shots and lifestyle imagery that captures the essence of street culture and athletic performance.",
    image: "https://picsum.photos/seed/nike2/400/250",
    author: {
      name: "Maria Rodriguez",
      avatar: "https://picsum.photos/seed/maria/100/100",
      username: "@mariarodriguez",
    },
    stats: {
      likes: 189,
      comments: 28,
      views: 1120,
    },
    tags: ["Product Photography", "Campaign", "Lifestyle", "Athletic"],
    type: "image",
    category: "Photography",
    createdAt: "1 week ago",
    project: "Nike Space",
  },
  "photo-1": {
    id: "photo-1",
    title: "Surreal Landscape",
    description:
      "Digital art piece created through advanced photo manipulation techniques. This surreal landscape combines multiple photographic elements to create an otherworldly scene.",
    image: "https://picsum.photos/seed/photo1/400/300",
    author: {
      name: "David Kim",
      avatar: "https://picsum.photos/seed/david/100/100",
      username: "@davidkim",
    },
    stats: {
      likes: 156,
      comments: 24,
      views: 890,
    },
    tags: ["Photo Manipulation", "Digital Art", "Surreal", "Landscape"],
    type: "image",
    category: "Digital Art",
    createdAt: "30 mins ago",
    project: "Photoshop Projects",
  },
}
