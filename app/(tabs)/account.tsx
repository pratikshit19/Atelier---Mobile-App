import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  ChevronRight, 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  HelpCircle, 
  Palette, 
  Pencil,
  Moon,
  Layout,
  Banknote,
  LogOut as DeactivateIcon
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Badge, Input, Button, Separator } from '../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <User size={60} color="#52525b" />
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Pencil size={14} color="#090909" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.email?.split('@')[0].toUpperCase() || 'DEVELOPER'}</Text>
          <Text style={styles.userJoined}>Premium Member since Oct 2023</Text>

          <View style={styles.tagRow}>
            <Badge variant="coral">ARCHIVE PRO</Badge>
            <Badge variant="secondary">BETA TESTER</Badge>
          </View>
        </View>

        <Separator />

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {[
            { icon: User, label: 'Account Details', active: true },
            { icon: Palette, label: 'Preferences' },
            { icon: Bell, label: 'Notifications' },
            { icon: Shield, label: 'Security' },
            { icon: HelpCircle, label: 'Support' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.menuItem, item.active && styles.menuItemActive]}
            >
              <item.icon size={20} color={item.active ? '#e08a6d' : '#71717a'} />
              <Text style={[styles.menuLabel, item.active && styles.menuLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Info Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>PROFILE INFORMATION</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DISPLAY NAME</Text>
            <Input value={user?.email?.split('@')[0] || ''} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <Input value={user?.email || ''} keyboardType="email-address" />
          </View>
        </View>

        {/* Interface Preferences */}
        <View style={styles.prefSection}>
          <Text style={styles.sectionHeader}>INTERFACE PREFERENCES</Text>
          
          <View style={styles.prefCard}>
            <View style={styles.prefIconBox}>
              <Moon size={20} color="#e08a6d" />
            </View>
            <View style={styles.prefInfo}>
              <Text style={styles.prefTitle}>Dark Mode</Text>
              <Text style={styles.prefSub}>Always on</Text>
            </View>
            <Switch 
              value={true} 
              trackColor={{ false: '#27272a', true: '#e08a6d' }} 
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity style={styles.prefCard}>
            <View style={styles.prefIconBox}>
              <Layout size={20} color="#e08a6d" />
            </View>
            <View style={styles.prefInfo}>
              <Text style={styles.prefTitle}>Density</Text>
              <Text style={styles.prefSub}>Compact Pro</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.prefCard}>
            <View style={styles.prefIconBox}>
              <Banknote size={20} color="#e08a6d" />
            </View>
            <View style={styles.prefInfo}>
              <Text style={styles.prefTitle}>Studio Currency</Text>
              <Text style={styles.prefSub}>Euro (€) — Used for archive valuation</Text>
            </View>
            <ChevronRight size={18} color="#52525b" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerHeader}>DANGER ZONE</Text>
          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Deactivate Archive</Text>
            <Text style={styles.dangerSub}>Temporarily hide your wardrobe studio from public explore feeds.</Text>
            <Button variant="outline" style={styles.deactivateBtn}>
              DEACTIVATE
            </Button>
          </View>
        </View>

        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.8}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>SIGN OUT</Text>
          <LogOut size={18} color="#ef4444" />
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090909' },
  scrollContent: { paddingBottom: 120 },
  profileSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#111111', borderWidth: 1, borderColor: '#e08a6d', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  editBadge: { position: 'absolute', bottom: -10, right: -10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#e08a6d', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#090909' },
  userName: { color: '#ffffff', fontSize: 32, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 },
  userJoined: { color: '#71717a', fontSize: 13, marginBottom: 20 },
  tagRow: { flexDirection: 'row', gap: 8 },
  menuSection: { paddingHorizontal: 24, gap: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 4, gap: 16 },
  menuItemActive: { backgroundColor: '#111111' },
  menuLabel: { color: '#71717a', fontSize: 14, fontWeight: '600' },
  menuLabelActive: { color: '#e08a6d' },
  formSection: { padding: 24, paddingTop: 40 },
  sectionHeader: { color: '#71717a', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  prefSection: { padding: 24 },
  prefCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#111111', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', marginBottom: 12 },
  prefIconBox: { width: 48, height: 48, borderRadius: 4, backgroundColor: '#090909', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  prefInfo: { flex: 1 },
  prefTitle: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  prefSub: { color: '#71717a', fontSize: 12 },
  dangerSection: { padding: 24, paddingTop: 40 },
  dangerHeader: { color: '#e08a6d', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 24 },
  dangerCard: { padding: 24, backgroundColor: '#111111', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(224, 138, 109, 0.1)' },
  dangerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  dangerSub: { color: '#71717a', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  deactivateBtn: { width: '100%', borderColor: 'rgba(224, 138, 109, 0.3)' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  signOutText: { color: '#ef4444', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
});
