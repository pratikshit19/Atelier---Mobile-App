import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
  PanResponder,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Palette, Save, Trash2, Plus } from 'lucide-react-native';
import { Button, Input } from '../../components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StudioItem {
  id: string;
  real_item_id: string;
  image_url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface ClosetItem {
  id: string;
  image_url: string;
  name: string;
}

const DraggableItem = ({
  item,
  onRemove,
  onUpdate,
}: {
  item: StudioItem;
  onRemove: () => void;
  onUpdate: (updates: Partial<StudioItem>) => void;
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gestureState) => {
        onUpdate({
          x: item.x + gestureState.dx,
          y: item.y + gestureState.dy,
        });
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.itemContainer,
        {
          transform: [
            { translateX: Animated.add(pan.x, item.x) },
            { translateY: Animated.add(pan.y, item.y) },
            { scale: item.scale || 1 },
            { rotate: `${item.rotation || 0}deg` },
          ],
        },
      ]}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
        >
          <Trash2 size={14} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function CanvasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as { item_id?: string };
  const itemId = params.item_id;
  const [items, setItems] = useState<StudioItem[]>([]);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const drawerY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    fetchClosetItems();
  }, [user]);

  useEffect(() => {
    if (!itemId || !user) return;

    const loadSelectedItem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error || !data) return;
      addItem(data as ClosetItem);
    };

    loadSelectedItem();
  }, [itemId, user]);

  const fetchClosetItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    setClosetItems((data as ClosetItem[]) || []);
  };

  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
    Animated.spring(drawerY, {
      toValue: open ? SCREEN_HEIGHT * 0.2 : SCREEN_HEIGHT,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const addItem = (item: ClosetItem) => {
    if (items.some((existing) => existing.image_url === item.image_url)) {
      return;
    }

    const newItem: StudioItem = {
      id: Math.random().toString(36).substring(2, 11),
      real_item_id: item.id,
      image_url: item.image_url,
      x: SCREEN_WIDTH / 4 + (Math.random() * 40 - 20),
      y: SCREEN_HEIGHT / 4 + (Math.random() * 40 - 20),
      scale: 1,
      rotation: 0,
    };
    setItems((prev) => [...prev, newItem]);
    toggleDrawer(false);
  };

  const updateItem = (id: string, updates: Partial<StudioItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!user) return;
    if (items.length === 0) {
      alert('Add items to the board before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: outfitData, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: outfitName.trim() || 'Studio Design',
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      const outfitItems = items.map(item => ({
        outfit_id: outfitData.id,
        item_id: item.real_item_id,
      }));

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (itemsError) throw itemsError;

      router.push('/outfits');
    } catch (error) {
      console.error(error);
      alert('Failed to save the outfit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette size={24} color="#7c3aed" />
          <Input
            style={styles.headerTitleInput}
            value={outfitName}
            onChangeText={setOutfitName}
            placeholder="Name your outfit..."
            placeholderTextColor="#71717a"
          />
        </View>
        <Button 
          size="sm" 
          onPress={handleSave} 
          disabled={isSaving}
          style={styles.saveButton}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#18181b" />
          ) : (
            <>
              <Save size={16} color="#18181b" />
              <Text style={styles.saveText}>Save</Text>
            </>
          )}
        </Button>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvas}>
        <View style={styles.grid} pointerEvents="none" />

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Plus size={32} color="#7c3aed" />
            </View>
            <Text style={styles.emptyTitle}>Workspace Empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Add Items" below to begin designing.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onRemove={() => removeItem(item.id)}
              onUpdate={(updates) => updateItem(item.id, updates)}
            />
          ))
        )}
      </View>

      {/* Bottom Floating Button */}
      {!isDrawerOpen && (
        <View
          style={[
            styles.addButtonContainer,
            { bottom: insets.bottom + 104 },
          ]}
        >
          <Button
            size="lg"
            onPress={() => toggleDrawer(true)}
            style={styles.addButton}
          >
            <Plus size={20} color="#18181b" />
            <Text style={styles.addButtonText}>Add Items</Text>
          </Button>
        </View>
      )}

      {/* Backdrop */}
      {isDrawerOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => toggleDrawer(false)}
          style={styles.backdrop}
        />
      )}

      {/* Selection Drawer */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateY: drawerY }] }]}
      >
        <View style={styles.drawerHandle} />
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Select from Closet</Text>
          <Button variant="ghost" size="sm" onPress={() => toggleDrawer(false)}>
            Close
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.drawerGrid}>
          {closetItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => addItem(item)}
              style={styles.closetItem}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.closetImage}
                resizeMode="cover"
              />
              <Text style={styles.closetItemName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060c',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#05060c',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitleInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 20,
    fontWeight: '700',
    height: 40,
    color: '#fff',
    paddingHorizontal: 0,
  },
  saveButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    gap: 6,
  },
  saveText: {
    color: '#18181b',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  canvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    borderStyle: 'dashed',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    opacity: 0.5,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#a1a1aa',
    textAlign: 'center',
    fontSize: 12,
  },
  itemContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 160,
    height: 160,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 32,
    borderRadius: 32,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  addButtonText: {
    color: '#05060c',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#111115',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 100,
  },
  drawerHandle: {
    width: 48,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  drawerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 80,
  },
  closetItem: {
    width: '47%',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 8,
  },
  closetImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 12,
  },
  closetItemName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingBottom: 4,
    textAlign: 'center',
  },
});
