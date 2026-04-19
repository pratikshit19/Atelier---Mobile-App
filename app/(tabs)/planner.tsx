import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar as CalendarIcon, Plus, ChevronRight, MapPin, Clock } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

export default function PlannerScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannedOutfits, setPlannedOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const weekDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfWeek(new Date()), i));

  useEffect(() => {
    fetchPlans();
  }, [selectedDate]);

  const fetchPlans = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('planned_outfits')
      .select('*, outfits(*)')
      .eq('date', format(selectedDate, 'yyyy-MM-dd'))
      .order('created_at', { ascending: false });
    
    setPlannedOutfits(data || []);
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      {/* Header */}
      <View className="px-6 pt-8 pb-4">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-3xl font-bold tracking-tight">Planner</Text>
            <Text className="text-muted-foreground text-xs uppercase tracking-widest">Your Schedule</Text>
          </View>
          <Button size="icon" className="rounded-full h-12 w-12">
            <Plus size={24} color="white" />
          </Button>
        </View>

        {/* Date Strip */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-grow-0"
        >
          {weekDays.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                className={`items-center justify-center w-14 h-20 rounded-2xl mr-3 ${isSelected ? 'bg-primary' : 'bg-card border border-white/5'}`}
              >
                <Text className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {format(date, 'EEE')}
                </Text>
                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-white/90'}`}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Plans Feed */}
      <ScrollView className="flex-1 px-6 pt-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-white font-bold uppercase tracking-widest text-[10px]">
            {format(selectedDate, 'MMMM do, yyyy')}
          </Text>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-[8px] font-bold uppercase">{plannedOutfits.length} Plans</Text>
          </View>
        </View>

        {plannedOutfits.length === 0 ? (
          <View className="items-center justify-center py-20 opacity-30">
            <CalendarIcon size={48} color="#71717a" />
            <Text className="text-white text-center mt-4 font-bold">No outfits planned</Text>
            <Text className="text-muted-foreground text-center text-xs mt-1">Tap + to schedule a look for this day.</Text>
          </View>
        ) : (
          plannedOutfits.map((plan) => (
            <TouchableOpacity key={plan.id} className="bg-card border border-white/5 rounded-3xl p-4 mb-4 flex-row gap-4">
              <View className="w-24 h-24 bg-muted rounded-2xl overflow-hidden">
                <Image source={{ uri: plan.outfits?.preview_image }} className="w-full h-full" resizeMode="cover" />
              </View>
              <View className="flex-1 justify-center">
                <Text className="text-white font-bold text-lg mb-1">{plan.outfits?.name || 'Unnamed Outfit'}</Text>
                
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1">
                    <Clock size={12} color="#71717a" />
                    <Text className="text-muted-foreground text-[10px] uppercase font-bold">Morning</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MapPin size={12} color="#71717a" />
                    <Text className="text-muted-foreground text-[10px] uppercase font-bold">Office</Text>
                  </View>
                </View>
                
                <View className="mt-3 bg-white/5 self-start px-3 py-1 rounded-full">
                  <Text className="text-primary text-[8px] font-bold uppercase">Business Casual</Text>
                </View>
              </View>
              <View className="justify-center">
                <ChevronRight size={20} color="#27272a" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
