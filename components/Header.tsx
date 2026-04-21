import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LayoutGrid, Search, User } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton}>
        <LayoutGrid size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <Text style={styles.title}>WARDROBE STUDIO</Text>
      
      <TouchableOpacity style={styles.profileButton}>
        <View style={styles.avatarContainer}>
          <User size={20} color="#a1a1aa" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#090909',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
});
