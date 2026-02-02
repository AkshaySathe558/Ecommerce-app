import { useEffect, useState } from "react";
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
  const [category, setCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(loadFavourites());
    dispatch(fetchCategories());

    if (cachedAt && Date.now() - cachedAt < 5 * 60 * 1000) {
    } else {
      dispatch(fetchProducts());
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchProducts()),
      dispatch(fetchCategories()),
      dispatch(loadFavourites()),
    ]);
    setRefreshing(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  if (status === "loading" && products.length === 0) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loaderText}>Loading products...</Text>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: "red", marginBottom: 16 }}>
          No internet connection
        </Text>
        <TouchableOpacity onPress={() => dispatch(fetchProducts())}>
          <Text style={{ color: "#0066cc", fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {isOfflineData && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            You are offline. Showing cached products.
          </Text>
        </View>
      )}

      {categoriesStatus === "loading" && categories.length <= 1 ? (
        <View style={styles.categoryLoader}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.categoryLoaderText}>Loading categories...</Text>
        </View>
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor="#555"
            enabled={categories.length > 1}
          >
            {categories.map((cat) => (
              <Picker.Item
                key={cat}
                label={
                  cat === "all"
                    ? "All Categories"
                    : cat.charAt(0).toUpperCase() + cat.slice(1)
                }
                value={cat}
              />
            ))}
          </Picker>
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
            <Text style={styles.emptyText}>
              {status === "loading" ? (
                <>
                  <ActivityIndicator size="small" color="#888" />
                  <Text> Loading products...</Text>
                </>
              ) : (
                "No products found"
              )}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "white",
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: "#fdecea",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  offlineText: {
    color: "#b71c1c",
    textAlign: "center",
  },
  categoryLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "white",
    marginBottom: 16,
  },
  categoryLoaderText: {
    marginLeft: 8,
    color: "#666",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "white",
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: 52,
  },
  row: {
    gap: 12,
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
  },
});
