import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCTS_CACHE_KEY = "PRODUCTS_CACHE";
const CATEGORIES_CACHE_KEY = "CATEGORIES_CACHE";
const FAV_KEY = "USER_FAVOURITES";

export const saveProductsToCache = async (products: any[]) => {
  try {
    await AsyncStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify({
        data: products,
        cachedAt: Date.now(),
      }),
    );
  } catch (e) {
    console.log("Error saving products cache", e);
  }
};

export const getProductsFromCache = async () => {
  try {
    const value = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log("Error reading products cache", e);
    return null;
  }
};

export const saveCategoriesToCache = async (categories: string[]) => {
  try {
    await AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.log("Error saving categories cache", e);
  }
};

export const getCategoriesFromCache = async (): Promise<string[] | null> => {
  try {
    const value = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log("Error reading categories cache", e);
    return null;
  }
};
export const saveFavouritesToCache = async (ids: number[]) => {
  try {
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch (e) {
    console.log("Error saving favourites", e);
  }
};

export const getFavouritesFromCache = async (): Promise<number[]> => {
  try {
    const value = await AsyncStorage.getItem(FAV_KEY);
    return value ? JSON.parse(value) : [];
  } catch (e) {
    console.log("Error reading favourites", e);
    return [];
  }
};