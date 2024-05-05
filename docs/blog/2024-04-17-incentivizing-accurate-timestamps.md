# Incentivizing Accurate Timestamps with Continuous Target Adjustment

April 17, 2024

The target is the value in the block header that miners must find a hash below.
In EarthBucks, the target adjusts moment by moment to keep the block time at 10
minutes.

This is different from Bitcoin, which has a target that adjusts every 2016
blocks. Bitcoin timestamps are valid if they are within two hours of the network
time. This means some blocks have wildly inaccurate timestamps. And when the
network hash rate adjusts, you have to wait a long time for the target to
adjust.

In EarthBucks, a continuous target means the target depends on the current
timestamp. Blocks from the future are ignored. Blocks from the past have the
easiest target if they are produced right now. These factors combine to
incentivize accurate timestamps. You don't want to produce a block with a future
timestamp, because it will be ignored. Nor do you want to produce a block with
an old timestamp, because it will be hard to find a hash below the target. What
you want is to produce a block with exactly the right timestamp.

Ryan X. Charles