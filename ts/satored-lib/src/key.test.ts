import {describe, expect, test} from '@jest/globals';
import Key from './key'

test('Key', () => {
  const key = Key.fromRandom()
  expect(key.privateKey).toBeDefined()
  expect(key.publicKey).toBeDefined()
  expect(key.singleAddress()).toBeDefined()
  expect(key.doubleAddress()).toBeDefined()
})