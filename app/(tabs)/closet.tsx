import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, Shirt } from 'lucide-react-native';
import { Input, Button } from '../../components/ui';
import * as ImagePicker from 'expo-image-picker';

export default function ClosetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user) return;
    try {
      let query = supabase.from('items').select('*').order('created_at', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const base64 = result.assets[0].base64;
        const fileName = `${user?.id}/${Date.now()}.png`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from('closet')
          .upload(fileName, decode(base64), {
            contentType: 'image/png',
          });

        if (storageError) throw storageError;

        const { data } = supabase.storage.from('closet').getPublicUrl(fileName);
        const publicUrl = data?.publicUrl || '';

        const { error: dbError } = await supabase.from('items').insert({
          user_id: user?.id,
          name: 'New Mobile Item',
          category: 'Tops',
          image_url: publicUrl,
        });

        if (dbError) throw dbError;
        fetchItems();
      }
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <View className="px-6 pt-8 pb-4">
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-white text-2xl font-semibold tracking-tight">Your Closet</Text>
            <Text className="text-muted-foreground mt-2 text-sm leading-6">
              Refining your personal collection.
            </Text>
          </View>
          <Button size="icon" className="rounded-full h-11 w-11" onPress={pickImage}>
            <Plus size={20} color="white" />
          </Button>
        </View>

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 relative">
            <View className="absolute left-3 top-3 z-10">
              <Search size={18} color="#71717a" />
            </View>
            <Input
              className="pl-10 h-11"
              placeholder="Search collection..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11"
            onPress={() => setCategory(null)}
          >
            <Filter size={18} color="#71717a" />
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          {['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat === 'All' ? null : cat)}
              className={`mr-3 rounded-full px-4 py-2 border ${category === cat || (cat === 'All' && !category) ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}>
              <Text className={`text-[10px] uppercase tracking-[0.3em] font-semibold ${category === cat || (cat === 'All' && !category) ? 'text-white' : 'text-muted-foreground'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ paddingHorizontal: 20, gap: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1 mb-4"
              onPress={() => router.push(`/canvas?item_id=${item.id}`)}
            >
              <View className="bg-card border border-white/5 rounded-3xl overflow-hidden aspect-square">
                <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
              </View>
              <View className="mt-3 px-1">
                <Text className="text-white font-bold text-sm truncate">{item.name}</Text>
                <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.35em] mt-1">{item.category}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Shirt size={48} color="#27272a" />
              <Text className="text-muted-foreground text-sm mt-4">Your closet is empty.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
