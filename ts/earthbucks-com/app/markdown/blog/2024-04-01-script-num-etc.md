+++
title = "ScriptNum, PUSHDATA, CODESEPARATOR, and Hash Functions"
author = "Ryan X. Charles"
date = "2024-04-01"
+++

- ScriptNum, the type of number that lives on the stack during script execution,
  now supports numbers bigger than 4 bytes and is encoded in big endian two's
  complement rather than sign-magnitude little endian encoding.
- An item on the stack, which is a buffer that can be interpreted as a ScriptNum
  for some operations, is only zero if it is all zeroes. This is different from
  Bitcoin which uses signed magnitude encoding and where there is such a thing
  as negative zero.
- The unnamed push operations that push small amounts of data have been removed.
  Only PUSHDATA1, PUSHDATA2, and PUSHDATA4 are allowed.
- I have removed VER, RESERVED, and NOP operations from the script language.
- I have removed the original hash functions, RIPMED160, SHA1, and SHA256, from
  the script language. We are using Blake3 for all hashing operations.
- I have removed CODESEPARATOR from the script language as it has almost never
  been used for anything.
