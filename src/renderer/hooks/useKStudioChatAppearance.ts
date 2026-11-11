import { useEffect } from 'react'

import { usePersistCache } from '@data/hooks/useCache'

/**
 * K-Studio chat aesthetics, inspired by Kelivo's adjustable bubbles and chat
 * backgrounds. Values live in the persist cache (not the shared preference
 * schema) so cosmetic choices never conflict with upstream preferences.
 */

export type KStudioBubbleStyle = 'theme' | 'glass' | 'solid'
export type KStudioChatBackground = 'none' | 'aurora' | 'sunset' | 'grid'

const BUBBLE_STYLES: Record<KStudioBubbleStyle, { background: string; border: string; blur: string; shadow: string }> =
  {
    theme: {
      background: 'var(--chat-user)',
      border: 'transparent',
      blur: '0px',
      shadow: 'none'
    },
    glass: {
      background: 'color-mix(in srgb, var(--chat-user) 55%, transparent)',
      border: 'color-mix(in srgb, var(--border) 65%, transparent)',
      blur: '14px',
      shadow: '0 10px 28px color-mix(in srgb, #000 14%, transparent)'
    },
    solid: {
      background: 'color-mix(in srgb, var(--primary) 14%, var(--chat-user))',
      border: 'color-mix(in srgb, var(--primary) 26%, transparent)',
      blur: '0px',
      shadow: 'none'
    }
  }

const CHAT_BACKGROUNDS: Record<KStudioChatBackground, { background: string; size: string }> = {
  none: { background: 'transparent', size: 'auto' },
  aurora: {
    background:
      'radial-gradient(1200px 600px at 8% -10%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 60%), radial-gradient(900px 520px at 105% 5%, color-mix(in srgb, #67e8f9 12%, transparent), transparent 55%)',
    size: 'auto'
  },
  sunset: {
    background:
      'linear-gradient(155deg, color-mix(in srgb, #fb7185 12%, transparent), transparent 45%), linear-gradient(20deg, color-mix(in srgb, #f59e0b 10%, transparent), transparent 55%)',
    size: 'auto'
  },
  grid: {
    background:
      'linear-gradient(color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px)',
    size: '26px 26px'
  }
}

export function useKStudioChatAppearance() {
  const [bubbleStyle, setBubbleStyle] = usePersistCache('kstudio.chat.bubble_style')
  const [bubbleRadius, setBubbleRadius] = usePersistCache('kstudio.chat.bubble_radius')
  const [background, setBackground] = usePersistCache('kstudio.chat.background')
  const [messageGap, setMessageGap] = usePersistCache('kstudio.chat.message_gap')

  useEffect(() => {
    const root = document.documentElement
    const bubble = BUBBLE_STYLES[bubbleStyle] ?? BUBBLE_STYLES.theme
    const chatBackground = CHAT_BACKGROUNDS[background] ?? CHAT_BACKGROUNDS.none

    root.style.setProperty('--ks-bubble-bg', bubble.background)
    root.style.setProperty('--ks-bubble-border', bubble.border)
    root.style.setProperty('--ks-bubble-blur', bubble.blur)
    root.style.setProperty('--ks-bubble-shadow', bubble.shadow)
    root.style.setProperty('--ks-bubble-radius', `${bubbleRadius}px`)
    root.style.setProperty('--ks-chat-bg', chatBackground.background)
    root.style.setProperty('--ks-chat-bg-size', chatBackground.size)
    root.style.setProperty('--ks-message-gap', `${messageGap}px`)
  }, [background, bubbleRadius, bubbleStyle, messageGap])

  return {
    bubbleStyle,
    setBubbleStyle,
    bubbleRadius,
    setBubbleRadius,
    background,
    setBackground,
    messageGap,
    setMessageGap
  }
}
