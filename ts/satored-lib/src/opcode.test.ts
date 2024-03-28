import { describe, expect, test, beforeEach, it } from '@jest/globals'
import { nameToOpcode, opcodeToName } from './opcode'

describe('opcode', () => {
  test('opcode maps are consistent', () => {
    // Check that every opcode in the first map is also in the second map
    for (const [name, value] of Object.entries(nameToOpcode)) {
      expect(opcodeToName[value]).toBeDefined()
    }

    // Check that every opcode in the second map is also in the first map
    for (const [value, name] of Object.entries(opcodeToName)) {
      expect(nameToOpcode[name]).toBeDefined()
    }
  })
})
