import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { RotateCw, Heart, Archive } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { StackedPreview } from '../../components/StackedPreview';

export default function PlannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('variation');

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    if (!user) return;
    setLoading(true);

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
      console.warn('outfits request failed:', error);
      setOutfits([]);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 pt-8 pb-10">
        <View className="mb-8">
          <Text className="text-white text-4xl font-bold mb-2">Smart Combos</Text>
          <Text className="text-muted-foreground text-sm">AI-suggested outfits based on your current closet.</Text>
        </View>

        <Button className="mb-6 rounded-[20px] py-3 bg-white/10 border border-white/10" onPress={() => router.push('/outfits')}>
          <View className="flex-row items-center gap-2">
            <RotateCw size={16} color="white" />
            <Text className="text-white uppercase tracking-[0.2em] font-semibold text-xs">New Suggestions</Text>
          </View>
        </Button>

        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : outfits.length === 0 ? (
          <View className="bg-white/5 border border-white/10 rounded-[24px] p-8 items-center">
            <RotateCw size={40} color="#71717a" />
            <Text className="text-white text-lg font-semibold mt-4">No combos yet</Text>
            <Text className="text-muted-foreground text-center mt-2 text-sm">
              Add items to your closet to generate AI suggestions.
            </Text>
          </View>
        ) : (
          outfits.map((outfit, outfitIndex) => {
            const images = (outfit.items || []).map((item: any) => item.image_url).filter(Boolean);

            return (
              <View key={outfit.id} className="mb-6 bg-white/5 border border-white/10 rounded-[24px] p-4 overflow-hidden">
                {/* Tab Navigation */}
                <View className="flex-row justify-between border-b border-white/10 pb-4 mb-4">
                  <TouchableOpacity 
                    onPress={() => setActiveTab('variation')}
                    className={`flex-1 items-center py-3 ${activeTab === 'variation' ? 'border-b-2 border-white' : ''}`}
                  >
                    <Text className={`text-[11px] font-bold uppercase tracking-[0.2em] ${activeTab === 'variation' ? 'text-white' : 'text-muted-foreground'}`}>
                      VARIATION 1
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setActiveTab('wear')}
                    className={`flex-1 items-center py-3 ${activeTab === 'wear' ? 'border-b-2 border-white' : ''}`}
                  >
                    <Text className={`text-[11px] font-bold uppercase tracking-[0.2em] ${activeTab === 'wear' ? 'text-white' : 'text-muted-foreground'}`}>
                      WEAR TODAY
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setActiveTab('archive')}
                    className={`flex-1 items-center py-3 ${activeTab === 'archive' ? 'border-b-2 border-white' : ''}`}
                  >
                    <Text className={`text-[11px] font-bold uppercase tracking-[0.2em] ${activeTab === 'archive' ? 'text-white' : 'text-muted-foreground'}`}>
                      ARCHIVE LOOK
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Outfit Preview */}
                <View className="mb-4">
                  <StackedPreview images={images.slice(0, 3)} />
                </View>

                {/* Outfit Info */}
                <Text className="text-white text-xl font-bold">{outfit.name || 'Fresh Combo'}</Text>
                <Text className="text-muted-foreground mt-1 text-xs">{outfit.items?.length ? `${outfit.items.length} items • ${outfit.items.map((i: any) => i.category).join(' • ')}` : 'Perfect for your style'}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
