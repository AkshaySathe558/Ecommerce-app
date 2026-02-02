import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import NetInfo from "@react-native-community/netinfo";
import { getProducts, getCategories } from "../../api";
import { Product } from "../../types/product";
import {
  saveProductsToCache,
  getProductsFromCache,
  saveCategoriesToCache,
  getCategoriesFromCache,
} from "../../utils/cache";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      const cached = await getProductsFromCache();
      if (cached?.data) {
        return { products: cached.data, fromCache: true };
      }
      return rejectWithValue("No internet & no cached data");
    }

    try {
      const res = await getProducts();
      await saveProductsToCache(res.data);
      return { products: res.data, fromCache: false };
    } catch (err: any) {
      const cached = await getProductsFromCache();
      if (cached?.data) {
        return { products: cached.data, fromCache: true };
      }
      return rejectWithValue("Failed to fetch products");
    }
  },
);

export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      const cached = await getCategoriesFromCache();
      if (cached && cached.length > 0) {
        return cached;
      }
      return ["all"];
    }

    try {
      const res = await getCategories();
      const data = ["all", ...res.data];
      await saveCategoriesToCache(data);
      return data;
    } catch (err: any) {
      const cached = await getCategoriesFromCache();
      if (cached && cached.length > 0) {
        return cached;
      }
      return ["all"];
    }
  },
);

interface ProductsState {
  items: Product[];
  categories: string[]; 
  status: "idle" | "loading" | "succeeded" | "failed";
  categoriesStatus: "idle" | "loading" | "succeeded" | "failed"; 
  error: string | null;
  cachedAt: number | null;
  isOfflineData: boolean;
}

const initialState: ProductsState = {
  items: [],
  categories: ["all"],
  status: "idle",
  categoriesStatus: "idle",
  error: null,
  cachedAt: null,
  isOfflineData: false,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.products;
        state.isOfflineData = action.payload.fromCache;
        state.cachedAt = Date.now();
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = "failed";
      });
  },
});

export default productsSlice.reducer;
