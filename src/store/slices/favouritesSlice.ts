import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getFavouritesFromCache,
  saveFavouritesToCache,
} from "../../utils/cache";
import { RootState } from "../index";

interface FavouritesState {
  ids: number[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: FavouritesState = {
  ids: [],
  status: "idle",
};

export const loadFavourites = createAsyncThunk("favourites/load", async () => {
  const ids = await getFavouritesFromCache();
  return ids;
});

export const toggleFavourite = createAsyncThunk(
  "favourites/toggle",
  async (productId: number, { getState }) => {
    const state = getState() as RootState;
    const currentIds = state.favourites.ids;

    let newIds: number[];

    if (currentIds.includes(productId)) {
      newIds = currentIds.filter((id) => id !== productId);
    } else {
      newIds = [...currentIds, productId];
    }

    await saveFavouritesToCache(newIds);

    return newIds;
  },
);

const favouritesSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {
    setFavouritesRaw: (state, action: PayloadAction<number[]>) => {
      state.ids = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadFavourites.fulfilled, (state, action) => {
      state.ids = action.payload;
      state.status = "succeeded";
    });

    builder.addCase(toggleFavourite.fulfilled, (state, action) => {
      state.ids = action.payload;
    });
    builder.addCase(toggleFavourite.rejected, (state, action) => {
      console.error("Failed to save favourite");
    });
  },
});

export const { setFavouritesRaw } = favouritesSlice.actions;
export default favouritesSlice.reducer;
