import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Plus, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { StackedPreview } from '../../components/StackedPreview';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

export default function PlannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const weekDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfWeek(new Date()), i));

  useEffect(() => {
    fetchPlans();
  }, [selectedDate, user]);

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
        <View className="mb-6">
          <Text className="text-white text-3xl font-semibold tracking-tight">Smart Combos</Text>
          <Text className="text-muted-foreground mt-2 text-sm leading-6">
            AI-suggested outfits created from your current closet.
          </Text>
        </View>

        <Button className="mb-5 rounded-3xl py-3 bg-white/10 border border-white/10" onPress={() => router.push('/outfits')}>
          <Text className="text-white uppercase tracking-[0.35em] font-semibold text-xs">New Suggestions</Text>
        </Button>

        <View className="space-y-5">
          {loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator color="#7c3aed" />
            </View>
          ) : outfits.length === 0 ? (
            <View className="bg-card border border-white/5 rounded-[40px] p-8 items-center">
              <CalendarIcon size={42} color="#71717a" />
              <Text className="text-white text-xl font-bold mt-6">No suggestions yet</Text>
              <Text className="text-muted-foreground text-center mt-3">
                Create an outfit in the closet to see it here.
              </Text>
            </View>
          ) : (
            outfits.map((outfit) => {
              const images = (outfit.items || []).map((item: any) => item.image_url).filter(Boolean);

              return (
                <TouchableOpacity
                  key={outfit.id}
                  onPress={() => router.push('/outfits')}
                  className="bg-card border border-white/10 rounded-[32px] p-4"
                >
                  <StackedPreview images={images} />
                  <Text className="text-white text-xl font-semibold mt-4">{outfit.name || 'Fresh Combo'}</Text>
                  <Text className="text-muted-foreground mt-2 text-sm">{outfit.items?.length ? `${outfit.items.length} items included` : 'Perfect for your next look.'}</Text>
                  <View className="mt-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">Style</Text>
                      <Text className="text-white font-semibold">Everyday</Text>
                    </View>
                    <ChevronRight size={20} color="#71717a" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
