import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Shirt } from 'lucide-react-native';

export const StackedPreview = ({ images, small = false }: { images: string[], small?: boolean }) => {
  const previewImages = images?.length ? images.slice(0, 3) : [];

  if (previewImages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconBox, small && { width: 48, height: 48 }]}>
          <Shirt size={small ? 20 : 28} color="#3f3f46" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {previewImages.map((img, index) => {
        const rotations = ['-6deg', '0deg', '6deg'];
        const yOffsets = small ? [5, -2, 5] : [10, -5, 10];
        const zIndex = previewImages.length - index;
        const cardWidth = small ? 70 : 112;
        const overlap = small ? -30 : -45;

        return (
          <View
            key={`img-${index}`}
            style={[
              styles.imageCard,
              {
                width: cardWidth,
                height: small ? 90 : 144,
                marginLeft: index === 0 ? 0 : overlap,
                transform: [
                  { rotate: rotations[index] || '0deg' },
                  { translateY: yOffsets[index] || 0 }
                ],
                zIndex: zIndex,
              }
            ]}
          >
            {index === 0 && !small && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>TOP</Text>
              </View>
            )}
            <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  emptyIconBox: { height: 64, width: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' },
  imageCard: { borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#18181b', backgroundColor: '#27272a', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  badge: { position: 'absolute', top: 8, left: 8, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  image: { width: '100%', height: '100%' }
});
