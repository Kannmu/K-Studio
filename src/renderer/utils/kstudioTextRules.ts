export interface KStudioTextRule {
  id: string
  find: string
  replace: string
  flags: string
  enabled: boolean
}

/**
 * Rules are read by the remark plugin during a markdown parse, which cannot use
 * hooks. The settings surface and the chat page push the persisted rules here;
 * only enabled rules with a non-empty pattern are compiled.
 */
let activeRules: readonly KStudioTextRule[] = []

export function setKStudioTextRules(rules: readonly KStudioTextRule[]): void {
  activeRules = rules.filter((rule) => rule.enabled && rule.find.trim().length > 0)
}

export function getKStudioTextRules(): readonly KStudioTextRule[] {
  return activeRules
}
