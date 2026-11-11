import katex, { type KatexOptions } from 'katex'

/**
 * While a long answer streams, its last markdown block is re-rendered on every
 * throttle tick, which re-runs KaTeX for every formula already on screen.
 * renderToString is pure for a given expression/options pair, so memoize it.
 */
const MAX_CACHED_EXPRESSIONS = 2000
const cache = new Map<string, string>()
let installed = false

function cacheKey(expression: string, options: unknown): string | null {
  try {
    return `${expression}\u0000${options === undefined ? '' : JSON.stringify(options)}`
  } catch {
    return null
  }
}

export function installKatexRenderCache(): void {
  if (installed) return
  installed = true

  const renderToString = katex.renderToString.bind(katex)
  katex.renderToString = ((expression: string, options?: KatexOptions) => {
    const key = cacheKey(expression, options)
    if (key === null) return renderToString(expression, options)

    const hit = cache.get(key)
    if (hit !== undefined) {
      cache.delete(key)
      cache.set(key, hit)
      return hit
    }

    const rendered = renderToString(expression, options)
    if (typeof rendered === 'string') {
      cache.set(key, rendered)
      if (cache.size > MAX_CACHED_EXPRESSIONS) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) cache.delete(oldest)
      }
    }
    return rendered
  }) as typeof katex.renderToString
}
