import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, Shirt } from 'lucide-react-native';
import { Input, Button } from '../../components/ui';
import * as ImagePicker from 'expo-image-picker';

export default function ClosetScreen() {
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
  }, [category]);

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
        const uri = result.assets[0].uri;
        const fileName = `${user?.id}/${Date.now()}.png`;

        // 1. Call AI Extraction Bridge
        console.log('Calling AI Extraction...');
        const { data: aiData, error: aiError } = await supabase.functions.invoke('extract-garment', {
          body: { image_base64: base64, category: 'Tops' }
        });

        // 2. Upload to Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('closet')
          .upload(fileName, decode(base64), {
            contentType: 'image/png'
          });

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage.from('closet').getPublicUrl(fileName);

        // 3. Save to Database
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

  // Helper to decode base64 for storage upload
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <View className="px-6 pt-8 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-3xl font-bold tracking-tight">Closet</Text>
            <Text className="text-muted-foreground text-xs uppercase tracking-widest">Your Wardrobe</Text>
          </View>
          <Button size="icon" className="rounded-full h-12 w-12" onPress={pickImage}>
            <Plus size={24} color="white" />
          </Button>
        </View>

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 relative">
            <View className="absolute left-3 top-3 z-10">
              <Search size={18} color="#71717a" />
            </View>
            <Input 
              className="pl-10 h-11"
              placeholder="Search items..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Button variant="secondary" size="icon" className="h-11 w-11">
            <Filter size={18} color="#71717a" />
          </Button>
        </View>

        <View className="flex-row gap-2 mb-2">
          {['All', 'Tops', 'Bottoms', 'Shoes'].map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setCategory(cat === 'All' ? null : cat)}
              className={`px-4 py-2 rounded-full border ${category === cat || (cat === 'All' && !category) ? 'bg-primary border-primary' : 'bg-transparent border-white/10'}`}
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${category === cat || (cat === 'All' && !category) ? 'text-white' : 'text-muted-foreground'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ paddingHorizontal: 20, gap: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-1 mb-4">
              <View className="bg-card border border-white/5 rounded-2xl overflow-hidden aspect-[3/4]">
                <Image source={{ uri: item.image_url }} className="w-full h-full" resizeMode="cover" />
              </View>
              <View className="mt-2 px-1">
                <Text className="text-white font-bold text-xs truncate">{item.name}</Text>
                <Text className="text-muted-foreground text-[10px] uppercase tracking-widest">{item.category}</Text>
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
