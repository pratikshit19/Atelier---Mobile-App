import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Trash2 } from 'lucide-react-native';
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
      let query = supabase.from('items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
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
          name: 'New Item',
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

  const deleteItem = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      // Delete from storage
      if (item.image_url) {
        const fileName = item.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('closet').remove([`${user?.id}/${fileName}`]);
        }
      }

      // Delete from database
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) throw error;

      // Update local state
      setItems(items.filter((i) => i.id !== itemId));
    } catch (error: any) {
      alert('Failed to delete item: ' + error.message);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-white text-4xl font-bold mb-1">Your Closet</Text>
        <Text className="text-muted-foreground text-sm mb-6">Refining your personal collection.</Text>

        {/* Add Item Link */}
        <TouchableOpacity onPress={pickImage} className="rounded-lg py-3 px-4 mb-6 border border-white/10 bg-white/5">
          <View className="flex-row items-center gap-3">
            <Plus size={18} color="#a1a1aa" />
            <Text className="text-white/60 text-sm font-semibold">Add Item</Text>
          </View>
        </TouchableOpacity>

        {/* Search */}
        <View className="relative mb-4">
          <View className="absolute left-3 top-0 z-10 h-full justify-center">
            <Search size={16} color="#71717a" />
          </View>
          <Input
            className="pl-10 h-10 text-sm bg-white/5 border border-white/10 rounded-lg"
            placeholder="Search collection..."
            placeholderTextColor="#71717a"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat === 'All' ? null : cat)}
              className={`mr-2 rounded-full px-3 py-1.5 border ${category === cat || (cat === 'All' && !category) ? 'border-white bg-white/10' : 'border-white/10 bg-white/5'}`}>
              <Text className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${category === cat || (cat === 'All' && !category) ? 'text-white' : 'text-muted-foreground'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ffffff" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ paddingHorizontal: 24, gap: 12 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          scrollEnabled={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1 mb-3 relative"
              onPress={() => router.push(`/canvas?item_id=${item.id}`)}
              activeOpacity={0.7}
            >
              <View className="bg-white/5 border border-white/10 rounded-[18px] overflow-hidden aspect-square">
                <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => deleteItem(item.id)}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-2 border border-white/20"
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
              <View className="mt-2">
                <Text className="text-white font-semibold text-sm truncate">{item.name}</Text>
                <Text className="text-muted-foreground text-[9px] uppercase tracking-[0.15em] mt-0.5">{item.category}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-muted-foreground text-sm">Your closet is empty.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
