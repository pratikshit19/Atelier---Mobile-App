import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronRight, Plus, Sparkles, X, Check, Trash2 } from 'lucide-react-native';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '../../components/ui';
import { StackedPreview } from '../../components/StackedPreview';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannedOutfits, setPlannedOutfits] = useState<any[]>([]);
  const [allOutfits, setAllOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    fetchPlans();
  }, [selectedDate, user]);

  useEffect(() => {
    if (isModalVisible) {
      fetchAllOutfits();
    }
  }, [isModalVisible]);

  const fetchPlans = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = addDays(dayStart, 1);

      const { data: plansData, error: plansError } = await supabase
        .from('wear_logs')
        .select('*, outfits(*)')
        .eq('user_id', user.id)
        .gte('worn_at', dayStart.toISOString())
        .lt('worn_at', dayEnd.toISOString());

      if (plansError) throw plansError;

      const outfitIds = (plansData || []).map(plan => plan.outfit_id).filter(Boolean);

      if (outfitIds.length > 0) {
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

        const enrichedOutfits = (plansData || []).map(plan => ({
          ...plan.outfits,
          logId: plan.id,
          items: itemsByOutfit[plan.outfit_id] || [],
        })).filter(o => o.id);

        setPlannedOutfits(enrichedOutfits);
      } else {
        setPlannedOutfits([]);
      }
    } catch (error) {
      console.error('Fetch plans error:', error);
      setPlannedOutfits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('wear_logs')
        .delete()
        .eq('id', logId);
      
      if (error) throw error;
      fetchPlans();
    } catch (error) {
      console.error('Delete plan error:', error);
    }
  };

  const fetchAllOutfits = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const outfitIds = (data || []).map(o => o.id);
      if (outfitIds.length > 0) {
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

        setAllOutfits((data || []).map(o => ({
          ...o,
          items: itemsByOutfit[o.id] || [],
        })));
      } else {
        setAllOutfits([]);
      }
    } catch (error) {
      console.error('Fetch all outfits error:', error);
    }
  };

  const handlePlanOutfit = async (outfit: any) => {
    if (!user) return;
    setIsPlanning(true);
    try {
      // Satisfy the not-null constraint on item_id by providing the first item in the outfit
      const firstItemId = outfit.items?.[0]?.id;
      
      if (!firstItemId) {
        alert('This outfit has no items. Add items to the outfit before planning it.');
        setIsPlanning(false);
        return;
      }

      const { error } = await supabase
        .from('wear_logs')
        .insert({
          user_id: user.id,
          outfit_id: outfit.id,
          item_id: firstItemId,
          worn_at: selectedDate.toISOString(),
        });

      if (error) throw error;
      setIsModalVisible(false);
      fetchPlans();
    } catch (error) {
      console.error('Planning error:', error);
      alert('Failed to plan outfit. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Planner</Text>
          <Text style={styles.subtitle}>Curating your look for the week.</Text>
        </View>
        <TouchableOpacity 
          style={styles.plusButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.datePickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datePickerContent}>
          {dates.map((date) => {
            const active = isSameDay(date, selectedDate);
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                style={[styles.dateChip, active && styles.dateChipActive]}
              >
                <Text style={[styles.dateDay, active && styles.dateDayActive]}>
                  {format(date, 'EEE')}
                </Text>
                <Text style={[styles.dateNumber, active && styles.dateNumberActive]}>
                  {format(date, 'd')}
                </Text>
                {active && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isSameDay(selectedDate, new Date()) ? "Today's Outfit" : format(selectedDate, 'MMMM d')}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : plannedOutfits.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Plus size={32} color="#a1a1aa" />
            </View>
            <CardHeader>
              <CardTitle style={{ textAlign: 'center' }}>No Outfit Planned</CardTitle>
              <CardDescription style={{ textAlign: 'center' }}>
                You haven't scheduled a look for this day yet.
              </CardDescription>
            </CardHeader>
            <View style={styles.emptyActions}>
              <Button 
                variant="default" 
                size="lg" 
                onPress={() => setIsModalVisible(true)}
                style={styles.actionBtn}
              >
                Browse Outfits
              </Button>
            </View>
          </Card>
        ) : (
          plannedOutfits.map((outfit) => {
            const images = (outfit.items || []).map((item: any) => item.image_url).filter(Boolean);
            return (
              <View key={outfit.logId}>
                <Card style={styles.outfitCard}>
                  <View style={styles.cardImageContainer}>
                    <StackedPreview images={images} />
                    <TouchableOpacity 
                      style={styles.deleteBtn}
                      onPress={() => handleDeletePlan(outfit.logId)}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <CardHeader style={styles.cardFooter}>
                    <View style={styles.cardTextContainer}>
                      <CardTitle>{outfit.name || 'Daily Look'}</CardTitle>
                      <CardDescription>{outfit.items?.length || 0} items included</CardDescription>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/outfits')}>
                      <ChevronRight size={20} color="#52525b" />
                    </TouchableOpacity>
                  </CardHeader>
                </Card>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Outfit Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an Outfit</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {allOutfits.length === 0 ? (
                <View style={styles.emptyModalState}>
                  <Sparkles size={48} color="#3f3f46" />
                  <Text style={styles.emptyModalText}>No outfits found in your collection.</Text>
                  <Button variant="secondary" onPress={() => {
                    setIsModalVisible(false);
                    router.push('/canvas');
                  }}>Create your first outfit</Button>
                </View>
              ) : (
                allOutfits.map((outfit) => {
                  const images = (outfit.items || []).map((item: any) => item.image_url).filter(Boolean);
                  return (
                    <TouchableOpacity
                      key={outfit.id}
                      style={styles.modalItem}
                      onPress={() => handlePlanOutfit(outfit)}
                      disabled={isPlanning}
                    >
                      <View style={styles.modalItemPreview}>
                        <StackedPreview images={images} />
                      </View>
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemName}>{outfit.name || 'Fresh Combo'}</Text>
                        <Text style={styles.modalItemMeta}>{outfit.items?.length || 0} items</Text>
                      </View>
                      <View style={styles.modalItemAction}>
                        <Check size={20} color="#4f46e5" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05060c' },
  header: { paddingHorizontal: 24, paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: '#a1a1aa', fontSize: 14, marginTop: 4 },
  plusButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
  datePickerContainer: { marginBottom: 24 },
  datePickerContent: { paddingHorizontal: 24, gap: 12 },
  dateChip: { width: 60, height: 80, borderRadius: 20, backgroundColor: '#111115', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dateChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  dateDay: { color: '#71717a', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  dateDayActive: { color: '#05060c' },
  dateNumber: { color: '#fff', fontSize: 18, fontWeight: '700' },
  dateNumberActive: { color: '#05060c' },
  activeDot: { position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: 2, backgroundColor: '#05060c' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loadingContainer: { paddingVertical: 100, alignItems: 'center' },
  emptyCard: { padding: 32, alignItems: 'center', backgroundColor: '#111115' },
  emptyIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#3f3f46' },
  emptyActions: { width: '100%', gap: 12, marginTop: 12 },
  actionBtn: { width: '100%' },
  outfitCard: { overflow: 'hidden' },
  cardImageContainer: { height: 160, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  cardTextContainer: { flex: 1 },
  deleteBtn: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#09090b', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: SCREEN_HEIGHT * 0.8, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  closeBtn: { padding: 4 },
  modalScroll: { flex: 1 },
  modalScrollContent: { paddingBottom: 40 },
  modalItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#111115', borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalItemPreview: { width: 80, height: 80, borderRadius: 16, overflow: 'hidden', backgroundColor: '#05060c' },
  modalItemInfo: { flex: 1, marginLeft: 16 },
  modalItemName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  modalItemMeta: { color: '#71717a', fontSize: 12 },
  modalItemAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(79, 70, 229, 0.1)', alignItems: 'center', justifyContent: 'center' },
  emptyModalState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 16 },
  emptyModalText: { color: '#a1a1aa', fontSize: 16, textAlign: 'center' },
});
