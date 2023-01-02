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

# The rust-libp2p Project A Recap of 2022

The rust-libp2p project has made significant strides in 2022, with numerous technical advancements and improvements to the project itself.
Let's take a closer look at some of the technical highlights and on the meta level developments of the project itself.
Note that while I (Max Inden) am writing this blog post, this is the work of many across various organizations.

## Technical Highlights

We started the year with the release of the various components needed for hole punching.
We added the [Circuit Relay v2 protocol](https://github.com/libp2p/rust-libp2p/pull/2059), [DCUtR protocol](https://github.com/libp2p/rust-libp2p/pull/2438) and [AutoNAT protocol](https://github.com/libp2p/rust-libp2p/pull/2262).
With that rust-libp2p [v0.43.0](https://github.com/libp2p/rust-libp2p/releases/tag/v0.43.0) in February was the first rust-libp2p release with hole punching capabilities.

To improve what we rolled out in the beginning of the year, the libp2p project started the _Hole Punching Measurement Campaign_ aka. _Hole Punching Month_ in collaboration with [ProbeLab](https://research.protocol.ai/groups/probelab/).
A multitude of [clients using both go-libp2p and rust-libp2p](https://github.com/libp2p/punchr/) are currently punching holes across the globe, providing valuable data that we can later on use to improve the libp2p specification and the two implementations.

Over the year we worked on two new transports, namely [WebRTC](https://github.com/libp2p/rust-libp2p/pull/2622) and [QUIC](https://github.com/libp2p/rust-libp2p/issues/2883), which we both released towards the end of the year as alphas.

WebRTC allows browsers to connect to rust-libp2p based servers without those servers having signed TLS certificates.
QUIC is the better TCP+Noise+Yamux in every dimension, e.g. faster connection establishment, better multiplexing, higher hole punching success rates.
Along the way, given that QUIC already requires TLS, [rust-libp2p can now secure TCP connections with TLS as well](https://github.com/libp2p/rust-libp2p/pull/2945) (previously only Noise).

Along the way we tackled many smaller improvements, as a whole having a big impact on the user experience.
To mention a couple: [naming consistency across crates](https://github.com/libp2p/rust-libp2p/issues/2217), [refactoing of the many `inject_*` into a single `enum` event handler in both `NetworkBehaviour` and `ConnectionHandler`](https://github.com/libp2p/rust-libp2p/issues/2832), [deprecation of event-based `PollParameters`](https://github.com/libp2p/rust-libp2p/pull/3153), and the [rework of our Rust feature flags](https://github.com/libp2p/rust-libp2p/pull/2918).
Still remember the old days with the `NetworkBehaviourEventProcess` trait?
[All gone](https://github.com/libp2p/rust-libp2p/pull/2784) in favor of the much simpler (generated) `OutEvent` mechanism.
The `StreamMuxer` trait received numerous significant simplifications, [basically rewriting](https://github.com/libp2p/rust-libp2p/issues/2722) the trait as well as the trait implementation in yamux, mplex and now QUIC and WebRTC.

Defense against denial-of-service attacks is a cornerstone of a networking library, especially in the peer-to-peer space.
rust-libp2p saw a lot of related improvements in 2022.
We enforce various limits (e.g. on the [number of streams](https://github.com/libp2p/rust-libp2p/pull/2697) and bytes of a request) and [prioritize local work over new incoming work from a remote](https://github.com/libp2p/rust-libp2p/pull/2627) across the many layers.
Up next is [a patch](https://github.com/libp2p/rust-libp2p/issues/2824) enabling `NetworkBehaviour` implementations to implement their own connection management strategies.

Understanding large systems is hard.
Understanding distributed systems is even harder.
We made understanding large libp2p networks a bit easier in 2022 introducing a metric crate for rust-libp2p exposing Prometheus metrics, e.g. the [time to establish a connection](https://github.com/libp2p/rust-libp2p/pull/3134) or the [protocols supported by peers](https://github.com/libp2p/rust-libp2p/pull/2734).

Since January the rust-libp2p monorepo has a [handy CLI tool for libp2p key management](https://github.com/libp2p/rust-libp2p/pull/2453).

In general, we keep up with [recent developments of the Rust language], and incorporate some of its new shiny features.
We make use of [Cargo's weak dependencies](https://github.com/libp2p/rust-libp2p/pull/2646). 
In November we introduced [a patch using const generics](https://github.com/libp2p/rust-libp2p/pull/2712) (in tests).
In December we merged our [first pull request using GATs](https://github.com/libp2p/rust-libp2p/pull/3239).

## Meta - Improvements to the Project

libp2p is an open-community open-source project.
What do I mean by that?
libp2p's source code is open-source and that source code is written by an open community.
libp2p is not developed by one or 10 people, but much rather >100 (part-time) people across many organizations.

The core rust-libp2p maintainer team grew from two engineers to four, with [Elena](https://github.com/libp2p/rust-libp2p/pull/2656) and [João](https://github.com/libp2p/rust-libp2p/pull/3295) joining the team. Beyond the core maintainers, a total of 70 people contributed to rust-libp2p's `master` branch in 2022.

One thing that allows us to be productive despite the large number of people contributing to the project is automation.
We invested heavily into rust-libp2p's automation.

Big quality of life improvement was the [introduction of mergify](https://github.com/libp2p/rust-libp2p/pull/3026).
We enforce semver compliance via [`cargo-semver-checks`](https://github.com/libp2p/rust-libp2p/pull/2647).
We adopted [conventional commit](https://github.com/libp2p/rust-libp2p/pull/3204) convention.
We did a [large refactoring of the CI job structure](https://github.com/libp2p/rust-libp2p/pull/3090), testing crates individually, thus increasing parallelism, improving caching and catching interdependency issues.

rust-libp2p is one implementation of many of the libp2p specification.
How do we ensure we are compatible across implementations?
In 2022 we started the libp2p interoperability project and as of [September 2022 we continuously test](https://github.com/libp2p/rust-libp2p/pull/2835) that the various versions of go-libp2p and rust-libp2p can connect. In December we added nim-libp2p, in 2023 we will ad js-libp2p.

At this point, rust-libp2p is a large complex codebase.
In August we added a [coding guideline](https://github.com/libp2p/rust-libp2p/pull/2780) to the project, allowing us to agree on a set of rules to enforce consistency across the project and enable newcomers to hit the ground running.
Projects outside of the libp2p realm might find this guideline useful, as it documents an opinionated way of doing asynchronous networking in Rust.

In 2022 we published 9 releases of the main `libp2p` crate and a total of 268 releases across the workspace including sub-crates and patch releases.

## What's Next?

To conclude this post, it's worth mentioning the rust-libp2p [project roadmap](https://github.com/libp2p/rust-libp2p/blob/master/ROADMAP.md), which [was added in October](https://github.com/libp2p/rust-libp2p/pull/2997) and outlines the planned developments for the project in the future.
Some notable features to look forward to in 2023 include improved WASM support, the WebRTC browser-to-browser feature, and the potential implementation of the new WebTransport transport.
