# Other Chains

- [x] [ampleforth](https://www.ampleforth.org/): Aims to have price stability, i.e. stablecoin. Not in the same market as EarthBucks.
- [x] [saito](https://saito.io/saito-whitepaper.pdf): Aims to solve similar problems, but is more complex than EarthBucks.
- [x] [solana](https://solana.com/solana-whitepaper.pdf): EarthBucks solves the same issues but with a far simpler design.
- [x] [terra](https://terra.money/Terra_White_paper.pdf): Aims for price stability. Not what EarthBucks is.
- [x] [tezos](https://tezos.com/whitepaper.pdf): Seems based on Proof of Stake. Not like EarthBucks.
- [x] [zilliqa](https://zilliqa.com/whitepaper.pdf): Focused on "dApps": Not like EarthBucks.
- [x] [avalanche](https://www.avalabs.org/whitepapers): Designed to eliminate PoW. Not like EarthBucks.
- [x] [kaspa](https://wiki.kaspa.org/en/kaspa): DAG. Not like EarthBucks. However, it does have some similar philosophy, e.g. no pre-mine.
- [x] [nano](https://docs.nano.org): Designed to work with no mining. "Block-lattice architecture". Not like EarthBucks.
- [ ] [near](https://near.org/papers/the-rainbow-bridge/)
- [ ] [polkadot](https://polkadot.network/PolkaDotPaper.pdf)
- [ ] [cosmos](https://cosmos.network/resources/whitepaper)
- [ ] [algorand](https://www.algorand.com/resources/white-papers/)
- [ ] [hyper ledger](https://hyperledger-fabric.readthedocs.io/en/latest/whatis.html)

## Detailed Notes

### Saito

- At first glance, does aim to solve some other same problem as EarthBucks.
- "The tragedy-of-the-commons issue is created by the existence of the
  permanent ledger" - this is why EarthBucks expires the UTXOs after 90 days.
- The fundamental solution EarthBucks uses so solve the Saito issue is that
  users simply pay the business they are given a service from, exactly like
  everything else in the market. EarthBucks does not solve this problem in
  some sort of PoW consensus way. Rather, just ordinary business/economics.
- "Saito specifies that once a block falls out of the current epoch, its
  unspent transaction outputs (UTXO) are no longer spendable. But any UTXO
  from that set which contains enough tokens to pay a rebroadcasting fee must
  be reincluded in the very next block." - very similar to EarthBucks.
- Summary of first pass: Saito is more complex than EarthBucks, but does at
  least attempt to some of the same issues, and deserves another
  reading/analysis later.

### Solana

- Goal seems to be to solve time, which is solved on EarthBucks far simpler:
  Just ignore blocks from the future, and allow difficulty to get easier the
  longer there is no block.
- Why is there a "leader"? There is no such thing on EarthBucks.
- They seem to use Proof of Stake. There is no such thing on EarthBucks.
