import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { RootState, AppDispatch } from "../store";
import { fetchProducts, fetchCategories } from "../store/slices/productsSlice";
import {
  toggleFavourite,
  loadFavourites,
} from "../store/slices/favouritesSlice";
import ProductCard from "../components/ProductCard";

export default function ProductListScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items: products,
    categories,
    categoriesStatus,
    isOfflineData,
    status,
    error,
    cachedAt,
  } = useSelector((state: RootState) => state.products);

  const favourites = useSelector((state: RootState) => state.favourites.ids);

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const loadData = () => {
      dispatch(loadFavourites());
      dispatch(fetchCategories());

      if (!cachedAt || Date.now() - cachedAt >= 5 * 60 * 1000) {
        dispatch(fetchProducts());
      }
    };

    loadData();
  }, [dispatch, cachedAt]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchProducts()),
      dispatch(fetchCategories()),
      dispatch(loadFavourites()),
    ]);
    setRefreshing(false);
  };

  const getDisplayLabel = (cat: string) => {
    if (cat === "all") return "All";
    if (cat === "") return "Category";

    let formatted = cat.charAt(0).toUpperCase() + cat.slice(1);

    return formatted.length > 14 ? formatted.substring(0, 11) + "…" : formatted;
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.title
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
        const matchesCategory =
          category === "" ||
          category === "all" ||
          product.category === category;
        return matchesSearch && matchesCategory;
      }),
    [products, debouncedSearch, category],
  );

  if (status === "loading" && products.length === 0) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loaderText}>Loading…</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: "red", marginBottom: 8, fontSize: 15 }}>
          No Internet connection
        </Text>
        <TouchableOpacity onPress={() => dispatch(fetchProducts())}>
          <Text style={{ color: "#0066cc", fontWeight: "600", fontSize: 15 }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search…"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {categoriesStatus === "loading" && categories.length <= 1 ? (
          <View style={styles.miniLoader}>
            <ActivityIndicator size="small" color="#888" />
          </View>
        ) : (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
              mode="dropdown"
              dropdownIconColor="#666"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Category" value="" />
              <Picker.Item label="All" value="all" />
              {categories
                .filter((cat) => cat !== "all")
                .map((cat) => (
                  <Picker.Item
                    key={cat}
                    label={getDisplayLabel(cat)}
                    value={cat}
                  />
                ))}
            </Picker>
          </View>
        )}
      </View>

      {isOfflineData && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline – cached data</Text>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavourite={favourites.includes(item.id)}
            onPress={() =>
              navigation.navigate("ProductDetail", { productId: item.id })
            }
            onToggleFav={() => dispatch(toggleFavourite(item.id))}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {status === "loading" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color="#888" />
                <Text style={{ marginLeft: 6, fontSize: 14 }}>Loading…</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>No products</Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f9f9f9",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  searchInput: {
    flex: 1.4,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },

  pickerWrapper: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    justifyContent: "center",
  },

  picker: {
    height: 50,
  },

  pickerItem: {
    fontSize: 13,
    color: "#222",
  },

  miniLoader: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  offlineBanner: {
    backgroundColor: "#ffebee",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  offlineText: {
    color: "#c62828",
    textAlign: "center",
    fontSize: 12,
  },

  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  row: { gap: 8 },
  listContent: { paddingBottom: 16, flexGrow: 1 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
});
