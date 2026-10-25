import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Pencil, Trash2, Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space, fontFamily } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { Banner } from '@/shared/ui/banner';
import { useCategories } from '../hooks/use-categories';

export interface CategoryManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  visible,
  onClose,
  onSelectCategory,
}) => {
  const { categories, isLoading, error, refresh, addCategory, editCategory, removeCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setErrorMessage('Nama kategori tidak boleh kosong.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    const result = await addCategory(newCategoryName.trim());
    setIsSubmitting(false);

    if (result.success) {
      setNewCategoryName('');
    } else {
      setErrorMessage(result.message || 'Gagal membuat kategori.');
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setErrorMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    const result = await editCategory(editingId, editingName.trim());
    setIsSubmitting(false);

    if (result.success) {
      setEditingId(null);
      setEditingName('');
    } else {
      setErrorMessage(result.message || 'Gagal mengubah kategori.');
    }
  };

  const handleDelete = (id: string, name: string, targetCount: number) => {
    if (targetCount > 0) {
      Alert.alert(
        'Kategori Digunakan',
        `Kategori "${name}" sedang digunakan oleh ${targetCount} target dan tidak dapat dihapus. Silakan pindahkan target ke kategori lain terlebih dahulu.`,
        [{ text: 'Mengerti' }]
      );
      return;
    }

    Alert.alert(
      'Hapus Kategori',
      `Apakah kamu yakin ingin menghapus kategori "${name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const result = await removeCategory(id);
            if (!result.success) {
              Alert.alert('Gagal', result.message || 'Gagal menghapus kategori.');
            }
          },
        },
      ]
    );
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Kelola Kategori Target"
      subtitle="Label pengelompokan untuk target pengembangan dirimu"
    >
      {error && <Banner variant="error" message={error} actionText="Coba lagi" onActionPress={refresh} />}
      {isLoading && <ActivityIndicator color={colors.primary} />}
      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorBox}>
          <AppText variant="bodySmall" color="onErrorContainer">
            {errorMessage}
          </AppText>
        </View>
      )}

      {/* Input Tambah Kategori */}
      <View style={styles.addCategoryBox}>
        <AppText variant="labelLarge">Kategori baru</AppText>
        <TextInput
          accessibilityLabel="Nama kategori baru"
          value={newCategoryName}
          onChangeText={(text) => {
            setNewCategoryName(text);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Nama kategori baru (cth: Belajar)..."
          placeholderTextColor={colors.onSurfaceSubtle}
          style={styles.textInput}
        />
        <Button
          title="Tambah"
          onPress={handleAddCategory}
          variant="filled"
          size="standard"
          loading={isSubmitting}
          leftIcon={<Plus size={16} color={colors.onPrimary} />}
          style={styles.addButton}
        />
      </View>

      {/* List Kategori */}
      <AppText variant="labelLarge" style={styles.listTitle}>
        Daftar Kategori ({categories.length})
      </AppText>

      {!isLoading && !error && categories.length === 0 ? (
        <View style={styles.emptyCard}>
          <AppText variant="bodyMedium" color="onSurfaceSubtle" align="center">
            Belum ada kategori. Buat kategori pertamamu di atas.
          </AppText>
        </View>
      ) : (
        <View style={styles.categoryList}>
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <View key={cat.id} style={styles.editRow}>
                  <TextInput
                    accessibilityLabel="Ubah nama kategori"
                    value={editingName}
                    onChangeText={setEditingName}
                    autoFocus
                    style={styles.editInput}
                  />
                  <Pressable
                    onPress={handleSaveEdit}
                    accessibilityRole="button"
                    accessibilityLabel="Simpan nama kategori"
                    style={styles.actionIconButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Check size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => setEditingId(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Batalkan perubahan kategori"
                    style={styles.actionIconButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={18} color={colors.onSurfaceVariant} />
                  </Pressable>
                </View>
              );
            }

            return (
              <View key={cat.id} style={styles.categoryCard}>
                <Pressable
                  disabled={!onSelectCategory}
                  onPress={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.id);
                      onClose();
                    }
                  }}
                  style={styles.categoryTextCol}
                >
                  <AppText variant="titleMedium">{cat.name}</AppText>
                  <View style={styles.targetCountBadge}>
                    <AppText variant="labelSmall" color="onSurfaceVariant">
                      {cat.targetCount} target
                    </AppText>
                  </View>
                </Pressable>

                <View style={styles.actionButtonsCol}>
                  <Pressable
                    onPress={() => startEdit(cat.id, cat.name)}
                    accessibilityRole="button"
                    accessibilityLabel={'Ubah kategori ' + cat.name}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.actionIconButton}
                  >
                    <Pencil size={16} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(cat.id, cat.name, cat.targetCount)}
                    accessibilityRole="button"
                    accessibilityLabel={'Hapus kategori ' + cat.name}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.actionIconButton}
                  >
                    <Trash2 size={16} color={cat.targetCount > 0 ? colors.outline : colors.error} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.lg,
    padding: space[3],
    marginBottom: space[3],
  },
  addCategoryBox: {
    gap: space[2],
    marginBottom: space[4],
  },
  textInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    color: colors.onSurface,
    paddingHorizontal: space[4],
    minHeight: 56,
    paddingVertical: space[3],
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  addButton: {
    minWidth: 100,
  },
  listTitle: {
    marginBottom: space[3],
    color: colors.onSurface,
  },
  categoryList: {
    gap: space[2],
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
  },
  categoryTextCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: space[3],
  },
  targetCountBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 3,
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  actionIconButton: {
    width: 48,
    minHeight: 48,
    padding: space[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    gap: space[2],
  },
  editInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    minHeight: 48,
    fontFamily: fontFamily.regular,
    paddingHorizontal: space[2],
  },
  emptyCard: {
    padding: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});
