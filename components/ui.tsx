import React from 'react';
import { TouchableOpacity, Text, View, TextInput } from 'react-native';
import { cn } from '../lib/utils'; // I'll create this

export const Button = ({ className, variant = 'primary', size = 'default', children, ...props }: any) => {
  const variants: any = {
    primary: 'bg-primary',
    secondary: 'bg-muted',
    outline: 'border border-white/10 bg-transparent',
    ghost: 'bg-transparent',
  };
  
  const sizes: any = {
    default: 'py-3 px-6',
    sm: 'py-2 px-4',
    lg: 'py-4 px-8',
    icon: 'p-3',
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
  <View className={cn("bg-card border border-white/5 rounded-xl overflow-hidden shadow-xl", className)}>
    {children}
  </View>
);

export const Input = ({ className, ...props }: any) => (
  <TextInput
    className={cn(
      "bg-card border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-primary",
      className
    )}
    placeholderTextColor="#71717a"
    {...props}
  />
);
