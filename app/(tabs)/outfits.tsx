import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, Layers, Heart, Plus } from 'lucide-react-native';
import { StackedPreview } from '../../components/StackedPreview';
import { Header } from '../../components/Header';
import { Button, Card, Badge } from '../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

      if (outfitsError) throw outfitsError;

      const outfitIds = (outfitsData || []).map((o) => o.id);
      if (outfitIds.length === 0) {
        setOutfits([]);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('outfit_items')
        .select('outfit_id, items(*)')
        .in('outfit_id', outfitIds);

      if (itemsError) throw itemsError;

      const itemsByOutfit = (itemsData || []).reduce((acc: any, curr) => {
        if (!acc[curr.outfit_id]) acc[curr.outfit_id] = [];
        if (curr.items) acc[curr.outfit_id].push(curr.items);
        return acc;
      }, {});

      const enrichedOutfits = (outfitsData || []).map((o) => ({
        ...o,
        items: itemsByOutfit[o.id] || [],
      }));

      setOutfits(enrichedOutfits);
    } catch (error) {
      console.error('Fetch outfits error:', error);
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

  const featuredOutfits = outfits.slice(0, 4);
  const recentSaves = outfits.slice(4);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e08a6d" />}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SAVED OUTFITS</Text>
          <Text style={styles.subtitle}>Your personal archive of curated looks and styling concepts.</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#e08a6d" />
          </View>
        ) : (
          <View>
            {/* Featured Outfits */}
            {featuredOutfits.map((outfit, index) => {
              const images = outfit.items.map((i: any) => i.image_url);
              
              // Variations in card styles based on index for "curated" look
              if (index === 0) {
                return (
                  <Card key={outfit.id} style={styles.heroCard}>
                    <View style={styles.heroRow}>
                      <View style={styles.heroMain}>
                        <Image source={{ uri: images[0] }} style={styles.heroImage} />
                        <View style={styles.heroOverlay}>
                          <Badge variant="coral" style={styles.heroBadge}>MOST WORN</Badge>
                          <Text style={styles.heroTitle}>{outfit.name.toUpperCase()}</Text>
                          <Button size="sm" variant="coral" style={{ alignSelf: 'flex-start', height: 32 }}>
                            DETAILS
                          </Button>
                        </View>
                      </View>
                      <View style={styles.heroSidebar}>
                        <Image source={{ uri: images[1] || images[0] }} style={styles.sidebarImg} />
                        <Image source={{ uri: images[2] || images[0] }} style={styles.sidebarImg} />
                      </View>
                    </View>
                  </Card>
                );
              }

              return (
                <TouchableOpacity key={outfit.id} onPress={() => router.push('/planner')} activeOpacity={0.9}>
                  <Card style={styles.standardCard}>
                    <View style={styles.standardHeader}>
                      <Badge variant="outline" style={{ alignSelf: 'flex-start' }}>CASUAL</Badge>
                    </View>
                    <View style={styles.standardPreview}>
                      <Image 
                        source={{ uri: images[0] }} 
                        style={styles.standardImage} 
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.standardFooter}>
                      <View>
                        <Text style={styles.outfitTitle}>{outfit.name.toUpperCase()}</Text>
                        <Text style={styles.outfitMeta}>Weekend essentials for city exploration.</Text>
                      </View>
                      <View style={styles.footerBottom}>
                        <Heart size={20} color="#e08a6d" fill="#e08a6d" />
                        <Text style={styles.lastWorn}>LAST WORN: 2D AGO</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}

            {/* Create New Placeholder */}
            <TouchableOpacity style={styles.newOutfitPlaceholder}>
              <View style={styles.plusBox}>
                <Plus size={24} color="#52525b" />
              </View>
              <Text style={styles.newOutfitTitle}>NEW OUTFIT</Text>
              <Text style={styles.newOutfitSub}>Create a new curated look.</Text>
            </TouchableOpacity>

            {/* Recent Saves Section */}
            {recentSaves.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>RECENT SAVES</Text>
                  <TouchableOpacity>
                    <Text style={styles.viewAll}>VIEW ALL</Text>
                  </TouchableOpacity>
                </View>

                {recentSaves.map((outfit) => (
                  <TouchableOpacity key={outfit.id} style={styles.recentItem} activeOpacity={0.7}>
                    <View style={styles.recentThumb}>
                      <Image source={{ uri: outfit.items[0]?.image_url }} style={styles.thumbImg} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentTitle}>{outfit.name.toUpperCase()}</Text>
                      <Text style={styles.recentMeta}>Grey Suit + Azure Tie</Text>
                    </View>
                    <ChevronRight size={18} color="#52525b" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {outfits.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Layers size={36} color="#52525b" />
                </View>
                <Text style={styles.emptyTitle}>NO OUTFITS YET</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first outfit in the Studio to see it here.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090909' },
  scrollContent: { paddingBottom: 120 },
  titleContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  title: { color: '#ffffff', fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: '#71717a', fontSize: 13, marginTop: 12, lineHeight: 20 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  heroCard: { marginHorizontal: 20, marginBottom: 24, height: 260, overflow: 'hidden', padding: 0 },
  heroRow: { flex: 1, flexDirection: 'row' },
  heroMain: { flex: 1.5, position: 'relative' },
  heroImage: { width: '100%', height: '100%', opacity: 0.8 },
  heroOverlay: { position: 'absolute', bottom: 20, left: 20, right: 20, gap: 8 },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2 },
  heroTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  heroSidebar: { flex: 1, gap: 1 },
  sidebarImg: { flex: 1, backgroundColor: '#141414' },
  standardCard: { marginHorizontal: 20, marginBottom: 24, padding: 0, overflow: 'hidden' },
  standardHeader: { padding: 16, position: 'absolute', zIndex: 10, top: 0, left: 0 },
  standardPreview: { width: '100%', height: 300, backgroundColor: '#000' },
  standardImage: { width: '100%', height: '100%', opacity: 0.9 },
  standardFooter: { padding: 20, gap: 16 },
  outfitTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  outfitMeta: { color: '#71717a', fontSize: 13, marginTop: 4 },
  footerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  lastWorn: { color: '#71717a', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  newOutfitPlaceholder: { marginHorizontal: 20, height: 220, backgroundColor: '#111111', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  plusBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  newOutfitTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  newOutfitSub: { color: '#71717a', fontSize: 12, marginTop: 4 },
  recentSection: { paddingHorizontal: 20, marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  sectionTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  viewAll: { color: '#e08a6d', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  recentItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  recentThumb: { width: 56, height: 56, backgroundColor: '#141414', borderRadius: 4, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  recentInfo: { flex: 1, gap: 2 },
  recentTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  recentMeta: { color: '#71717a', fontSize: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120 },
  emptyIconBox: { height: 80, width: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  emptySubtitle: { color: '#71717a', fontSize: 14, textAlign: 'center', maxWidth: 250, lineHeight: 20 },
});
