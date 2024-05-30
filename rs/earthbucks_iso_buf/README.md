# Isomorphic Buffer (IsoBuf)

I would love to use Protocol Buffers (ProtoBufs), but they suffer from a
limitation: if you read in a protobuf, and write it back out again, you don't
necessarily get the same binary data. But that is a very useful feature to have
when you need to hash/sign data. So I've decided not to use protobufs, and
instead to create a new type of encoding, far more limited than protobufs, but
where that key desirable feature of isomorphism between memory and binary is
preserved. Hence, Isomorphic Buffer.

IsoBufs also solve the problem of making code in Rust and TypeScript as similar
as possible to make such code easier to test. In Rust, IsoBufs are just u8
vectors and fixed-size u8 arrays. The closest analog in TypeScript is the
Uint8Array, but it offers no fixed-size version. So while the "IsoBuf" itself in
Rust is just a built-in type, in TypeScript, it is actually a class, coming in
either a variable sized form ("IsoBuf") or fixed-size form ("FixedIsoBuf<N>").
