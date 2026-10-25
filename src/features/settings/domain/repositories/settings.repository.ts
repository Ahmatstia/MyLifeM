import type {
  UserSettingsEntity,
  DatabaseStats,
} from '../entities/settings.entity';

export interface SettingsRepository {
  getSettings(): Promise<UserSettingsEntity>;
  saveSettings(settings: Partial<UserSettingsEntity>): Promise<UserSettingsEntity>;
  getDatabaseStats(): Promise<DatabaseStats>;
  exportBackupJson(): Promise<string>;
  restoreBackupJson(json: string, safetyJson: string): Promise<void>;
}
