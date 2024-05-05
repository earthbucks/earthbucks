# Signing In with a Key and the RPC API

May 5, 2024

I have made the sign up and sign in flow for the wallet. In order to sign in,
the user must generate a key pair which they save in a password manager. Then
they proceed to the sign in page, where they save the key pair in localStorage
(client-side browser storage) and then "sign in". Signing in means literally
signing an authentication challenge with their key. Signing in proceeds to a
home page where, currently, the only functionality is to sign out. Signing out
deletes the session cookie and also gives the user one final chance to save
their key pair for deleting the key pair from localStorage.

Getting this far required researching and implementing an RPC API. I've decided
against using REST because it is too incompatible with the flow of the software.
I've researched gRPC, tRPC, JSON-RPC, and other options such as GraphQL. For
now, I've decided to build a completely custom RPC API because these other
options seem like more hassle than they are worth. This is mainly because none
of these tools were specifically created to work with both Rust and TypeScript
simultaneously. Making the API work in both of these languages means I have to
do all the hard work any way, so I see no reason to use these conventions which
require I go out of my way.

Signing in works as follows. The anonymous user requests an authentication
challenge from the server. In order to minimize DOS attacks, the service signs
and responds with a randomized authentication challenge which is not stored in
the database. The user then signs the challenge and returns it to the server for
verification. The server then creates a session token, stores it in the
database, and sends the session ID to the user in a cookie. The user is now
signed in. The API for this involves both binary data structures for the
challenge/response messages and JSON data structures to contain these messages
inside an HTTP-based RPC API.

Next, I will proceed to build the wallet. Currently, my plan is to tie the
wallet to the builder and worry about building SPV some time after launch. This
will allow me to move more quickly and launch sooner.

I am considering launching an "early registration" product soon, where users can
reserve their user numbers." I would like to allow up to 100 people to mine the
genesis block, so the order in which the user registers will govern who can mine
the genesis block.

Ryan X. Charles