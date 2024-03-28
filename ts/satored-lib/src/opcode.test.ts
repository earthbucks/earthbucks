import { describe, expect, test, beforeEach, it } from '@jest/globals'
import { NAME_TO_OPCODE, OPCODE_TO_NAME } from './opcode'

describe('opcode', () => {
  test('opcode maps are consistent', () => {
    // Check that every opcode in the first map is also in the second map
    for (const [name, value] of Object.entries(NAME_TO_OPCODE)) {
      expect(OPCODE_TO_NAME[value]).toBeDefined()
    }

    // Check that every opcode in the second map is also in the first map
    for (const [value, name] of Object.entries(OPCODE_TO_NAME)) {
      expect(NAME_TO_OPCODE[name]).toBeDefined()
    }
  })
})
