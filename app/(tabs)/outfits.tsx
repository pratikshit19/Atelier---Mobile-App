import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { StackedPreview } from '../../components/StackedPreview';
import { format } from 'date-fns';

const OutfitPreview = ({ outfit }: { outfit: any }) => {
  const images = (outfit.items || []).map((item: any) => item.image_url).filter(Boolean);

  return (
    <View className="w-full">
      <StackedPreview images={images} />
    </View>
  );
};

export default function OutfitsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOutfits = async () => {
    if (!user) return;
    try {
      const { data: outfitsData, error: outfitsError } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (outfitsError) {
        console.warn('outfits query failed:', outfitsError.message);
        setOutfits([]);
      } else {
        const outfitIds = (outfitsData || []).map((outfit: any) => outfit.id);
        let enrichedOutfits = outfitsData || [];

        if (outfitIds.length > 0) {
          const { data: outfitItemsData, error: outfitItemsError } = await supabase
            .from('outfit_items')
            .select('*, items(*)')
            .in('outfit_id', outfitIds);

          if (outfitItemsError) {
            console.warn('outfit_items query failed:', outfitItemsError.message);
          } else {
            const itemsByOutfit = (outfitItemsData || []).reduce((acc: Record<string, any[]>, record: any) => {
              const outfitId = record.outfit_id;
              acc[outfitId] = acc[outfitId] || [];
              if (record.items) acc[outfitId].push(record.items);
              return acc;
            }, {});

            enrichedOutfits = (outfitsData || []).map((outfit: any) => ({
              ...outfit,
              items: itemsByOutfit[outfit.id] || [],
            }));
          }
        }

        setOutfits(enrichedOutfits);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOutfits();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      <View className="px-6 pt-8 pb-6 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()} className="rounded-full bg-white/5 p-3 border border-white/10">
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-3xl font-bold">Saved Outfits</Text>
          <Text className="text-muted-foreground text-sm mt-1">Your personal collection of curated combinations.</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
          renderItem={({ item }) => {
            const createdDate = item.created_at ? format(new Date(item.created_at), 'dd MMM').toUpperCase() : 'N/A';
            const categoryLabels = item.items ? item.items.slice(0, 3).map((i: any) => i.category).join(' ') : 'ITEMS';

            return (
              <TouchableOpacity
                onPress={() => router.push('/planner')}
                activeOpacity={0.8}
                className="mb-4 overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d0d] p-4"
              >
                <View className="flex-row items-start justify-between mb-4">
                  <Text className="text-white/60 text-xs font-bold uppercase tracking-[0.15em]">{createdDate}</Text>
                  <TouchableOpacity className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Trash2 size={16} color="#71717a" />
                  </TouchableOpacity>
                </View>

                <OutfitPreview outfit={item} />

                <View className="mt-4">
                  <Text className="text-white text-2xl font-bold">{item.name || 'Untitled'}</Text>
                  <Text className="text-muted-foreground mt-2 text-xs uppercase tracking-[0.15em]">{categoryLabels}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-muted-foreground text-sm">No saved outfits yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
