import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavourite } from "../store/slices/favouritesSlice";
import { Ionicons } from "@expo/vector-icons";
import type { RootState, AppDispatch } from "../store";

export default function ProductDetailScreen({ route }: any) {
  const { productId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const product = useSelector((state: RootState) =>
    state.products.items.find((p) => p.id === productId),
  );
  const isFav = useSelector((state: RootState) =>
    state.favourites.ids.includes(productId),
  );

  useEffect(() => {
    if (!product) {
      Alert.alert("Product not found in cache");
    }
  }, [product]);

  if (!product) return <Text>Loading...</Text>;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 20,
      }}
    >
      <Image
        source={{ uri: product.image }}
        style={{
          width: "100%",
          height: 300,
          resizeMode: "contain",
          marginBottom: 16,
        }}
      />

      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{product.title}</Text>
      <Text style={{ fontSize: 22, color: "#27ae60", marginVertical: 8 }}>
        ${product.price.toFixed(2)}
      </Text>

      <Text style={{ fontSize: 17, color: "#555", lineHeight: 24 }}>
        {product.description}
      </Text>

      <TouchableOpacity
        onPress={() => dispatch(toggleFavourite(product.id))}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 20,
          backgroundColor: isFav ? "#e74c3c" : "#3498db",
          padding: 14,
          borderRadius: 12,
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={isFav ? "heart" : "heart-outline"}
          size={24}
          color="white"
        />
        <Text style={{ color: "white", marginLeft: 12, fontSize: 16 }}>
          {isFav ? "Remove from Favourites" : "Add to Favourites"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
