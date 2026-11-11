import type { SidebarShortcutItem } from '@shared/data/preference/preferenceTypes'

import { SIDEBAR_SHORTCUT_PROVIDER_IDS } from '../utils/sidebar'

/**
 * K-Studio is a conversation-only build. Upstream feature surfaces stay in the
 * tree (so upstream fixes still merge), but the daily UI is reduced to chat:
 * assistants, their topics, and the conversation workspace.
 */
export const K_STUDIO_CHAT_ONLY = true

/** Voice input/output is not part of the K-Studio conversation experience. */
export const K_STUDIO_VOICE_ENABLED = false

/** Image generation is out of scope; the chat composer keeps only text/tools. */
export const K_STUDIO_IMAGE_GENERATION_ENABLED = false

/** Built-in app entries that survive the chat-only filter. */
const K_STUDIO_VISIBLE_APP_IDS = new Set(['assistants'])

/** Resource providers that are conversation content rather than a separate tool. */
const K_STUDIO_VISIBLE_RESOURCE_PROVIDERS = new Set<string>([
  SIDEBAR_SHORTCUT_PROVIDER_IDS.ASSISTANT,
  SIDEBAR_SHORTCUT_PROVIDER_IDS.TOPIC
])

export function isKStudioSidebarShortcutVisible(shortcut: SidebarShortcutItem): boolean {
  if (!K_STUDIO_CHAT_ONLY) return true

  const { providerId, resourceId } = shortcut.target.locator
  if (providerId === SIDEBAR_SHORTCUT_PROVIDER_IDS.APP) {
    return K_STUDIO_VISIBLE_APP_IDS.has(resourceId)
  }
  return K_STUDIO_VISIBLE_RESOURCE_PROVIDERS.has(providerId)
}
