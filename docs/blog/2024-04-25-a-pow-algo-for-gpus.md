# A Proof-of-Work Algorithm for GPUs

April 25, 2024

I have finished the first proof-of-work (PoW) algorithm for GPUs. The
fundamental idea is to use the sort of operations that run best on a GPU, in
particular a giant matrix multiplication, both to maximize the amount of
computation that can be performed on commodity hardware, but also to discourage
the development of ASICs.

The first step is to find pseudorandom data for a giant matrix multiplication.
For that, we use recent block IDs, including the current "working block ID",
which is the hash of the invalid current block header which only becomes valid
when sufficient PoW is found. We use more than 6000 recent block headers to find
a huge amount of pseudorandom data.

We construct a 1289x1289 matrix from the pseudorandom data. The reason for the
number 1289 is that it is the largest prime number that when cubed still fits
into an int32. The reason it is prime is to decrease the possibility of
symmetries (such as divisibility of the pseudorandom data). The reason for the
cube is that we desire to at least square the matrix and then perform additional
computations. In practice, we actually do cube the matrix, and then divide it,
as explained in a moment.

The pseudorandom data is converted into bits and, if necessary (if there are not
enough recent blocks), the data is looped (hence the desire for a prime number
to prevent patterns in the looped pseudorandom data). The bits are then
converted into a 1289x1289 binary matrix. Only the most recent working block ID
needs to be updated for each iteration, minimizing the amount of data that needs
to be sent to the GPU, since the list of recent block IDs stays the same for
each iteration.

Next, we cube the matrix, convert it to float, and then perform deterministic
floating point operations on it. We can't perform matrix multiplication with
floating points because it is too hard to guarantee determinacy. However, for
element-wise computations, we can guarantee determinacy. So we subtract the
minimum, and then divide by the maximum, to get a matrix of floats between zero
and one. We then multiply by 1289 to get a large number of pseudorandom floats
between 0 and 1289. We then round this number and then convert back into
integers.

Finally, we need to reduce this matrix. Ideally, we would hash the output on the
GPU and then send that result back to the CPU. Unfortunately, that is not
currently possible with TensorFlow, the library we are using to perform the
matrix operations. Instead, we must reduce the matrix on the GPU and then send
the result back to the CPU. The reduction consists of four steps: Finding the
sum of each row, finding the maximum of each row, finding the minimum of each
row, and finding a random element by using the first element, which is possible
because we previously converted each element to a range of 0 to 1289, which
happens to be the size of each row (clipped).

All four of these reduction vectors are sent back to the CPU, which then hashes
the result. The four rows have four bytes per element in int32, so the size of
each one is 1289 times four bytes, or about 5 KB. Thus the total size is 20 KB.
this is much better than the 1289x1289 matrix, which is 1289 times 1289 times
four bytes, or about 6.6 MB. The reduction is a significant savings in terms of
data transfer.

Finally, we hash each vector, and then hash the four hashes together. This is
the final PoW hash. The hash is then compared to the target, and if it is below
the target, the PoW is considered valid.

This algorithm is designed to maximize the use of a GPU while also minimizing
data transfer to and from the GPU and while also working on every platform
(thanks to TensorFlow). The algorithm may change before launch, but it is likely
to be based on this general idea, and may not change at all if we do not find
any better algorithm before launch.

Either way, it is unlikely this is the optimal algorithm. Instead of pretending
we can find one perfect algorithm before launch, we will plan to upgrade the
algorithm periodically to continue to optimize the use of GPUs and to discourage
the development of ASICs.

Ryan X. Charles