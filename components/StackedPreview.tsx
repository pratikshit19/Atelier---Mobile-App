import React from 'react';
import { View, Image } from 'react-native';
import { Shirt } from 'lucide-react-native';

const stackLayers = [
  { width: 218, height: 218, left: 10, top: 18, rotate: '-12deg', bg: '#050812' },
  { width: 188, height: 188, left: 0, top: 8, rotate: '8deg', bg: '#0e1a35' },
  { width: 160, height: 160, left: 32, top: 32, rotate: '0deg', bg: '#ffffff' },
];

export const StackedPreview = ({ images }: { images: string[] }) => {
  const previewImages = images.length ? images.slice(0, 3) : [];
  const topImage = previewImages[0];

  return (
    <View className="h-[240px] w-full items-center justify-center">
      {stackLayers.map((layer, index) => (
        <View
          key={`stack-layer-${index}`}
          className="absolute rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
          style={{
            width: layer.width,
            height: layer.height,
            left: layer.left,
            top: layer.top,
            transform: [{ rotate: layer.rotate }],
            backgroundColor: layer.bg,
          }}
        >
          {index === 2 ? (
            topImage ? (
              <Image source={{ uri: topImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View className="flex-1 items-center justify-center bg-white">
                <View className="h-24 w-24 rounded-[32px] bg-[#0f172a] items-center justify-center">
                  <Shirt size={32} color="#71717a" />
                </View>
              </View>
            )
          ) : null}
        </View>
      ))}
    </View>
  );
};
