import { describe, expect, test, beforeEach, it } from '@jest/globals'
import { OP, OPCODE_TO_NAME } from '../src/opcode'

describe('opcode', () => {
  test('opcode maps are consistent', () => {
    // Check that every opcode in the first map is also in the second map
    for (const [name, value] of Object.entries(OP)) {
      expect(OPCODE_TO_NAME[value]).toBeDefined()
    }

    // Check that every opcode in the second map is also in the first map
    for (const [value, name] of Object.entries(OPCODE_TO_NAME)) {
      expect(OP[name]).toBeDefined()
    }
  })
})
