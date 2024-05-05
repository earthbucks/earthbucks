### Merkle Proofs and Blocks

April 9, 2024

I have reimplemented Merkle trees. Next up are blocks. I have changed the block
header in the following ways:

- Instead of including a difficulty, I include the target. This increases the
  block sizes, becasue the target is 32 bytes instead of 4 bytes. This value is
  more precise.
- I have increased the timestamp to 64 bits because the 32 bit timestamp is runs
  out in 2106. 64 bits lasts far longer.
- I have increased the nonce to 256 bits. That is because the 4 byte nonce in
  Bitcoin is not big enough, and miners have to change transaction order to
  mine. We should be able to change the nonce only to mine.
- I have added the block index. This simply gives a convenient way to verify the
  block index for anyone tracking the block headers.

Ryan X. Charles