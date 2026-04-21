import React, { useState } from 'react';
import { TouchableOpacity, Text, View, TextInput, StyleSheet, TouchableOpacityProps, TextInputProps, ViewProps, TextProps } from 'react-native';

// --- GOOGLE STITCH COLOR TOKENS ---
const colors = {
  background: '#090909',
  foreground: '#ffffff',
  primary: '#e08a6d', // Coral
  primaryForeground: '#090909',
  secondary: '#1a1a1a',
  secondaryForeground: '#ffffff',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  muted: '#141414',
  mutedForeground: '#71717a',
  accent: '#e08a6d',
  accentForeground: '#090909',
  border: 'rgba(255, 255, 255, 0.05)',
  input: '#1a1a1a',
  ring: '#e08a6d',
};

// --- BUTTON ---
interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'coral';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<View, ButtonProps>(
  ({ style, variant = 'default', size = 'default', children, disabled, ...props }, ref) => {
    const isCoral = variant === 'coral' || variant === 'default';
    
    return (
      <TouchableOpacity
        ref={ref as any}
        activeOpacity={0.8}
        style={[
          styles.btnBase,
          styles[`btn_${variant}`],
          styles[`btn_size_${size}`],
          disabled && styles.btnDisabled,
          style,
        ]}
        disabled={disabled}
        {...props}
      >
        {React.Children.map(children, child => {
          if (typeof child === 'string') {
            return (
              <Text style={[
                styles.btnTextBase, 
                styles[`btnText_${variant}`], 
                styles[`btnText_size_${size}`],
                { letterSpacing: 1, fontWeight: '700' }
              ]}>
                {child.toUpperCase()}
              </Text>
            );
          }
          return child;
        })}
      </TouchableOpacity>
    );
  }
);
Button.displayName = 'Button';

// --- CARD ---
export const Card = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref as any} style={[styles.card, style]} {...props} />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref as any} style={[styles.cardHeader, style]} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref as any} style={[styles.cardTitle, style]} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref as any} style={[styles.cardDescription, style]} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref as any} style={[styles.cardContent, style]} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref as any} style={[styles.cardFooter, style]} {...props} />
));
CardFooter.displayName = 'CardFooter';

// --- INPUT ---
export const Input = React.forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <TextInput
        ref={ref}
        style={[styles.input, isFocused && styles.inputFocused, style]}
        placeholderTextColor={colors.mutedForeground}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// --- BADGE ---
interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'coral';
}

export const Badge = React.forwardRef<View, BadgeProps>(
  ({ style, variant = 'default', children, ...props }, ref) => {
    return (
      <View ref={ref as any} style={[styles.badge, styles[`badge_${variant}`], style]} {...props}>
        {React.Children.map(children, child => {
          if (typeof child === 'string') {
            return <Text style={[styles.badgeText, styles[`badgeText_${variant}`]]}>{child.toUpperCase()}</Text>;
          }
          return child;
        })}
      </View>
    );
  }
);
Badge.displayName = 'Badge';

// --- LABEL ---
export const Label = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref as any} style={[styles.label, style]} {...props} />
));
Label.displayName = 'Label';

// --- SEPARATOR ---
export const Separator = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref as any} style={[styles.separator, style]} {...props} />
));
Separator.displayName = 'Separator';

// --- STYLES ---
const styles = StyleSheet.create<any>({
  // Button Styles
  btnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btn_default: {
    backgroundColor: colors.primary,
  },
  btn_coral: {
    backgroundColor: colors.primary,
  },
  btn_destructive: {
    backgroundColor: colors.destructive,
  },
  btn_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btn_secondary: {
    backgroundColor: colors.secondary,
  },
  btn_ghost: {
    backgroundColor: 'transparent',
  },
  btn_link: {
    backgroundColor: 'transparent',
  },
  btn_size_default: {
    height: 48,
    paddingHorizontal: 24,
  },
  btn_size_sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  btn_size_lg: {
    height: 56,
    paddingHorizontal: 32,
  },
  btn_size_icon: {
    height: 48,
    width: 48,
  },
  btnTextBase: {
    fontSize: 14,
    letterSpacing: 1.5,
  },
  btnText_default: {
    color: colors.primaryForeground,
  },
  btnText_coral: {
    color: colors.primaryForeground,
  },
  btnText_destructive: {
    color: colors.destructiveForeground,
  },
  btnText_outline: {
    color: colors.foreground,
  },
  btnText_secondary: {
    color: colors.secondaryForeground,
  },
  btnText_ghost: {
    color: colors.foreground,
  },
  btnText_link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  btnText_size_default: { fontSize: 13 },
  btnText_size_sm: { fontSize: 11 },
  btnText_size_lg: { fontSize: 15 },
  btnText_size_icon: { fontSize: 14 },

  // Card Styles
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#111111',
  },
  cardHeader: {
    padding: 20,
    gap: 4,
  },
  cardTitle: {
    color: colors.foreground,
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  cardDescription: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0,
  },

  // Input Styles
  input: {
    height: 52,
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#161616',
    paddingHorizontal: 16,
    color: colors.foreground,
    fontSize: 15,
  },
  inputFocused: {
    borderColor: colors.ring,
    borderWidth: 1,
  },

  // Badge Styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1a1a1a',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badge_default: {
    backgroundColor: colors.secondary,
  },
  badgeText_default: {
    color: colors.mutedForeground,
  },
  badge_coral: {
    backgroundColor: 'rgba(224, 138, 109, 0.15)',
  },
  badgeText_coral: {
    color: colors.primary,
  },
  badge_secondary: {
    backgroundColor: colors.secondary,
  },
  badgeText_secondary: {
    color: colors.secondaryForeground,
  },
  badge_destructive: {
    backgroundColor: colors.destructive,
  },
  badgeText_destructive: {
    color: colors.destructiveForeground,
  },
  badge_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText_outline: {
    color: colors.foreground,
  },

  // Label Styles
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedForeground,
    marginBottom: 8,
    letterSpacing: 1,
  },

  // Separator Styles
  separator: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginVertical: 24,
  },
});
