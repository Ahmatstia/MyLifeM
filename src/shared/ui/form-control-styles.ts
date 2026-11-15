import { colors } from '@/theme/colors';
import { fontFamily, radius, space } from '@/theme/tokens';

export const formInputBase = {
  minHeight: 48,
  paddingHorizontal: space[3],
  paddingVertical: space[2],
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.outlineVariant,
  backgroundColor: colors.surfaceContainerLowest,
  color: colors.onSurface,
  fontFamily: fontFamily.regular,
  fontSize: 14,
};

export const formInputCompact = {
  minHeight: 44,
  paddingHorizontal: space[2],
  paddingVertical: space[1],
  borderRadius: radius.md,
  color: colors.onSurface,
  fontFamily: fontFamily.regular,
  fontSize: 14,
};

export const formTextArea = {
  minHeight: 88,
  textAlignVertical: 'top' as const,
};

export const formLabelSpacing = {
  marginTop: space[3],
  marginBottom: space[2],
};
