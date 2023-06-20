---
tags:
- libp2p
- rust
title: rust-libp2p v0.52 release spotlight
description: Walking through the rust-libp2p v0.52 release
date: 2023-06-19
permalink: "/2023-06-19-rust-libp2p-052"
translationKey: ''
header_image: /rust-libp2p-2022-header.png
author: Thomas Eizinger
---

# rust-libp2p v0.52 release spotlight

With the `v0.52` release, the `rust-libp2p` maintainer team tried something new.
Breaking changes - even in the presence of an obvious or easy upgrade path - are a burden for our users.
They easily trigger a cascade of breaking changes for downstream users.

Coming up to the `v0.52` release, we consciously held back and batched up breaking changes and released several features as patch releases instead.
As a result, `v0.52` is unfortunately quite large.
This blogpost highlights the most exciting changes:

- Automatic kademlia client/server mode
- Type-safe `/p2p` multiaddresses
- More consistent event/command naming
- Improve ergonomics around stream-upgrade errors
- Simpler noise interface

## Automatic kademlia client/server mode

Let's get the biggest one out the way first, I promise the other points are easier explained but equally exciting.
The **tl;dr** is: Healthier Kademlia routing tables and an improved developer experience.

If you don't know about Kademlia's client/server mode, checkout the [specs](https://github.com/libp2p/specs/tree/master/kad-dht#client-and-server-mode).

With the `v0.52` release, `rust-libp2p` automatically configures Kademlia in client or server mode depending on our external addresses.
If we have a confirmed, external address, we will operate in server-mode, otherwise client-mode.
This is entirely configuration-free (yay!) although follow-up work is under-way to allow setting this manually in certain situations: [#4074](https://github.com/libp2p/rust-libp2p/issues/4074).

We can now do the following:

1. As soon as we learn about an external address (e.g. via AutoNAT), we activate server mode of Kademlia.
2. Activating server-mode means we allow inbound requests, this is a change in our set of supported protocols.
3. The change is detected automatically and reported to all protocols as `ConnectionEvent::LocalProtocolsChange`.
4. `libp2p-identify` picks up this change and pushes it to all connected remote nodes.
5. Remote nodes can instantly put us into their routing table.

To implement this, several other features/issues had to be fixed.
If you are interested in the details, read on:

- Changes to the supported protocols are now detected at runtime and communicated to all protocols: [#3651](https://github.com/libp2p/rust-libp2p/pull/3651).
  
  Previously, a protocol could retrieve the supported protocols via `PollParameters::supported_protocols`.
  This list however was computed at start-up and was static.
  Now, `ConnectionEvent` has two new variants:
  
  ```rust
  pub enum ConnectionEvent<'a> {
    // existing variants omitted ...
  
    /// The local [`ConnectionHandler`] added or removed support for one or more protocols.
    LocalProtocolsChange(ProtocolsChange<'a>),
    /// The remote [`ConnectionHandler`] now supports a different set of protocols.
    RemoteProtocolsChange(ProtocolsChange<'a>),
  }
  
  pub enum ProtocolsChange<'a> {
    Added(ProtocolsAdded<'a>),
    Removed(ProtocolsRemoved<'a>),
  }
  ``` 

  `ProtocolsAdded` and `ProtocolsRemoved` are iterators over a (new) type called `StreamProtocol`.
- Protocols are now enforced to be valid UTF-8 strings: [#3746](https://github.com/libp2p/rust-libp2p/pull/3746).

  This was always the case in the specs but the `rust-libp2p` implementation was lagging behind here and improperly represented them as bytes internally.
- Local changes to our protocols (i.e. a node going from Kademlia server to client mode) are now immediately pushed to the remote via the [`/ipfs/id/push/1.0.0`](https://github.com/libp2p/specs/tree/master/identify#identifypush) protocol: [#3980](https://github.com/libp2p/rust-libp2p/pull/3980).
- Simplify the scoring mechanism of external addresses: [#3954](https://github.com/libp2p/rust-libp2p/pull/3954)

Not only does this work out-of-the-box and thus improves the developer experience of `rust-libp2p`, it should also result in a much more useful and up-to-date routing table for all nodes on a Kademlia DHT.

## Type-safe `/p2p` multiaddresses

The `/p2p` protocol of multiaddresses specifies the identity of a peer in the form of a `PeerId` such as `12D3KooWETLZBFBfkzvH3BQEtA1TJZPmjb4a18ss5TpwNU7DHDX6`.
Yet for the longest time, the type-definition of the `/p2p` protocol looked like this:

```rust
pub enum Protocol<'a> {
    // omitted other variants ...
    P2p(Multihash),
}
```

Every `PeerId` is a valid `Multihash` but not vice-versa.
Dang!
That is a lot of "impossible" errors that the type-system should avoid.

[Thanks](https://github.com/multiformats/rust-multihash/issues/322) [to](https://github.com/libp2p/rust-libp2p/pull/3514) [a](https://github.com/libp2p/rust-libp2p/pull/3656) [lot](https://github.com/libp2p/rust-libp2p/pull/3350) [of](https://github.com/multiformats/rust-multihash/pull/272) [work](https://github.com/multiformats/rust-multiaddr/pull/83), it now looks like this:


```rust
pub enum Protocol<'a> {
    // omitted other variants ...
    P2p(PeerId),
}
```

## More consistent event/command naming

Naming is hard and humans are creatures of habit.
Thus, once familiar with certain names, it is often hard to see how they make absolutely no sense at all to newcomers.

In the `v0.52` release we renamed several associated types and enums which hopefully make the message-passing system implemented in `rust-libp2p` easier to grasp.

A quick recap:
- A `NetworkBehaviour` represent a protocol's state across all peers and connections.
- A `ConnectionHandler` represents a protocol's state for a single connection to a peer.
- Multiple `NetworkBehaviour`s are composed into a tree using `#[derive(NetworkBehaviour)]` and run inside a `Swarm`

`NetworkBehaviour`s can emit events to the `Swarm`.
This used to be called `OutEvent`.
Now, its aptly named `ToSwarm`:

```rust
pub trait NetworkBehaviour {
    type ToSwarm;
  
    // functions and other types omitted ...
}
```

Returning one of these events was previously done with a `NetworkBehaviourAction::GenerateEvent`, a type-name so long you were grateful for autocomplete.
These actions are essentially commands that are issued **to** the **swarm**.
What could possibly be a good name for that?
I present:

```rust
pub enum ToSwarm<TOutEvent, TInEvent> {
    GenerateEvent(TOutEvent),
    
    // other variants omitted ..
}
```

We followed the same strategy for `ConnectionHandler`.
A `ConnectionHandler` can receive messages **from** a `NetworkBehaviour` via `ToSwarm::NotifyHandler` (gosh, that was so much easier to write, why didn't we do this earlier?) and send message **to** its `NetworkBehaviour`.
The associated types defining these messages are now called `ToBehaviour` and `FromBehaviour`, representing _where_ the message is going / coming from.
Previously, they carried the generic names `InEvent` and `OutEvent` which had me utterly confused when I first started working on `rust-libp2p`.

To wrap it all up, the `ConnectionHandlerEvent::Custom` variant is now called `ConnectionHandlerEvent::NotifyBehaviour`, making it clear what happens to types returned here.

## Improved ergonomics around stream errors

Oh, isn't this one of my favourites!

Ever wondered why `ConnectionHandlerUpgrErr` had what felt like 10 layers of nested enums?
So did we and went ahead and fixed this in [#3882](https://github.com/libp2p/rust-libp2p/pull/3882).

This is what it looked like before:

```rust
pub enum ConnectionHandlerUpgrErr<TUpgrErr> {
    Timeout,
    Timer,
    Upgrade(UpgradeError<TUpgrErr>),
}

pub enum UpgradeError<E> {
  Select(NegotiationError),
  Apply(E),
}

pub enum NegotiationError {
  ProtocolError(ProtocolError),
  Failed,
}

pub enum ProtocolError {
  IoError(io::Error),
  InvalidMessage,
  InvalidProtocol,
  TooManyProtocols,
}
```

Now, it looks like this:

```rust
pub enum StreamUpgradeError<TUpgrErr> {
    Timeout,
    Apply(TUpgrErr),
    NegotiationFailed,
    Io(io::Error),
}
```

But that is not it!

Previously, we would give you one of these `ConnectionHandlerUpgrErr` when an _inbound_ stream failed.
But, what exactly does `ProtocolError::InvalidMessage` for example mean for an inbound stream?
How would we even figure out, which protocol (read `ConnectionHandler`) this should be dispatched to if we failed to negotiate the protocols?

Well, you might have guessed it.
It is impossible to dispatch this to the correct one, so we just informed all protocols.
But that was pretty useless.
If we don't know, which stream a protocol belongs to, we shouldn't just inform all of them.
Thus, in [#3605](https://github.com/libp2p/rust-libp2p/pull/3605) we stopped this which removes several "impossible" error paths.

## Simpler noise interface

Since its introduction, the `libp2p-noise` crate supported a wide range of handshake patterns.
The libp2p specs however only documents the `XX` handshake: [libp2p/specs/noise](https://github.com/libp2p/specs/tree/master/noise#handshake-pattern).

Supporting additional patterns introduced significant complexity to the codebase.
We decided to [deprecate](https://github.com/libp2p/rust-libp2p/pull/3768) and [remove](https://github.com/libp2p/rust-libp2p/pull/3511) them.
This significantly reduced the complexity of the `libp2p-noise` implementation (-1000 LoC!).
Additionally, it allowed us to finally adopt the [naming conventions](https://github.com/libp2p/rust-libp2p/issues/2217) we have been pursuing across the workspace for `libp2p-noise`.

Using the noise handshake is now as simple as:

```rust
let config = libp2p::noise::Config::new(&keypair).unwrap();
```

## Closing

Well done for making it to the end!

As always, a detailed log of changes for every release can be found in our repository: [CHANGELOG.md](https://github.com/libp2p/rust-libp2p/blob/master/CHANGELOG.md).
If you are struggling with an upgrade, feel free to tag Max (@mxinden) or myself (@thomaseizinger) in a PR and we'll try to help.

Happy coding!
