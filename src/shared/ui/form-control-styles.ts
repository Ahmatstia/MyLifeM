import { colors } from '@/theme/colors';
import { touchTarget, typography, fontFamily, radius, space } from '@/theme/tokens';

export const formInputBase = Object.assign(Object.create(null), {
  minHeight: touchTarget.min,
  minWidth: 0,
  paddingHorizontal: space[3],
  paddingVertical: space[1],
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.outlineVariant,
  backgroundColor: colors.surfaceContainerLowest,
  color: colors.onSurface,
  fontFamily: fontFamily.regular,
  fontSize: typography.bodyMedium.fontSize,
});

export const formInputCompact = Object.assign(Object.create(null), {
  minHeight: touchTarget.min,
  minWidth: 0,
  paddingHorizontal: space[2],
  paddingVertical: space[1],
  borderRadius: radius.md,
  color: colors.onSurface,
  fontFamily: fontFamily.regular,
  fontSize: typography.bodyMedium.fontSize,
});

export const formTextArea = Object.assign(Object.create(null), {
  minHeight: 88,
  textAlignVertical: 'top' as const,
});

export const formLabelSpacing = Object.assign(Object.create(null), {
  marginTop: space[3],
  marginBottom: space[2],
});
