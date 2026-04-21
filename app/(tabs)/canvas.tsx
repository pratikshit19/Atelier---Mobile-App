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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { Palette, Save, Trash2, Plus } from 'lucide-react-native';
import { Button } from '../../components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StudioItem {
  id: string;
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
}: {
  item: StudioItem;
  onRemove: () => void;
  onUpdate: (updates: Partial<StudioItem>) => void;
}) => {
  return (
    <View
      style={[
        styles.itemContainer,
        { transform: [{ translateX: item.x }, { translateY: item.y }] },
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
    </View>
  );
};

export default function CanvasScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as { item_id?: string };
  const itemId = params.item_id;
  const [items, setItems] = useState<StudioItem[]>([]);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette size={24} color="#7c3aed" />
          <Text style={styles.headerTitle}>Studio</Text>
        </View>
        <Button size="sm" onPress={async () => {
          if (items.length === 0) {
            alert('Add items to the board before saving.');
            return;
          }

          try {
            await AsyncStorage.setItem('@atelier_saved_canvas', JSON.stringify({ savedAt: Date.now(), items }));
            alert('Board saved locally. You can continue designing or reopen this screen later.');
          } catch (error) {
            console.error(error);
            alert('Failed to save the board.');
          }
        }}>
          <Save size={16} color="white" />
          <Text style={styles.saveText}>Save</Text>
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
              Tap "Add Items" below to begin.
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => toggleDrawer(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Items</Text>
          </TouchableOpacity>
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
          <TouchableOpacity onPress={() => toggleDrawer(false)}>
            <Text style={styles.drawerClose}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.drawerGrid}>
          {closetItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => addItem(item)}
              style={styles.closetItem}
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
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 8,
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
    borderWidth: 0.5,
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
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#71717a',
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
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 14,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
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
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12,
  },
  drawerClose: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 8,
  },
  closetImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  closetItemName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});
