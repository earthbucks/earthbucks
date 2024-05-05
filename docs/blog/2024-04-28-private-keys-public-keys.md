# Private Keys, Public Keys, and Public Key Hashes

April 28, 2024

There is no such thing as an "address" in EarthBucks. One of the big differences
between Bitcoin and EarthBuck is that there is no such thing as "pay to address"
in the sense of Bitcoin. Instead of an address consisting of a string of random
characters, an address is a human-readable email address. This "email address",
or "EBX address", includes a name so that the user is recognizable to whoever is
sending the money, and a domain name so that the location where the money is to
be sent is known.

By using an email address, not only are the addresses more friendly to humans,
they also enable SPV, because the message that sends the transaction also sends
merkle proofs of the inputs, enabling the receiving user to validate the
transaction without needing to download any blocks. Meanwhile, both users will
also get very quick confirmation from miners that the payment will be included
in the next block, assuming they are online.

Although we are eliminating "pay to address" in the sense of Bitcoin, we are not
eliminating the use of random data in the protocol itself. Thus the sense of a
"Bitcoin address" does still exist in the protocol. We call it a "public key
hash", or "pub key hash", or just "pkh".

The three key types in EarthBucks are as follows:

- Private Key, or PrivKey: A 32 byte random number.
- Public Key, or PubKey: A 33 byte point computed on secp256k1 from the private
  key.
- Public Key Hash, or PubKeyHash, or PKH: A 32 byte double blake3 hash of the
  public key.

Furthermore, because it is sometimes necessary to see these keys, such as when
creating a wallet for the first time, we want friendly string formats for these
keys.

The string format for each key type includes the words "ebxprv", or "ebxpub", or
"ebxpkh" at the front, followed by an 8 character hexadecimal checksum, followed
by the key itself in base58 format. This format is similar to, but not the same
as, Bitcoin.

An example key is as follows:

- Priv Key: ebxprv38726588FxbBLchUEt8sNkrytJuqwvwoCuZfhX5X9vdhU8keU2xu
- Pub Key: ebxpub174fc268mgoT8kLwT7HPWncsMk9AqoMeoifmQKBdMLC7jAb7r2Yd
- PKH: ebxpkhefeb7e43AL6r2PSJn3CsS6yMwxKyNvu9GkPEnN9peSaFVsN6dAxp

These formats are designed to be as friendly as possible for random data.
However, the user is not expected to see this data on a regular basis. The only
thing the user may see is a key for the first time they create a wallet, and
even that can be prevented with some sophisticated multi-user key management
(which can be done with low trust).

EarthBucks should be as user-friendly as possible. For the most part, that means
not seeing keys, but when keys are visible, they should be readable and include
a checksum. The EarthBucks key string format solves this problem.

Ryan X. Charles