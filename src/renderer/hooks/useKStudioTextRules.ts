import { useEffect } from 'react'

import { usePersistCache } from '@data/hooks/useCache'
import { type KStudioTextRule, setKStudioTextRules } from '@renderer/utils/kstudioTextRules'

let nextRuleId = 0

export function createKStudioTextRule(): KStudioTextRule {
  nextRuleId += 1
  return { id: `rule-${Date.now()}-${nextRuleId}`, find: '', replace: '', flags: 'gi', enabled: true }
}

export function useKStudioTextRules() {
  const [rules, setRules] = usePersistCache('kstudio.chat.text_rules')

  useEffect(() => {
    setKStudioTextRules(rules)
  }, [rules])

  return { rules, setRules }
}
