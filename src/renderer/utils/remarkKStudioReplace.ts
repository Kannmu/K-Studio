import type { Root, Text } from 'mdast'
import { visit } from 'unist-util-visit'

import { getKStudioTextRules } from '@renderer/utils/kstudioTextRules'

interface CompiledRule {
  regex: RegExp
  replacement: string
}

function compileRules(): CompiledRule[] {
  const compiled: CompiledRule[] = []
  for (const rule of getKStudioTextRules()) {
    try {
      const flags = rule.flags.includes('g') ? rule.flags : `${rule.flags}g`
      compiled.push({ regex: new RegExp(rule.find, flags), replacement: rule.replace })
    } catch {
      // An invalid pattern must not break the whole message render.
    }
  }
  return compiled
}

/**
 * Applies K-Studio output cleanup rules to plain text nodes only. Code blocks
 * (`code`/`inlineCode`) and math nodes are separate node types, so formulas and
 * source code are never rewritten.
 */
export function remarkKStudioReplace() {
  return (tree: Root) => {
    const rules = compileRules()
    if (rules.length === 0) return

    visit(tree, 'text', (node: Text) => {
      let next = node.value
      for (const rule of rules) next = next.replace(rule.regex, rule.replacement)
      if (next !== node.value) node.value = next
    })
  }
}
