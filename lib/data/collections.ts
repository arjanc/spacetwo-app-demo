import type { Collection } from "../data-service";

export const collectionsData: Record<string, Collection[]> = {
  "Nike Space": [
    {
      id: 1,
      title: "New Nike Graphic",
      fileCount: 6,
      lastUpdated: "5 mins ago",
      isLive: true,
      files: [
        {
          id: 1,
          image: "https://picsum.photos/seed/nike1/300/400",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 2,
          image: "https://picsum.photos/seed/nike2/400/250",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 3,
          image: "https://picsum.photos/seed/nike3/200/200",
          type: "square",
          orientation: "square",
        },
        {
          id: 4,
          image: "https://picsum.photos/seed/nike4/200/200",
          type: "square",
          orientation: "square",
        },
      ],
    },
    {
      id: 2,
      title: "Instagram Story",
      fileCount: 5,
      lastUpdated: "5 mins ago",
      isLive: true,
      files: [
        {
          id: 5,
          image: "https://picsum.photos/seed/insta1/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 6,
          image: "https://picsum.photos/seed/insta2/250/350",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 7,
          image: "https://picsum.photos/seed/insta3/200/200",
          type: "square",
          orientation: "square",
        },
        {
          id: 8,
          image: "https://picsum.photos/seed/insta4/300/400",
          type: "vertical",
          orientation: "portrait",
        },
      ],
    },
    {
      id: 3,
      title: "Product Showcase",
      fileCount: 8,
      lastUpdated: "2 hours ago",
      isLive: false,
      files: [
        {
          id: 9,
          image: "https://picsum.photos/seed/product1/400/250",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 10,
          image: "https://picsum.photos/seed/product2/300/400",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 11,
          image: "https://picsum.photos/seed/product3/200/200",
          type: "square",
          orientation: "square",
        },
        {
          id: 12,
          image: "https://picsum.photos/seed/product4/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
      ],
    },
  ],
  "Spacetwo Studio": [
    {
      id: 4,
      title: "Brand Identity",
      fileCount: 12,
      lastUpdated: "1 hour ago",
      isLive: false,
      files: [
        {
          id: 13,
          image: "https://picsum.photos/seed/brand1/250/350",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 14,
          image: "https://picsum.photos/seed/brand2/400/250",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 15,
          image: "https://picsum.photos/seed/brand3/200/200",
          type: "square",
          orientation: "square",
        },
        {
          id: 16,
          image: "https://picsum.photos/seed/brand4/200/200",
          type: "square",
          orientation: "square",
        },
      ],
    },
    {
      id: 5,
      title: "Website Redesign",
      fileCount: 15,
      lastUpdated: "3 hours ago",
      isLive: true,
      files: [
        {
          id: 17,
          image: "https://picsum.photos/seed/web1/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 18,
          image: "https://picsum.photos/seed/web2/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 19,
          image: "https://picsum.photos/seed/web3/250/350",
          type: "vertical",
          orientation: "portrait",
        },
      ],
    },
  ],
  "Photoshop Collections": [
    {
      id: 6,
      title: "Photo Manipulation",
      fileCount: 10,
      lastUpdated: "30 mins ago",
      isLive: true,
      files: [
        {
          id: 20,
          image: "https://picsum.photos/seed/photo1/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 21,
          image: "https://picsum.photos/seed/photo2/300/400",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 22,
          image: "https://picsum.photos/seed/photo3/200/200",
          type: "square",
          orientation: "square",
        },
        {
          id: 23,
          image: "https://picsum.photos/seed/photo4/400/250",
          type: "horizontal",
          orientation: "landscape",
        },
      ],
    },
    {
      id: 7,
      title: "Digital Art",
      fileCount: 7,
      lastUpdated: "1 hour ago",
      isLive: false,
      files: [
        {
          id: 24,
          image: "https://picsum.photos/seed/art1/250/350",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 25,
          image: "https://picsum.photos/seed/art2/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 26,
          image: "https://picsum.photos/seed/art3/200/200",
          type: "square",
          orientation: "square",
        },
      ],
    },
  ],
  "Design System": [
    {
      id: 8,
      title: "Component Library",
      fileCount: 25,
      lastUpdated: "2 hours ago",
      isLive: true,
      files: [
        {
          id: 27,
          image: "https://picsum.photos/seed/comp1/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 28,
          image: "https://picsum.photos/seed/comp2/300/400",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 29,
          image: "https://picsum.photos/seed/comp3/200/200",
          type: "square",
          orientation: "square",
        },
        {
          id: 30,
          image: "https://picsum.photos/seed/comp4/400/250",
          type: "horizontal",
          orientation: "landscape",
        },
      ],
    },
  ],
  "Open Source": [
    {
      id: 9,
      title: "UI Kit",
      fileCount: 18,
      lastUpdated: "4 hours ago",
      isLive: false,
      files: [
        {
          id: 31,
          image: "https://picsum.photos/seed/ui1/400/300",
          type: "horizontal",
          orientation: "landscape",
        },
        {
          id: 32,
          image: "https://picsum.photos/seed/ui2/250/350",
          type: "vertical",
          orientation: "portrait",
        },
        {
          id: 33,
          image: "https://picsum.photos/seed/ui3/200/200",
          type: "square",
          orientation: "square",
        },
      ],
    },
  ],
};
