import type { Root } from 'mdast'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { afterEach, describe, expect, it } from 'vitest'

import { setKStudioTextRules } from '@renderer/utils/kstudioTextRules'
import { remarkKStudioReplace } from '@renderer/utils/remarkKStudioReplace'

function parse(source: string): Root {
  const processor = unified().use(remarkParse).use(remarkKStudioReplace)
  return processor.runSync(processor.parse(source), source) as Root
}

function collect(root: Root, type: 'text' | 'inlineCode' | 'code'): string[] {
  const values: string[] = []
  visit(root, type, (node) => values.push(node.value))
  return values
}

afterEach(() => setKStudioTextRules([]))

describe('remarkKStudioReplace', () => {
  it('replaces matches in plain text only', () => {
    setKStudioTextRules([{ id: 'a', find: 'foo', replace: 'bar', flags: 'gi', enabled: true }])
    const tree = parse('foo and `foo` and\n\n```\nfoo\n```')
    const plainText = collect(tree, 'text').join('')
    expect(plainText).toContain('bar')
    expect(plainText).not.toContain('foo')
    for (const protectedValue of [...collect(tree, 'inlineCode'), ...collect(tree, 'code')]) {
      expect(protectedValue.trim()).toBe('foo')
    }
  })

  it('supports capture groups and flags', () => {
    setKStudioTextRules([{ id: 'a', find: '(\\d+)px', replace: '$1 px', flags: 'g', enabled: true }])
    expect(collect(parse('size 12px and 8px'), 'text')).toEqual(['size 12 px and 8 px'])
  })

  it('ignores disabled rules and invalid patterns without failing the parse', () => {
    setKStudioTextRules([
      { id: 'off', find: 'foo', replace: 'bar', flags: 'g', enabled: false },
      { id: 'bad', find: '([', replace: 'x', flags: 'g', enabled: true }
    ])
    expect(collect(parse('foo'), 'text')).toEqual(['foo'])
  })
})
