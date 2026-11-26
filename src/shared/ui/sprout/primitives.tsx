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
import { elevation, fontFamily, interaction, radius, space, stroke, touchTarget, typography } from '@/theme/tokens';
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
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
}

export const SproutCheck: React.FC<SproutCheckProps> = ({ checked, disabled = false, onPress, accessibilityLabel, size = space[6] }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="checkbox"
    aria-checked={checked}
    disabled={disabled}
    accessibilityState={{ checked, disabled }}
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.checkTarget, pressed && styles.checkPressed]}
  >
    <View style={[styles.check, { width: size, height: size, borderRadius: size / 2 }, checked && styles.checkDone]}>
      {checked && <Check size={size * 0.55} color={colors.onPrimary} strokeWidth={stroke.strong} />}
    </View>
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
  sun: { bg: s.sunSoft, fg: colors.secondary },
  rose: { bg: s.roseSoft, fg: s.rose },
  teal: { bg: s.tealSoft, fg: s.teal },
  grape: { bg: s.grapeSoft, fg: s.grape },
  forest: { bg: s.forest, fg: colors.surfaceContainerLowest },
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
  style?: StyleProp<ViewStyle>;
}

export const SunButton: React.FC<SunButtonProps> = ({ title, onPress, loading, disabled, style }) => (
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
          <ArrowLeft size={22} color={light ? colors.surfaceContainerLowest : s.ink} strokeWidth={2.4} />
        </Pressable>
      )}
    </View>
    <AppText style={[styles.topTitle, light && { color: colors.surfaceContainerLowest }]}>
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
            <AppText style={[styles.pillTabText, active && styles.pillTabTextActive]}>
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
      <AppText style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>
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

export const sproutShadow = elevation.level1;

const styles = StyleSheet.create({
  softCard: { borderRadius: radius.lg, padding: space[3], borderWidth: stroke.hairline, borderColor: colors.border, },
  pressedSoft: { transform: [{ scale: 0.985 }], opacity: 0.96 },
  hero: {
    minHeight: 112,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: space[5],
    paddingTop: space[6],
    paddingBottom: space[4],
  },
  checkTarget: { minWidth: touchTarget.min, minHeight: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  checkPressed: { opacity: interaction.pressedOpacity },
  check: {
    borderWidth: stroke.selected,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: s.forest, borderColor: s.forest },
  tile: { alignItems: 'center', justifyContent: 'center' },
  sun: { minHeight: touchTarget.min, paddingVertical: space[3], borderRadius: radius.pill, backgroundColor: s.sun, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], paddingHorizontal: space[4], },
  sunPressed: { transform: [{ scale: 0.98 }], backgroundColor: s.sunDeep },
  sunDisabled: { opacity: 0.55 },
  sunText: { fontFamily: fontFamily.bold, fontSize: typography.bodyMedium.fontSize, color: s.ink, },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTarget.comfortable,
    paddingHorizontal: space[1],
  },
  topSide: { width: 48, justifyContent: 'center' },
  backBtn: { width: touchTarget.min, height: touchTarget.min, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: typography.headlineSmall.fontSize,
    color: s.ink,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space[2],
  },
  sectionLeft: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: space[2], flexShrink: 1, },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: typography.titleMedium.fontSize, color: s.ink, },
  sectionHint: { fontFamily: fontFamily.medium, ...typography.labelMedium, color: s.inkMuted },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: space[1], minHeight: touchTarget.min },
  sectionActionText: { fontFamily: fontFamily.medium, ...typography.labelLarge, color: s.ink },
  pillTabs: { flexDirection: 'row', backgroundColor: s.creamDeep, borderRadius: radius.md, padding: space[0.5], gap: space[0.5], },
  pillTab: { flex: 1, minHeight: touchTarget.min, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[2], paddingVertical: space[1], },
  pillTabActive: { backgroundColor: s.forest },
  pillTabText: { textAlign: 'center', flexShrink: 1, fontFamily: fontFamily.semibold, ...typography.labelLarge, color: s.inkMuted },
  pillTabTextActive: { color: colors.surfaceContainerLowest, fontFamily: fontFamily.bold },
  choice: { flexGrow: 1, flexBasis: 120, minWidth: 0, minHeight: touchTarget.min, padding: space[2], borderRadius: radius.md, backgroundColor: s.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], borderWidth: stroke.hairline, borderColor: colors.border, },
  choiceSelected: { backgroundColor: s.leafSoft, borderColor: s.forest },
  choiceLabel: { textAlign: 'center', flexShrink: 1, fontFamily: fontFamily.medium, ...typography.labelMedium, color: s.inkMuted, },
  choiceLabelSelected: { fontFamily: fontFamily.bold, color: s.forest },
  fieldLabel: { fontFamily: fontFamily.semibold, fontSize: typography.labelMedium.fontSize, lineHeight: typography.labelMedium.lineHeight, color: s.ink },
});
