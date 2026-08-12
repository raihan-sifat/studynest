import { describe, expect, it } from 'vitest'
import { toCsv } from '@/utils/csv'

describe('toCsv', () => {
  it('joins rows and cells with commas/newlines', () => {
    expect(
      toCsv([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ).toBe('a,b\nc,d')
  })

  it('coerces numbers to strings', () => {
    expect(toCsv([[1, 2]])).toBe('1,2')
  })

  it('leaves simple fields unquoted', () => {
    expect(toCsv([['plain text']])).toBe('plain text')
  })

  it('quotes fields containing commas', () => {
    expect(toCsv([['a,b']])).toBe('"a,b"')
  })

  it('quotes fields containing double quotes and doubles them up', () => {
    expect(toCsv([['say "hi"']])).toBe('"say ""hi"""')
  })

  it('quotes fields containing newlines', () => {
    expect(toCsv([['line1\nline2']])).toBe('"line1\nline2"')
  })

  it('handles an empty matrix', () => {
    expect(toCsv([])).toBe('')
  })

  it('handles a mixed row of escaped and plain cells', () => {
    expect(toCsv([['ok', 'with, comma', 'with "quote"']])).toBe('ok,"with, comma","with ""quote"""')
  })
})
