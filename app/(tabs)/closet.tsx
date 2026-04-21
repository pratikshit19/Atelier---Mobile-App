import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Filter, Shirt, Sparkles } from 'lucide-react-native';
import { AddItemModal } from '../../components/AddItemModal';
import { Button, Input, Badge } from '../../components/ui';
import { Header } from '../../components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ClosetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const handleAddItem = async (itemData: any) => {
    if (!user || !itemData.base64) return;
    setIsAdding(true);

    try {
      const fileName = `${user.id}/${Date.now()}.png`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('closet')
        .upload(fileName, decode(itemData.base64), {
          contentType: 'image/png',
        });

      if (storageError) throw storageError;

      const { data } = supabase.storage.from('closet').getPublicUrl(fileName);
      const publicUrl = data?.publicUrl || '';

      const { error: dbError } = await supabase.from('items').insert({
        user_id: user.id,
        name: itemData.name || 'Untitled Item',
        category: itemData.category,
        image_url: publicUrl,
        price: itemData.price,
      });

      if (dbError) throw dbError;
      
      setIsAddModalVisible(false);
      fetchItems();
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>YOUR CLOSET</Text>
        <Text style={styles.subtitle}>{items.length} items curated since March 2024</Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color="#71717a" style={styles.searchIcon} />
            <Input
              placeholder="Search archive..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {['All Pieces', 'Outerwear', 'Knitwear', 'Tops', 'Bottoms', 'Footwear'].map((cat) => {
            const isActive = category === cat || (cat === 'All Pieces' && !category);
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat === 'All Pieces' ? null : cat)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#e08a6d" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e08a6d" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => router.push(`/canvas?item_id=${item.id}`)}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemCategory}>{item.category?.toUpperCase() || 'ESSENTIALS'}</Text>
                <Text style={styles.itemName}>{item.name.toUpperCase()}</Text>
                <Text style={styles.itemMeta}>Charcoal Grey · Size L</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Shirt size={32} color="#52525b" />
              </View>
              <Text style={styles.emptyText}>Your closet is empty.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsAddModalVisible(true)}
        activeOpacity={0.9}
      >
        <Plus size={24} color="#090909" />
      </TouchableOpacity>

      <AddItemModal 
        visible={isAddModalVisible} 
        onClose={() => setIsAddModalVisible(false)} 
        onAdd={handleAddItem}
        loading={isAdding}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090909' },
  headerContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: '#71717a', fontSize: 13, marginTop: 8 },
  searchRow: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 24, alignItems: 'center' },
  searchInputWrapper: { flex: 1, position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 14, zIndex: 10 },
  searchInput: { paddingLeft: 42, borderRadius: 4, height: 48, backgroundColor: '#161616', borderWidth: 0 },
  filterScroll: { marginBottom: 8 },
  filterContent: { paddingRight: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterChipActive: { borderBottomColor: '#e08a6d' },
  filterChipText: { color: '#71717a', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  filterChipTextActive: { color: '#ffffff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gridRow: { paddingHorizontal: 20, gap: 16 },
  gridContent: { paddingBottom: 120 },
  itemCard: { flex: 1, marginBottom: 32 },
  imageContainer: { backgroundColor: '#141414', borderRadius: 0, aspectRatio: 0.75, overflow: 'hidden', marginBottom: 12 },
  image: { width: '100%', height: '100%' },
  itemInfo: { paddingHorizontal: 0, gap: 4 },
  itemCategory: { color: '#e08a6d', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  itemName: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  itemMeta: { color: '#71717a', fontSize: 12 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { color: '#71717a', fontSize: 14 },
  fab: { position: 'absolute', bottom: 100, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#e08a6d', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
});
