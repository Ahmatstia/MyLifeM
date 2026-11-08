import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Check, ArrowRight, ArrowLeft, type LucideIcon } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { fontFamily, space } from '@/theme/tokens';
import { AppText } from '../app-text';

const s = colors.sprout;

/* ------------------------------------------------------------------ */
/* SoftCard – cream "pillow" surface with warm shadow                   */
/* ------------------------------------------------------------------ */
export interface SoftCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'card' | 'leaf' | 'sun' | 'cream';
  onPress?: () => void;
  accessibilityLabel?: string;
}

const toneBg = {
  card: s.card,
  leaf: s.leafSoft,
  sun: s.sunSoft,
  cream: s.creamDeep,
} as const;

export const SoftCard: React.FC<SoftCardProps> = ({
  children,
  style,
  tone = 'card',
  onPress,
  accessibilityLabel,
}) => {
  const base = [styles.softCard, { backgroundColor: toneBg[tone] }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && styles.pressedSoft]}
    >
      {children}
    </Pressable>
  );
};

/* ------------------------------------------------------------------ */
/* HeroBlob – forest green wavy banner ("1 Target Aktif")              */
/* ------------------------------------------------------------------ */
export interface HeroBlobProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const HeroBlob: React.FC<HeroBlobProps> = ({ children, onPress, style, accessibilityLabel }) => {
  const content = (
    <>
      <Svg
        viewBox="0 0 340 120"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M24 20 C68 4 114 18 156 18 H314 C330 18 340 28 340 44 V96 C340 110 330 120 314 120 H26 C10 120 0 110 0 94 V44 C0 30 10 24 24 20 Z"
          fill={s.forest}
        />
        <Path
          d="M220 120 C250 96 290 92 340 98 V120 Z"
          fill={s.forestSoft}
          opacity={0.6}
        />
      </Svg>
      <View style={styles.heroContent}>{children}</View>
    </>
  );

  if (!onPress) return <View style={[styles.hero, style]}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.hero, style, pressed && styles.pressedSoft]}
    >
      {content}
    </Pressable>
  );
};

/* ------------------------------------------------------------------ */
/* SproutCheck – outlined ring that fills forest green when done        */
/* ------------------------------------------------------------------ */
export interface SproutCheckProps {
  checked: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
}

export const SproutCheck: React.FC<SproutCheckProps> = ({ checked, onPress, accessibilityLabel, size = 28 }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="checkbox"
    aria-checked={checked}
    accessibilityState={{ checked }}
    accessibilityLabel={accessibilityLabel}
    hitSlop={8}
    style={[
      styles.check,
      { width: size, height: size, borderRadius: size / 2 },
      checked && styles.checkDone,
    ]}
  >
    {checked && <Check size={size * 0.55} color="#FFFFFF" strokeWidth={3} />}
  </Pressable>
);

/* ------------------------------------------------------------------ */
/* IconTile – soft squircle holding an icon                            */
/* ------------------------------------------------------------------ */
export interface IconTileProps {
  icon: LucideIcon;
  tone?: 'leaf' | 'sun' | 'rose' | 'teal' | 'grape' | 'forest' | 'cream';
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const tileTone = {
  leaf: { bg: s.leafSoft, fg: s.forest },
  sun: { bg: s.sunSoft, fg: '#9A6A00' },
  rose: { bg: s.roseSoft, fg: s.rose },
  teal: { bg: s.tealSoft, fg: s.teal },
  grape: { bg: s.grapeSoft, fg: s.grape },
  forest: { bg: s.forest, fg: '#FFFFFF' },
  cream: { bg: s.creamDeep, fg: s.ink },
} as const;

export const IconTile: React.FC<IconTileProps> = ({ icon: Icon, tone = 'leaf', size = 44, onPress, accessibilityLabel }) => {
  const t = tileTone[tone];
  const box = [styles.tile, { width: size, height: size, borderRadius: size * 0.36, backgroundColor: t.bg }];
  const glyph = <Icon size={size * 0.46} color={t.fg} strokeWidth={2.4} />;
  if (!onPress) return <View style={box}>{glyph}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [box, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      {glyph}
    </Pressable>
  );
};

/* ------------------------------------------------------------------ */
/* SunButton – the big yellow pill CTA ("Simpan →")                    */
/* ------------------------------------------------------------------ */
export interface SunButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  withArrow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SunButton: React.FC<SunButtonProps> = ({ title, onPress, loading, disabled, withArrow = true, style }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
    style={({ pressed }) => [
      styles.sun,
      (disabled || loading) && styles.sunDisabled,
      pressed && styles.sunPressed,
      style,
    ]}
  >
    <AppText style={styles.sunText}>{loading ? 'Menyimpan…' : title}</AppText>
    {withArrow && !loading && <ArrowRight size={20} color={s.ink} strokeWidth={2.6} />}
  </Pressable>
);

/* ------------------------------------------------------------------ */
/* SproutTopBar – back arrow + centered title                          */
/* ------------------------------------------------------------------ */
export interface SproutTopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  light?: boolean;
}

export const SproutTopBar: React.FC<SproutTopBarProps> = ({ title, onBack, right, light }) => (
  <View style={styles.topBar}>
    <View style={styles.topSide}>
      {onBack && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={10}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={light ? '#FFFFFF' : s.ink} strokeWidth={2.4} />
        </Pressable>
      )}
    </View>
    <AppText style={[styles.topTitle, light && { color: '#FFFFFF' }]} numberOfLines={1}>
      {title}
    </AppText>
    <View style={[styles.topSide, { alignItems: 'flex-end' }]}>{right}</View>
  </View>
);

/* ------------------------------------------------------------------ */
/* SectionTitle – "Hari Ini            Selengkapnya →"                 */
/* ------------------------------------------------------------------ */
export interface SectionTitleProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  hint?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, actionLabel, onAction, hint }) => (
  <View style={styles.section}>
    <View style={styles.sectionLeft}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {hint ? <AppText style={styles.sectionHint}>{hint}</AppText> : null}
    </View>
    {actionLabel && onAction && (
      <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8} style={styles.sectionAction}>
        <AppText style={styles.sectionActionText}>{actionLabel}</AppText>
        <ArrowRight size={14} color={s.ink} strokeWidth={2.4} />
      </Pressable>
    )}
  </View>
);

/* ------------------------------------------------------------------ */
/* PillTabs – "Minggu | Bulan | Tahun" segmented pills                 */
/* ------------------------------------------------------------------ */
export interface PillTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function PillTabs<T extends string>({ options, value, onChange, style }: PillTabsProps<T>) {
  return (
    <View style={[styles.pillTabs, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.pillTab, active && styles.pillTabActive]}
          >
            <AppText style={[styles.pillTabText, active && styles.pillTabTextActive]} numberOfLines={1}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ChoiceTile – category tile with icon + label (Belajar, Kerja…)      */
/* ------------------------------------------------------------------ */
export interface ChoiceTileProps {
  label: string;
  icon: LucideIcon;
  tone?: IconTileProps['tone'];
  selected: boolean;
  onPress: () => void;
}

export const ChoiceTile: React.FC<ChoiceTileProps> = ({ label, icon: Icon, tone = 'leaf', selected, onPress }) => {
  const t = tileTone[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <Icon size={22} color={selected ? s.forest : t.fg} strokeWidth={2.3} />
      <AppText style={[styles.choiceLabel, selected && styles.choiceLabelSelected]} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
};

/* ------------------------------------------------------------------ */
/* FieldRow – rounded input-like row ("🕐 Atur waktu (opsional)  >")   */
/* ------------------------------------------------------------------ */
export interface FieldLabelProps {
  children: React.ReactNode;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ children }) => (
  <AppText style={styles.fieldLabel}>{children}</AppText>
);

const shadow = {
  shadowColor: '#8A7A50',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 14,
  elevation: 3,
};

export const sproutShadow = shadow;

const styles = StyleSheet.create({
  softCard: {
    borderRadius: 24,
    padding: space[4],
    borderWidth: 1,
    borderColor: '#F1EADA',
    ...shadow,
  },
  pressedSoft: { transform: [{ scale: 0.985 }], opacity: 0.96 },
  hero: {
    minHeight: 112,
    borderRadius: 26,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: space[5],
    paddingTop: space[6],
    paddingBottom: space[4],
  },
  check: {
    borderWidth: 2,
    borderColor: '#B9C49F',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: s.forest, borderColor: s.forest },
  tile: { alignItems: 'center', justifyContent: 'center' },
  sun: {
    height: 58,
    borderRadius: 29,
    backgroundColor: s.sun,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    paddingHorizontal: space[6],
    shadowColor: '#C9971A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  sunPressed: { transform: [{ scale: 0.98 }], backgroundColor: s.sunDeep },
  sunDisabled: { opacity: 0.55 },
  sunText: { fontFamily: fontFamily.bold, fontSize: 17, color: s.ink },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: space[1],
  },
  topSide: { width: 48, justifyContent: 'center' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: s.ink,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[2],
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], flexShrink: 1 },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: 18, color: s.ink },
  sectionHint: { fontFamily: fontFamily.medium, fontSize: 12, color: s.inkMuted },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32 },
  sectionActionText: { fontFamily: fontFamily.medium, fontSize: 13, color: s.ink },
  pillTabs: {
    flexDirection: 'row',
    backgroundColor: s.creamDeep,
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  pillTab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
  },
  pillTabActive: { backgroundColor: s.forest },
  pillTabText: { fontFamily: fontFamily.semibold, fontSize: 13, color: s.inkMuted },
  pillTabTextActive: { color: '#FFFFFF', fontFamily: fontFamily.bold },
  choice: {
    width: 76,
    height: 84,
    borderRadius: 22,
    backgroundColor: s.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#F1EADA',
    ...shadow,
  },
  choiceSelected: { backgroundColor: s.leafSoft, borderColor: s.forest },
  choiceLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: s.inkMuted },
  choiceLabelSelected: { fontFamily: fontFamily.bold, color: s.forest },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: s.ink,
    marginTop: space[2],
    marginBottom: space[1],
  },
});
