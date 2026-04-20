import React from 'react';
import { View, Image, Text } from 'react-native';

export const StackedPreview = ({ images }: { images: string[] }) => {
  const previewImages = images.length ? images.slice(0, 3) : [];

  if (previewImages.length === 0) {
    return (
      <View className="h-[200px] w-full bg-white/10 rounded-[16px] border border-white/10" />
    );
  }

  // Show up to 3 items in overlapping stacked cards with white backgrounds
  return (
    <View className="w-full h-[220px] relative items-center justify-center">
      {previewImages.map((img, index) => {
        const rotations = [-12, 0, 12];
        const xOffsets = [-35, 0, 35];
        const yOffsets = [15, 0, 15];
        const zIndex = previewImages.length - index;

        return (
          <View
            key={`img-${index}`}
            className="absolute w-24 h-32 rounded-[16px] overflow-hidden border-2 border-white bg-white"
            style={{
              transform: [
                { rotate: `${rotations[index]}deg` },
                { translateX: xOffsets[index] },
                { translateY: yOffsets[index] }
              ],
              zIndex: zIndex,
            }}
          >
            {index === 0 && (
              <View className="absolute top-2 left-2 z-10 bg-black/70 rounded-full px-2 py-1">
                <Text className="text-white text-[10px] font-bold">TOP</Text>
              </View>
            )}
            <Image source={{ uri: img }} className="w-full h-full" resizeMode="contain" />
          </View>
        );
      })}
    </View>
  );
};
