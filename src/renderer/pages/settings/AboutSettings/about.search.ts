import type { SettingsSearchEntry } from '../settingsSearch/types'

export const route = '/settings/about'

// K-Studio's about page has no update rows; only the local debug entry remains
// searchable. The version/links stay out per D8 (non-actionable information).
export const entries: SettingsSearchEntry[] = [
  {
    anchorId: 'debug-tools',
    titleKey: 'kstudio.about.debug',
    groupKey: 'settings.about.label'
  }
]
