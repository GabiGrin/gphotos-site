export const galleryStats: Record<
  any,
  {
    averagePhotos: string;
    preferredLighting: string;
    mostPopularLens: string;
    bestGalleryLayout: string;
  }
> = {
  Wedding: {
    averagePhotos: "82",
    preferredLighting: "Natural",
    mostPopularLens: "Ultra Wide",
    bestGalleryLayout: "Masonry",
  },
  Conference: {
    averagePhotos: "120",
    preferredLighting: "Artificial",
    mostPopularLens: "Zoom",
    bestGalleryLayout: "Grid",
  },
  Travel: {
    averagePhotos: "150",
    preferredLighting: "Natural",
    mostPopularLens: "Wide Angle",
    bestGalleryLayout: "Slideshow",
  },
  Anniversary: {
    averagePhotos: "50",
    preferredLighting: "Warm Indoor",
    mostPopularLens: "Standard",
    bestGalleryLayout: "Collage",
  },
  Birthday: {
    averagePhotos: "60",
    preferredLighting: "Colorful Ambient",
    mostPopularLens: "Portrait",
    bestGalleryLayout: "Masonry",
  },
  "Family Reunion": {
    averagePhotos: "100",
    preferredLighting: "Natural",
    mostPopularLens: "Telephoto",
    bestGalleryLayout: "Timeline",
  },
  Graduation: {
    averagePhotos: "80",
    preferredLighting: "Stage Lighting",
    mostPopularLens: "Zoom",
    bestGalleryLayout: "Grid",
  },
  "Baby Shower": {
    averagePhotos: "40",
    preferredLighting: "Soft Indoor",
    mostPopularLens: "Portrait",
    bestGalleryLayout: "Collage",
  },
  "Corporate Event": {
    averagePhotos: "150",
    preferredLighting: "Artificial",
    mostPopularLens: "Standard",
    bestGalleryLayout: "Slideshow",
  },
  "Sports Event": {
    averagePhotos: "200",
    preferredLighting: "Outdoor",
    mostPopularLens: "Telephoto",
    bestGalleryLayout: "Grid",
  },
  "Holiday Celebration": {
    averagePhotos: "90",
    preferredLighting: "Festive Ambient",
    mostPopularLens: "Standard",
    bestGalleryLayout: "Masonry",
  },
  "Nonprofit Campaign": {
    averagePhotos: "110",
    preferredLighting: "Natural",
    mostPopularLens: "Wide Angle",
    bestGalleryLayout: "Timeline",
  },
  "Memorials and Tributes": {
    averagePhotos: "45",
    preferredLighting: "Soft Natural",
    mostPopularLens: "Portrait",
    bestGalleryLayout: "Collage",
  },
  Festival: {
    averagePhotos: "300",
    preferredLighting: "Dynamic Outdoor",
    mostPopularLens: "Ultra Wide",
    bestGalleryLayout: "Grid",
  },
  "Cultural Ceremony": {
    averagePhotos: "100",
    preferredLighting: "Ambient Natural",
    mostPopularLens: "Wide Angle",
    bestGalleryLayout: "Timeline",
  },
};

export type GalleryTypes = keyof typeof galleryStats;
