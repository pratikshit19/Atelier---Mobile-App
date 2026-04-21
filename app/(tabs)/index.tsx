import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Shirt, Palette, Calendar, Sun, ArrowRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [todayPlan, setTodayPlan] = useState<any | null>(null);
  const username = user?.email?.split('@')[0] || 'Pratikshit';

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      const { count: itemsCount } = await supabase
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: outfitsCount } = await supabase
        .from('outfits')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: topItemsData } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      let todayPlans: any[] = [];
      try {
        const response = await supabase
          .from('wear_logs')
          .select('*, outfits(*)')
          .gte('worn_at', todayStart.toISOString())
          .lt('worn_at', tomorrowStart.toISOString())
          .eq('user_id', user.id)
          .order('worn_at', { ascending: false })
          .limit(1);

        if (response.error) {
          console.warn('wear_logs query failed:', response.error.message);
        } else {
          todayPlans = response.data || [];
        }
      } catch (error) {
        console.warn('wear_logs request failed:', error);
      }

      setItemCount(itemsCount || 0);
      setOutfitCount(outfitsCount || 0);
      setTopItems((topItemsData as any[]) || []);
      setTodayPlan(todayPlans?.[0] ?? null);
    };

    loadStats();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-[#05060c]">
      <ScrollView className="px-6 pt-8 pb-10">
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-3xl bg-white/10 items-center justify-center">
              <Text className="text-white text-base font-bold">A</Text>
            </View>
            <View>
              <Text className="text-muted-foreground uppercase text-[10px] tracking-[0.3em]">Welcome back</Text>
              <Text className="text-white text-2xl font-semibold tracking-tight">{username}</Text>
            </View>
          </View>
          <View className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
            <Text className="text-white font-bold uppercase">{username?.[0] || 'P'}</Text>
          </View>
        </View>

        <View className="bg-white/5 rounded-[32px] border border-white/10 p-5 mb-6 shadow-sm">
          <Text className="text-muted-foreground uppercase text-[10px] tracking-[0.3em] mb-3">Studio Summary</Text>
          <Text className="text-white text-3xl font-semibold leading-tight">Design your next outfit with confidence.</Text>
          <Text className="text-muted-foreground mt-3 text-sm leading-6">
            Your wardrobe, recommendations, and most-worn pieces are all in one place.
          </Text>
          <View className="mt-5 flex-row flex-wrap justify-between gap-3">
            <View className="flex-1 min-w-[45%] rounded-3xl bg-[#111827] p-4">
              <Text className="text-muted-foreground uppercase text-[10px] tracking-[0.3em] mb-2">Items</Text>
              <Text className="text-white text-2xl font-semibold">{itemCount}</Text>
            </View>
            <View className="flex-1 min-w-[45%] rounded-3xl bg-[#111827] p-4">
              <Text className="text-muted-foreground uppercase text-[10px] tracking-[0.3em] mb-2">Outfits</Text>
              <Text className="text-white text-2xl font-semibold">{outfitCount}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between gap-3 mb-6">
          <View className="flex-1 min-w-[48%] rounded-[28px] bg-[#111827] p-4 border border-white/10">
            <Text className="text-muted-foreground uppercase text-[10px] tracking-[0.3em] mb-2">Top Item</Text>
            <Text className="text-white text-xl font-semibold">{topItems[0]?.name || 'No items yet'}</Text>
          </View>
          <View className="flex-1 min-w-[48%] rounded-[28px] bg-[#111827] p-4 border border-white/10">
            <Text className="text-muted-foreground uppercase text-[10px] tracking-[0.3em] mb-2">Last Worn</Text>
            <Text className="text-white text-xl font-semibold">{todayPlan?.outfits?.name || 'No plan today'}</Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-xl font-semibold">Most Worn Pieces</Text>
            <TouchableOpacity onPress={() => router.push('/closet')}>
              <Text className="text-primary uppercase text-[10px] tracking-[0.3em] font-semibold">View all</Text>
            </TouchableOpacity>
          </View>

          {topItems.length > 0 ? (
            topItems.map((item) => (
              <View key={item.id} className="bg-white/5 rounded-[32px] border border-white/5 p-4 mb-3 flex-row items-center gap-4 shadow-lg">
                <Image
                  source={{ uri: item.image_url }}
                  className="h-20 w-20 rounded-3xl"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">{item.name || 'Untitled Item'}</Text>
                  <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.35em] mt-1">{item.category || 'Category'}</Text>
                </View>
                <View className="items-end justify-center">
                  <Text className="text-primary font-bold">{item.price ? `$${item.price}` : '$0.00'}</Text>
                  <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.35em] mt-1">3 Wears</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white/5 rounded-[32px] border border-white/5 p-6 items-center shadow-lg">
              <Text className="text-muted-foreground text-sm">No worn pieces yet. Add items to your closet to populate this list.</Text>
            </View>
          )}
        </View>

        <View className="rounded-[32px] bg-card p-5 shadow-sm border border-white/10">
          <Text className="text-white text-2xl font-semibold mb-3">Daily Recommendation</Text>
          <Text className="text-muted-foreground leading-6 mb-5">
            Based on your collection, we recommend rotating your Purple Blazer look.
          </Text>
          <TouchableOpacity onPress={() => router.push('/planner')} className="bg-white rounded-3xl py-3 items-center justify-center">
            <View className="flex-row items-center gap-2">
              <Text className="text-[#27272a] font-semibold uppercase tracking-[0.3em]">Style Today</Text>
              <ArrowRight size={16} color="#27272a" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
