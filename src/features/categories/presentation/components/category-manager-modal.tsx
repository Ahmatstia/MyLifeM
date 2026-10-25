import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Plus, Pencil, Trash2, Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { radius, space } from '@/theme/tokens';
import { AppText } from '@/shared/ui/app-text';
import { Button } from '@/shared/ui/button';
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
  const { categories, addCategory, editCategory, removeCategory } = useCategories();
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <AppText variant="titleLarge">Kelola Kategori Target</AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                Label pengelompokan untuk target pengembangan dirimu
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeButton}
            >
              <X size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
              <TextInput
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

            {categories.length === 0 ? (
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
                          value={editingName}
                          onChangeText={setEditingName}
                          autoFocus
                          style={styles.editInput}
                        />
                        <Pressable
                          onPress={handleSaveEdit}
                          style={styles.actionIconButton}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Check size={18} color={colors.primary} />
                        </Pressable>
                        <Pressable
                          onPress={() => setEditingId(null)}
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
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.actionIconButton}
                        >
                          <Pencil size={16} color={colors.primary} />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDelete(cat.id, cat.name, cat.targetCount)}
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    maxHeight: '85%',
    paddingBottom: space[8],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: space[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  closeButton: {
    padding: space[2],
  },
  content: {
    padding: space[4],
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.lg,
    padding: space[3],
    marginBottom: space[3],
  },
  addCategoryBox: {
    flexDirection: 'row',
    gap: space[2],
    marginBottom: space[4],
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    color: colors.onSurface,
    paddingHorizontal: space[4],
    height: 48,
    fontSize: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 40,
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
