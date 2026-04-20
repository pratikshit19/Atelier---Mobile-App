import React from 'react';
import { TouchableOpacity, Text, View, TextInput } from 'react-native';
import { cn } from '../lib/utils';

export const Button = ({ className, variant = 'primary', size = 'default', children, ...props }: any) => {
  const variants: any = {
    primary: 'bg-primary',
    secondary: 'bg-muted',
    outline: 'border border-white/10 bg-transparent',
    ghost: 'bg-transparent',
  };
  
  const sizes: any = {
    default: 'py-2.5 px-4',
    sm: 'py-2 px-3',
    lg: 'py-3 px-5',
    icon: 'p-2.5',
  };

  return (
    <TouchableOpacity 
      className={cn(
        "rounded-xl items-center justify-center flex-row gap-2 active:opacity-80",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export const Card = ({ className, children }: any) => (
  <View className={cn("bg-card border border-white/10 rounded-3xl overflow-hidden", className)}>
    {children}
  </View>
);

export const Input = ({ className, ...props }: any) => (
  <TextInput
    className={cn(
      "bg-card border border-white/10 rounded-3xl px-4 py-3 text-white text-sm",
      className
    )}
    placeholderTextColor="#71717a"
    {...props}
  />
);

export const Badge = ({ className, children }: any) => (
  <View className={cn("rounded-full bg-white/5 px-3 py-1", className)}>
    <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </Text>
  </View>
);
