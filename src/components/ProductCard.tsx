import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types/product';

type Props = {
  product: Product;
  isFavourite: boolean;
  onPress: () => void;
  onToggleFav: () => void;
};

export default function ProductCard({ product, isFavourite, onPress, onToggleFav }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }}
    >
      <Image
        source={{ uri: product.image }}
        style={{ width: '100%', height: 160, resizeMode: 'contain' }}
      />
      <Text numberOfLines={2} style={{ fontWeight: '600', marginTop: 8 }}>
        {product.title}
      </Text>
      <Text style={{ color: '#2ecc71', fontSize: 16, marginTop: 4 }}>
        ${product.price.toFixed(2)}
      </Text>

      <TouchableOpacity
        onPress={onToggleFav}
        style={{ position: 'absolute', top: 8, right: 8 }}
      >
        <Ionicons
          name={isFavourite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavourite ? 'red' : 'gray'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}