import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Star, ChevronRight, ArrowUpRight, History } from 'lucide-react-native';
import { Button, Card, Badge } from '../../components/ui';
import { Header } from '../../components/Header';
import { StackedPreview } from '../../components/StackedPreview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ items: 0, outfits: 0, worn: 0 });
  const [recentOutfit, setRecentOutfit] = useState<any>(null);
  const [topItem, setTopItem] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Stats
      const [itemsCount, outfitsCount, logsData] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('outfits').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('wear_logs').select('item_id').eq('user_id', user.id),
      ]);

      const uniqueWornItems = new Set((logsData.data || []).map(l => l.item_id)).size;
      const totalItems = itemsCount.count || 0;
      const wornPercentage = totalItems > 0 ? Math.round((uniqueWornItems / totalItems) * 100) : 0;

      setStats({
        items: totalItems,
        outfits: outfitsCount.count || 0,
        worn: wornPercentage,
      });

      // 2. Fetch Top Item (most worn)
      if (logsData.data && logsData.data.length > 0) {
        const counts = logsData.data.reduce((acc: any, curr) => {
          acc[curr.item_id] = (acc[curr.item_id] || 0) + 1;
          return acc;
        }, {});
        const topItemId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
        const { data: itemData } = await supabase.from('items').select('*').eq('id', topItemId).single();
        setTopItem({ ...itemData, count: counts[topItemId] });
      }

      // 3. Fetch Recent Outfit
      const { data: recentLogs } = await supabase
        .from('wear_logs')
        .select('*, outfits(*)')
        .eq('user_id', user.id)
        .order('worn_at', { ascending: false })
        .limit(1);

      if (recentLogs && recentLogs[0]?.outfits) {
        const outfit = recentLogs[0].outfits;
        const { data: items } = await supabase
          .from('outfit_items')
          .select('items(*)')
          .eq('outfit_id', outfit.id);
        
        setRecentOutfit({
          ...outfit,
          items: (items || []).map(i => i.items).filter(Boolean),
          worn_at: recentLogs[0].worn_at,
        });
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#e08a6d" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroSub}>MORNING, {user?.email?.split('@')[0].toUpperCase() || 'DEVELOPER'}</Text>
          <Text style={styles.heroTitle}>Your wardrobe is</Text>
          <Text style={[styles.heroTitle, styles.heroItalic]}>evolving.</Text>
          
          <View style={styles.heroActions}>
            <Button variant="coral" style={styles.heroBtn} onPress={() => router.push('/canvas')}>
              DESIGN YOUR NEXT OUTFIT
            </Button>
            <Button variant="outline" style={styles.heroBtn} onPress={() => router.push('/closet')}>
              VIEW FULL ARCHIVE
            </Button>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ITEMS</Text>
            <Text style={styles.statValue}>{stats.items}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>OUTFITS</Text>
            <Text style={styles.statValue}>{stats.outfits}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>WORN</Text>
            <Text style={styles.statValue}>{stats.worn}%</Text>
          </View>
        </View>

        {/* Top Item Card */}
        {topItem && (
          <Card style={styles.featuredCard}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredLabelRow}>
                <Text style={styles.featuredLabel}>TOP ITEM THIS MONTH</Text>
                <Star size={16} color="#e08a6d" fill="#e08a6d" />
              </View>
              <Text style={styles.featuredTitle}>{topItem.name.toUpperCase()}</Text>
            </View>
            <Image source={{ uri: topItem.image_url }} style={styles.featuredImage} resizeMode="cover" />
            <View style={styles.featuredFooter}>
              <Text style={styles.featuredMeta}>Worn {topItem.count} times</Text>
              <TouchableOpacity onPress={() => router.push(`/closet`)}>
                <Text style={styles.detailsBtn}>DETAILS</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Daily Curated Section (Visual Placeholder) */}
        <Card style={styles.moodCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1020&auto=format&fit=crop' }} 
            style={styles.moodImage} 
          />
          <View style={styles.moodOverlay}>
            <Text style={styles.moodLabel}>DAILY CURATED</Text>
            <Text style={styles.moodTitle}>Monochromatic Discipline</Text>
            <Text style={styles.moodDesc}>Exploring depth through texture rather than color. Your archive contains 12 items matching this aesthetic.</Text>
            <TouchableOpacity style={styles.moodBtn}>
              <Text style={styles.moodBtnText}>EXPLORE MOOD</Text>
              <Sparkles size={16} color="#ffffff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Palette Distribution */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PALETTE DISTRIBUTION</Text>
        </View>
        <View style={styles.paletteRow}>
          <View style={[styles.paletteColor, { backgroundColor: '#ffffff', flex: 3 }]} />
          <View style={[styles.paletteColor, { backgroundColor: '#1a1a1a', flex: 2 }]} />
          <View style={[styles.paletteColor, { backgroundColor: '#71717a', flex: 1.5 }]} />
          <View style={[styles.paletteColor, { backgroundColor: '#e08a6d', flex: 1 }]} />
        </View>
        <Text style={styles.paletteDesc}>"Neutral core with warm accents."</Text>

        {/* Recent Outfit */}
        {recentOutfit && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECENT OUTFIT</Text>
            </View>
            <Card style={styles.recentCard}>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{recentOutfit.name.toUpperCase()}</Text>
                <Text style={styles.recentMeta}>Logged {new Date(recentOutfit.worn_at).toLocaleDateString()}</Text>
                <View style={styles.badgeRow}>
                  <Badge variant="outline" style={styles.tag}>MINIMAL</Badge>
                  <Badge variant="outline" style={styles.tag}>SHARP</Badge>
                </View>
              </View>
              <View style={styles.recentPreview}>
                <StackedPreview images={recentOutfit.items.map((i: any) => i.image_url)} />
              </View>
            </Card>
          </View>
        )}

        {/* Studio Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>STUDIO ACTIVITY</Text>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#e08a6d' }]} />
            <View>
              <Text style={styles.activityText}>Added "Cashmere Knit Sweater" to Archive</Text>
              <Text style={styles.activityTime}>2 HOURS AGO</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View>
              <Text style={styles.activityText}>Edited "Black Chelsea Boots" tags</Text>
              <Text style={styles.activityTime}>YESTERDAY</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.historyBtn}>
            <Text style={styles.historyBtnText}>VIEW HISTORY</Text>
            <History size={16} color="#71717a" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090909' },
  scrollContent: { paddingBottom: 120 },
  hero: { padding: 24, paddingTop: 40 },
  heroSub: { color: '#e08a6d', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  heroTitle: { color: '#ffffff', fontSize: 36, fontWeight: '700', letterSpacing: -1, lineHeight: 42 },
  heroItalic: { fontStyle: 'italic', color: '#ffffff' },
  heroActions: { marginTop: 24, gap: 12 },
  heroBtn: { width: '100%' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 32, justifyContent: 'space-between' },
  statItem: { flex: 1 },
  statLabel: { color: '#71717a', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  statValue: { color: '#ffffff', fontSize: 32, fontWeight: '300' },
  featuredCard: { marginHorizontal: 24, marginBottom: 40, padding: 0, overflow: 'hidden' },
  featuredHeader: { padding: 20 },
  featuredLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  featuredLabel: { color: '#71717a', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  featuredTitle: { color: '#ffffff', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  featuredImage: { width: '100%', height: 320, backgroundColor: '#141414' },
  featuredFooter: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredMeta: { color: '#71717a', fontSize: 13 },
  detailsBtn: { color: '#e08a6d', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  moodCard: { marginHorizontal: 24, height: 450, overflow: 'hidden', borderWidth: 0 },
  moodImage: { width: '100%', height: '100%', position: 'absolute' },
  moodOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', padding: 24 },
  moodLabel: { color: '#e08a6d', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  moodTitle: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  moodDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  moodBtn: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ffffff', alignSelf: 'flex-start', paddingBottom: 4 },
  moodBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { color: '#71717a', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  paletteRow: { flexDirection: 'row', marginHorizontal: 24, height: 32, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  paletteColor: { height: '100%' },
  paletteDesc: { color: '#71717a', fontSize: 12, fontStyle: 'italic', marginHorizontal: 24, marginBottom: 40 },
  recentSection: { marginBottom: 40 },
  recentCard: { marginHorizontal: 24, flexDirection: 'row', padding: 0, height: 180, overflow: 'hidden' },
  recentInfo: { flex: 1, padding: 20, justifyContent: 'center' },
  recentName: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  recentMeta: { color: '#71717a', fontSize: 12, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  tag: { paddingHorizontal: 6, paddingVertical: 2 },
  recentPreview: { width: 140, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' },
  activitySection: { paddingHorizontal: 24, paddingBottom: 40 },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 16 },
  activityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#27272a', marginTop: 6 },
  activityText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  activityTime: { color: '#71717a', fontSize: 10, fontWeight: '700' },
  historyBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  historyBtnText: { color: '#71717a', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
