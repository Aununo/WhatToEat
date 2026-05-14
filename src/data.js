import appleSource from "../food/apple.ts";
import androidSource from "../food/android.ts";
import restaurantImageMap from "../food/images.ts";

function toGalleryItem(source, ecosystem) {
  return source.map((entry, index) => ({
    id: `${ecosystem}_${index}`,
    name: entry.name,
    image: restaurantImageMap[entry.name] ?? null,
    price: entry.price
  }));
}

export const appleGallery = toGalleryItem(appleSource, "apple");
export const androidGallery = toGalleryItem(androidSource, "android");
