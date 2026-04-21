import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Switch, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { X, Image as ImageIcon, Sparkles, ChevronDown, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, Label } from './ui';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (itemData: any) => void;
  loading?: boolean;
}

export const AddItemModal = ({ visible, onClose, onAdd, loading }: AddItemModalProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tops');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [price, setPrice] = useState('0.00');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [removeBackground, setRemoveBackground] = useState(true);
  const [isWishlist, setIsWishlist] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Image picking failed', error);
    }
  };

  const handleSubmit = () => {
    onAdd({
      name,
      category,
      price: parseFloat(price) || 0,
      brand,
      material,
      removeBackground,
      isWishlist,
      base64: imageBase64,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add New Item</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            {/* Upload Zone */}
            <TouchableOpacity style={styles.uploadZone} onPress={handlePickImage} activeOpacity={0.8}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.iconContainer}>
                    <ImageIcon size={28} color="#a1a1aa" />
                  </View>
                  <Text style={styles.uploadText}>Click to upload image</Text>
                  <Text style={styles.uploadSubtext}>PNG, JPG up to 10MB</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formRow}>
              <View style={styles.formFieldContainer}>
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Black Hoodie"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.formFieldContainer}>
                <Label>Category</Label>
                <TouchableOpacity style={styles.dropdownInput} onPress={() => setIsCategoryOpen(!isCategoryOpen)}>
                  <Text style={styles.inputText}>{category}</Text>
                  <ChevronDown size={16} color="#52525b" style={{ transform: [{ rotate: isCategoryOpen ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>
              </View>
            </View>

            {isCategoryOpen && (
              <View style={styles.dropdownMenu}>
                {['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(cat);
                      setIsCategoryOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, category === cat && styles.dropdownItemTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.formRowThree}>
              <View style={styles.formFieldContainerFlex}>
                <Label>Price ($)</Label>
                <Input
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={styles.formFieldContainerFlex}>
                <Label>Brand</Label>
                <Input
                  placeholder="e.g. Nike"
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>
              <View style={styles.formFieldContainerFlex}>
                <Label>Material</Label>
                <Input
                  placeholder="e.g. Cotton"
                  value={material}
                  onChangeText={setMaterial}
                />
              </View>
            </View>

            {/* AI Background Removal */}
            <View style={styles.aiCard}>
              <View style={styles.aiContent}>
                <Sparkles size={20} color="#818cf8" />
                <View style={styles.aiTextContainer}>
                  <Text style={styles.aiTitle}>AI Background Removal</Text>
                  <Text style={styles.aiSubtitle}>CREATE A STUDIO-CLEAN LOOK</Text>
                </View>
              </View>
              <Switch
                value={removeBackground}
                onValueChange={setRemoveBackground}
                trackColor={{ false: '#3f3f46', true: '#ffffff' }}
                thumbColor={removeBackground ? '#18181b' : '#a1a1aa'}
              />
            </View>

            {/* Wishlist Checkbox */}
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsWishlist(!isWishlist)} activeOpacity={0.8}>
              <View style={[styles.checkbox, isWishlist && styles.checkboxActive]}>
                {isWishlist && <Check size={14} color="#18181b" />}
              </View>
              <Text style={styles.checkboxLabel}>Mark as Wishlist Item</Text>
            </TouchableOpacity>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <Button variant="ghost" onPress={onClose}>
                Cancel
              </Button>
              <Button
                variant="default"
                onPress={handleSubmit}
                disabled={!imageBase64 || loading}
                style={styles.addBtn}
              >
                {loading ? 'Adding...' : 'Add to Closet'}
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#09090b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  uploadZone: {
    height: 180,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#27272a',
    borderStyle: 'dashed',
    backgroundColor: '#18181c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  uploadSubtext: {
    color: '#71717a',
    fontSize: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  formRowThree: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  formFieldContainer: {
    flex: 1,
  },
  formFieldContainerFlex: {
    flex: 1,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    backgroundColor: '#09090b',
    height: 40,
  },
  inputText: {
    color: '#fff',
    fontSize: 14,
  },
  dropdownMenu: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dropdownItemText: {
    color: '#a1a1aa',
    fontSize: 15,
  },
  dropdownItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  aiCard: {
    backgroundColor: '#1a1625',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.1)',
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiTextContainer: {},
  aiTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiSubtitle: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#52525b',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addBtn: {
    minWidth: 140,
  },
});
