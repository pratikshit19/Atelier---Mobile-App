import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Cloud, ArrowRight, Trash2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [topItems, setTopItems] = useState<any[]>([]);
  const username = user?.email?.split('@')[0] || 'User';

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

      setItemCount(itemsCount || 0);
      setOutfitCount(outfitsCount || 0);
      setTopItems((topItemsData as any[]) || []);
    };

    loadStats();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 pt-8 pb-10">
        {/* Welcome Header */}
        <View className="mb-8">
          <Text className="text-white text-5xl font-bold mb-2">Welcome,</Text>
          <Text className="text-white text-4xl font-bold">{username}</Text>
          <Text className="text-muted-foreground text-sm mt-2">Portfolio summary of your digital collection.</Text>
        </View>

        {/* Weather Card */}
        <View className="bg-white/5 border border-white/10 rounded-[24px] p-4 mb-6 flex-row items-center gap-4">
          <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
            <Cloud size={24} color="#a1a1aa" />
          </View>
          <View>
            <Text className="text-muted-foreground text-xs uppercase tracking-[0.15em]">Chhindwara, India</Text>
            <Text className="text-white text-2xl font-bold">37°C <Text className="text-muted-foreground font-normal">Sunny</Text></Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/closet')}
            className="flex-1 bg-white/5 border border-white/10 rounded-[20px] p-4"
          >
            <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] mb-2">Total Value</Text>
            <Text className="text-white text-2xl font-bold">$650</Text>
            <Text className="text-muted-foreground text-[10px] mt-2">VALUE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/closet')}
            className="flex-1 bg-white/5 border border-white/10 rounded-[20px] p-4"
          >
            <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] mb-2">Avg. CPW</Text>
            <Text className="text-white text-2xl font-bold">$46.43</Text>
            <Text className="text-muted-foreground text-[10px] mt-2">CPW</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/closet')}
            className="flex-1 bg-white/5 border border-white/10 rounded-[20px] p-4"
          >
            <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] mb-2">Active Items</Text>
            <Text className="text-white text-2xl font-bold">{itemCount}</Text>
            <Text className="text-muted-foreground text-[10px] mt-2">Items</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/closet')}
            className="flex-1 bg-white/5 border border-white/10 rounded-[20px] p-4"
          >
            <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] mb-2">Top ROI</Text>
            <Text className="text-white text-lg font-bold">{topItems[0]?.name || 'N/A'}</Text>
            <Text className="text-muted-foreground text-[10px] mt-2">$0.00</Text>
          </TouchableOpacity>
        </View>

        {/* Most Worn Pieces */}
        {topItems.length > 0 ? (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="text-white text-2xl font-bold">✨ Most Worn Pieces</Text>
            </View>
            
            <View className="bg-white/5 border border-white/10 rounded-[24px] p-4">
              {topItems.slice(0, 3).map((item, index) => (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => router.push(`/canvas?item_id=${item.id}`)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-3 ${index < topItems.length - 1 ? 'pb-4 mb-4 border-b border-white/10' : ''}`}
                >
                  <Image
                    source={{ uri: item.image_url }}
                    className="h-16 w-16 rounded-[12px]"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-white font-bold">{item.name}</Text>
                    <Text className="text-muted-foreground text-xs mt-1">{item.category || 'Item'} • 4 wears</Text>
                  </View>
                  <Text className="text-white font-bold">$0.00</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Daily Recommendation */}
        <TouchableOpacity 
          onPress={() => router.push('/planner')}
          activeOpacity={0.8}
          className="rounded-[24px] bg-white/10 border border-white/10 p-6 overflow-hidden"
        >
          <Text className="text-white text-2xl font-bold mb-3">Daily Recommendation</Text>
          <Text className="text-muted-foreground text-sm leading-6 mb-6">
            Based on your current portfolio, we recommend rotating your Blue Jeans collection.
          </Text>
          <View className="bg-white rounded-[16px] py-3 px-4 flex-row items-center justify-center">
            <Text className="text-black font-bold text-sm">Style Today's Look</Text>
            <ArrowRight size={16} color="black" className="ml-2" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
