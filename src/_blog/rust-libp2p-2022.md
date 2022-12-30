---
tags:
- libp2p
- rust
title: rust-libp2p in 2022
description: Recapitulating the year 2022 for the rust-libp2p project
date: 2022-12-30
permalink: "/2022-12-30-rust-libp2p-in-2022"
translationKey: ''
header_image:
author: Max Inden
---

# The rust-libp2p Project in 2022

In 2022, the rust-libp2p project saw many notable developments and improvements.
Let's take a closer look at some of the highlights, and one or two mistakes
along the way. Note that while I (Max Inden) am writing this blog post, this is
the work of many across various companies and countries.

We started the year with the release of the various components needed for hole
punching. We added the Circuit Relay v2 protocol, DCUtR protocol and AutoNAT
protocol. With that rust-libp2p
[v0.43.0](https://github.com/libp2p/rust-libp2p/releases/tag/v0.43.0) in
February was the first rust-libp2p release with hole punching capabilities.

861e15da * src/tutorials: Add hole punching tutorial (#2460)
0bb8ee98 * protocols/: Implement Direct Connection Upgrade through Relay (DCUtR) (#2438)
96dbfcd1 * core/src/transport: Add `Transport::dial_as_listener` (#2363)
17ee5047 *  protocols/relay: Implement circuit relay v2 protocol  (#2059)
c61ea6ad * protocols/: Add basic AutoNAT implementation (#2262)
74f31f12 * {core,swarm}/: Allow configuring dial concurrency factor per dial (#2404)

To improve what we rolled out in the beginning of the year, the libp2p project
started the _Hole Punching Measurement Campaign_ aka. _Hole Punching Month_in
collaboration with ProbeLab. A multitude of clients using both go-libp2p and
rust-libp2p are currently punching holes across the globe, providing valuable
data that we can later on use to improve the libp2p specification and the two
implementations.

Over the year we worked on two new transports, namely WebRTC and QUIC, which we
both released towards the end of the year as alphas.

WebRTC allows browsers to connect to rust-libp2p based servers without those
servers having signed TLS certificates. QUIC is the better TCP+Noise+Yamux in
every dimension, e.g. faster connection establishment, better multiplexing,
higher hole punching success rates. Along the way, given that QUIC already
requires TLS, rust-libp2p can now secure TCP connections with TLS as well
(previously only Noise).

a7148648 * feat: Add WebRTC transport (#2622)
0f5c491d * feat(transports/quic): Add implementation based on `quinn-proto` (#2289)
159a10b8 * transports/tls: Add `libp2p-tls` as per spec (#2945)

Along the way we tackled many smaller improvements, as a whole having a big
impact on the user experience. To mention a couple: naming consistency across
crates, refactoing of the many `inject_*` into a single `enum` event handler in
both `NetworkBehaviour` and `ConnectionHandler` and the rework of our Rust
feature flags.

5782a96a * refactor(swarm)!: don't be generic over `Transport` (#3272)
93335b88 * refactor(dcutr): reshape public API to follow naming guidelines (#3214)
be3ec6c6 * refactor(swarm)!: deprecate `PollParameters` where possible (#3153)
f828db60 * refactor(request-response): revise public API to follow naming convention (#3159)
7803524a * swarm/handler: replace inject_* methods (#3085)
3df3c88f * swarm/behaviour: Replace `inject_*` with `on_event` (#3011)
a7a96e55 * protocols/identify: Revise symbol naming (#2927)
1da75b2b * protocols/ping: Properly deprecate types with `Ping` prefix (#2937)
f6bb846c * *: Remove default features from all crates (#2918)
45faefa3 * *: Unfiy how we depend on crates across the workspace (#2886)
62622a1b * core/src/transport: Poll Transport directly, remove Transport::Listener (#2652)
bbd2f8f0 *  misc/prost-codec: Introduce codec for varint prefixed Protobuf messages  (#2630)
2ad905f3 * {core,swarm}/: Don't require `Transport: Clone` and take `&mut` (#2529)
e2fcc47d * swarm/src/behaviour: Remove Send bound from NetworkBehaviour (#2535)
fd2be38f * swarm/: Rename ProtocolsHandler to ConnectionHandler (#2527)
8ffa84e7 * swarm/src: Remove ConnectionHandler (#2519)
7fc342e6 * {core,swarm}: Remove Network abstraction (#2492)
dc8433e3 * swarm/src/behaviour: Merge inject_* paired methods (#2445)

Still remember the old days with the `NetworkBehaviourEventProcess` trait? All
gone in favor of the much simpler (generated) `OutEvent` mechanism.

6855ab94 * swarm-derive/: Remove support for ignoring fields on struct (#2842)
247b5536 * swarm-derive/: Remove support for custom poll method (#2841)
ca07ce4d * swarm/behaviour: Remove deprecated NetworkBehaviourEventProcess (#2840)
878c49fa * swarm/src/behaviour: Deprecate NetworkBehaviourEventProcess (#2784)
579b1be5 * swarm-derive/: Generate OutEvent if not provided (#2792)

The `StreamMuxer` trait received some significant simplifications, basically
rewriting the trait as well as its implementation in yamux, mplex and now QUIC
and WebRTC.

cef50568 * core/muxing: Generalise `StreamMuxer::poll_address_change` to `poll` (#2797)
028decec * core/muxing: Have functions on `StreamMuxer` take `Pin<&mut Self>` (#2765)
56c492cf * core/muxing: Drop `Sync` requirement for `StreamMuxer` on `StreamMuxerBox` (#2775)
0ec3bbcc * core/muxing: Remove `Unpin` requirement from `StreamMuxer::Substream` (#2776)
f15a3dc4 * core/muxing: Drop `Unpin` requirement from `SubstreamBox` (#2762)
1a553db5 * core/muxing: Flatten `StreamMuxer` interface to `poll_{inbound,outbound,address_change,close}` (#2724)
eb490c08 * core/muxing: Force `StreamMuxer::Substream` to implement `Async{Read,Write}` (#2707)
ea487aeb * muxers/mplex: Implement `AsyncRead` and `AsyncWrite` for `Substream` (#2706)
3c120ef9 * core/muxing: Introduce `StreamMuxerEvent::map_inbound_stream` (#2691)
04f31cd5 * core/muxing: Introduce `boxed` module (#2703)
2b79f113 * core/muxing: Remove the `StreamMuxer::flush_all` function (#2669)
25c8bc24 * core/muxing: Rename `close` to `poll_close` (#2666)
8361fabb * core/src/muxing: Remove deprecated function (#2665)

Defense against denial-of-service attacks is a cornerstone of a networking
library, especially in the peer-to-peer space. rust-libp2p saw a lot of related
improvements in 2022. We enforce various limits (e.g. on the number of
connections, streams, bytes of a request) and prioritize local work over new
incoming work from a remote across the many layers.

a4d1e588 * swarm/connection: Enforce limit on inbound substreams via `StreamMuxer` (#2861)
5cb4886a * protocols/kad: Limit # of inbound substreams to 32 (#2699)
0d3787ed * protocols/relay: Limit inbound streams (#2698)
2acbb457 * swarm/: Limit negotiating inbound substreams per connection (#2697)
59a74b40 * protocols/dcutr: Upgrade at most one inbound connect request (#2695)
676a6308 * protocols/identify: Allow at most one inbound identify push stream (#2694)
9a5fec87 * swarm/src/connection: Prioritize handler over negotiating streams (#2638)
afc5b8d8 * swarm/src/lib: Prioritize Behaviour over Pool and Pool over Listeners  (#2627)
3e1ed95c * swarm/src/connection: Prioritize handler over connection (#2626)

Understanding large systems is hard. Understanding distributed systems is even
harder. We made understanding large libp2p networks a bit easier in 2022
introducing a metric crate for rust-libp2p exposing Prometheus metrics, e.g. the
time to establish a connection or the protocols supported by peers.

fb45ce37 * fix(metrics): Update connections_establishment_duration buckets (#3256)
f8f19baa * umgefahren/master time to establish connection (#3134)
69efe632 * misc/metrics: Add `protocols` label to address-specific metrics (#2982)
d4f8ec2d * misc/metrics: Track # connected nodes supporting specific protocol  (#2734)

libp2p is an open-community open-source project. What do I mean by that?
libp2p's source code is open (open-source) and that source code is written by an
open community. libp2p is not developed by one or 10 people, but much rather 30
to 50 people across many companies, countries, cultures and development styles.
One thing that allows us to be productive despite the large number of people is
automation. We invested heavily into rust-libp2p's automation, more specifically
our continuous integration setup.

65ec5454 * ci(dependabot): disable automatic rebase of PRs (#3266)
13a59a38 * ci(caching): split caches by matrix variables (#3257)
5fe0dc44 * ci(caching): make caching more effective (#3215)
868c3805 * ci: enforce PR titles to follow the conventional commit specification (#3204)
cbf0a273 * ci(mergify): dismiss approvals on push once `send-it` is applied (#3231)
cafa7344 * .github/: Use `Description` for commit message and add `Notes` (#3082)
cec1a8d2 * docs/release: Document cargo-release process and mention root changelog (#3028)
3371d7ce * .github/workflows: Enforce semver compliance with `cargo semver-checks` (#2647)
1b793242 * .cargo: Run `clippy` on ALL the source files (#2949)
e6da99e4 * .github/workflows: Deny cargo doc warnings in CI (#2936)
217dd2ca * clippy.toml: Create config and disallow unbounded channels (#2823)
09386387 * .github/: Add templates for Issues and PRs (#2611)

rust-libp2p is one implementation of many of the libp2p specification. How do we
ensure we are compatible across implementations? In 2022 we started the libp2p
interoperability project and as of September 2022 we continuously test that the
various versions of go-libp2p and rust-libp2p can connect. In December we added
nim-libp2p, in 2023 we will ad js-libp2p.

a40180c3 * .github/: Introduce interop tests (#2835)

At this point, rust-libp2p is a large complex codebase. In August we added a
coding guideline to the project, allowing us to agree on a set of rules to
enforce consistency across the project and enable newcomers to hit the ground
running. Projects outside of the libp2p realm might find this guideline useful,
as it documents an opinionated style doing asynchronous networking in Rust.

475289c1 * docs/coding-guidelines: Add document (#2780)

We were able to incorporate some of the new shiny Rust features. In November we
introduced a patch using const generics. In December we merged our first pull
request using GATs. Lots more to come.

1765ae03 * feat(kademlia)!: use GATs on `RecordStore` trait (#3239)
2fd49989 * Cargo.toml: Use Rust 1.60.0 and weak dependency for feats (#2646)
a9971816 * protocols/kad: Improve options to efficiently retrieve (#2712)

999a2126 * README.md: Add elenaf9 to Maintainers (#2656)
TODO: Also mention jxs

- Which conferences did we speak at?
- More stats on contributions, number of releases, number of downloads
- What did we not do?

Releasing rust-libp2p turns out to be quite difficult.

TODO: List the many follow-up commits.
- Mistakes on releases: Every release
be0b62a7 * libp2p-swarm-v0.41.1 libp2p-swarm-derive-v0.31.0 libp2p fix(derive): Release breaking change as v0.31.0 (#3178)

Since January the rust-libp2p monorepo has a small CLI tool for libp2p key management.

e38eb09f * misc/keygen: Implement cli tool to handle key material (#2453)

Let's end this post with a document for the future, namely our rust-libp2p
project roadmap. There are lots of exciting features and improvements coming up
in 2023, e.g. improved WASM support, WebRTC browser-to-browser and hopefully an
implementation of the shiny new WebTransport transport.

56a4a946 * Roadmap.md: Discuss the near term future of rust-libp2p (#2997)
