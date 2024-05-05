# Database Architecture

April 15, 2024

I am using MySQL for the database. I want to be able to access the database not
just in Rust, but also in node.js. Unfortunately, the tool I am using for MySQL
databases in node.js, Drizzle, does not support blob columns. I have therefore
decided to change the schema to use hex-encoded strings instead of binary blobs.
This increases the storage space, but it is a small price to pay for the ability
to access the database in node.js.

Considering blocks are likely to be less than 1 MB on average for quite some
time (Bitcoin didn't reach that limit until 8 years after launch), the extra
storage space is not a big deal. The other thing is that this data can be pruned
eventually. We can use an object store like AWS S3 for archival data at some
point in the future.

Ryan X. Charles