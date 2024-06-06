# Other Chains

- [x] [Bitcoin](https://bitcoin.org/bitcoin.pdf): EarthBucks is a new chain
  with a new design, but with some similarities to Bitcoin.
- [x] [Bitcoin Cash](https://bitcoincash.org): The closest blockchain to
  EarthBucks, but with far more baggage. EarthBucks is new code, new chain, new
  brand, and with a better design (no reorgs).
- [x] [eCash](https://e.cash): Adds pre-consensus with Avalanche. Like a more
  complicated version of EarthBucks voting. Retains history of Bitcoin
  blockchain and code like BCH. Too much baggage and too little network effect.
- [x] [ampleforth](https://www.ampleforth.org/): Aims to have price stability,
  i.e. stablecoin. Not in the same market as EarthBucks.
- [x] [saito](https://saito.io/saito-whitepaper.pdf): Aims to solve similar
  problems, but is more complex than EarthBucks.
- [x] [solana](https://solana.com/solana-whitepaper.pdf): EarthBucks solves the
  same issues but with a far simpler design.
- [x] [terra](https://terra.money/Terra_White_paper.pdf): Aims for price
  stability. Not what EarthBucks is.
- [x] [tezos](https://tezos.com/whitepaper.pdf): Seems based on Proof of Stake.
  Not like EarthBucks.
- [x] [zilliqa](https://zilliqa.com/whitepaper.pdf): Focused on "dApps": Not
  like EarthBucks.
- [x] [avalanche](https://www.avalabs.org/whitepapers): Designed to eliminate
  PoW. Not like EarthBucks.
- [x] [kaspa](https://wiki.kaspa.org/en/kaspa): DAG. Not like EarthBucks.
  However, it does have some similar philosophy, e.g. no pre-mine.
- [x] [nano](https://docs.nano.org): Designed to work with no mining.
  "Block-lattice architecture". Not like EarthBucks.
- [x] [Radiant](https://radiantblockchain.org/radiant.pdf): "Assets" and Proof
  of Stake. Not like EarthBucks.
- [x] [Dash](https://www.exodus.com/assets/docs/dash-whitepaper.pdf): "Masternodes"
  and "Darksend". Not like EarthBucks.

## Detailed Notes

## Bitcoin

It is my opinion that Bitcoin would have worked just fine if it simply hadn't
had a maximum block size limit. However, in light of that limit, I have decided
to make a large number of changes that go beyond just increasing the limit.
EarthBucks is a from-scratch new blockchain with a new design, new code, and a
new brand. It is not a fork of Bitcoin, but it is inspired by Bitcoin.

## Bitcoin Cash

Bitcoin Cash is the closest blockchain to EarthBucks because of its similarity
to Bitcoin.

However, EarthBucks is quite different from Bitcoin Cash in the following ways:

- EarthBucks is completely new software (Rust/TypeScript instead of C++).
- EarthBucks is a completely new chain (no Bitcoin history).
- EarthBucks expires all UTXOs after 90 days through mandatory
  CHECKLOCKRELVERIFY script (with recovery ability for lost keys).
- Blake3 hash function instead of SHA256.
- GPU-focused mining based on a large matrix multiplication instead of SHA256.
- Change fees ("transaction fees") are zero on EarthBucks (you pay a mine or
  wallet directly like any other business).
- No reorgs. After validating a block, mines query all recent mines (because
  they are not anonymous) to vote on the block (in addition to, and using, PoW),
  making reorgs impossible
- Nearly instant transactions through the same voting mechanism as blocks
  (validate first, then vote, and only 50%+ voted transactions are fully valid).
- An intentional governance structure on launch day.
- Trademark owned by Ryan X. Charles LLC.
- Mines are ordinary businesses, not anonymous entities.

Nontheless, important similarities include:

- Transaction structure (multiple inputs/outputs).
- Blocks (block header with PoW and a merkle root of transactions).
- Script (e.g., OP_MUL, OP_ADD, etc.).
- 42 million total coins (exactly twice that of Bitcoin Cash).
- A distribution schedule that is exactly the same (four year halving schedule),
  except starting in 2024 instead of 2009.
- sighash algorithm is based on Bitcoin Cash.

### Saito

- At first glance, does aim to solve some other same problem as EarthBucks.
- "The tragedy-of-the-commons issue is created by the existence of the permanent
  ledger" - this is why EarthBucks expires the UTXOs after 90 days.
- The fundamental solution EarthBucks uses so solve the Saito issue is that
  users simply pay the business they are given a service from, exactly like
  everything else in the market. EarthBucks does not solve this problem in some
  sort of PoW consensus way. Rather, just ordinary business/economics.
- "Saito specifies that once a block falls out of the current epoch, its unspent
  transaction outputs (UTXO) are no longer spendable. But any UTXO from that set
  which contains enough tokens to pay a rebroadcasting fee must be reincluded in
  the very next block." - very similar to EarthBucks.
- Summary of first pass: Saito is more complex than EarthBucks, but does at
  least attempt to some of the same issues, and deserves another
  reading/analysis later.

### Solana

- Goal seems to be to solve time, which is solved on EarthBucks far simpler:
  Just ignore blocks from the future, and allow difficulty to get easier the
  longer there is no block.
- Why is there a "leader"? There is no such thing on EarthBucks.
- They seem to use Proof of Stake. There is no such thing on EarthBucks.
