---
tags:
  - libp2p
  - Go
title: go-libp2p in 2022
description:
date: 2023-01-11
permalink: ''
translationKey: ''
header_image: /
author: Prithvi Shahi
---

2022 has been a year full of accomplishments for the libp2p project. Today we'd like to catch you up on advancements made within [go-libp2p](https://github.com/libp2p/go-libp2p). From exciting developments like shipping new features, to necessary work like organizing code, 2022 had it all. Overall we had seven releases ranging from [v0.18.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.18.0) to [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0), with a number of patch releases in between.

The go-libp2p engineering team also doubled in size when [Marco](https://github.com/MarcoPolo) joined early in the year. Alongside [Marten](https://github.com/marten-seemann) that made us a team of two 😀! Overall, we had [21 contributors](https://github.com/libp2p/go-libp2p/graphs/contributors?from=2022-01-01&to=2022-12-31&type=c) to the project.

Without further ado, let's take a look at notable accomplishments in the last year:

## New Features ✨

### Transport Protocols 🚚

#### WebTransport 📡

One of the most exciting features go-libp2p shipped was support for the new WebTransport protocol in [v0.23.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.23.0)! This enabled browser-to-server connectivity in go-libp2p (when paried with a peer running [js-libp2p-webtransport](https://www.npmjs.com/package/@libp2p/webtransport) in the browser.)

To learn more about this <u>please read our blog post</u>: [WebTransport in libp2p](https://blog.libp2p.io/2022-12-19-libp2p-webtransport/).

#### WebRTC (Browser to Server) 🛰️

Although we didn't ship this in 2022, we'd be remiss to count out the fact that go-libp2p started work on enabling the [WebRTC transport](https://github.com/libp2p/specs/tree/master/webrtc#browser-to-public-server). This work was done in partnership with [Little Bear Labs](https://littlebearlabs.io/).

Together with Protocol Labs, Little Bear Labs showcased a demo that showed how WebRTC enabled connectivity between go-libp2p server nodes and js-libp2p browser nodes (running [js-libp2p-webrtc](https://github.com/libp2p/js-libp2p-webrtc)).
Check out the [proof-of-concept demo here](https://blog.libp2p.io/2022-11-22-libp2p-day-2022-recap/#why-webrtc).

This feature is still under development and testing. We expect it to land in go-libp2p in 2023 Q1.

#### QUIC 🐰

Support for QUIC has been in go-libp2p for some time. However, we were only supporting the [draft-29 version](https://datatracker.ietf.org/doc/html/draft-ietf-quic-transport-29). This last year, QUIC also landed in [rust-libp2p](). This provided us motivation to update to [RFC 9000](https://datatracker.ietf.org/doc/html/rfc9000) in v0.24.0.

<!-- To learn more about how different versions of QUIC work please read: https://github.com/libp2p/docs/pull/238 -->
<!-- above docs is a blocker for merge -->

### More Efficient Handshakes 🤝

In the second half of 2022, the go-libp2p team began working to decrease time to first byte and increase the speed of connection establishment (for transports that don't have native stream multiplexing i.e., TCP and WebSocket). The first part of this effort was the [Early Muxer Negotiation feature](https://github.com/libp2p/specs/blob/master/connections/inlined-muxer-negotiation.md).

In [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0), go-libp2p added optimized muxer selection via [TLS' ALPN extension](https://github.com/libp2p/specs/blob/master/connections/inlined-muxer-negotiation.md#multiplexer-negotiation-over-tls) and [Noise extensions](https://github.com/libp2p/specs/blob/master/connections/inlined-muxer-negotiation.md#multiplexer-negotiation-over-noise).
This resulted in a net saving one round trip, which may seem minimal but is big waste during connection establishment!

<!-- To learn more about how early muxer negotiation works, please read: https://github.com/libp2p/docs/pull/274 -->
<!-- above docs is a blocker for merge -->

## Project Improvements 🏡

### DoS Protection 🏰 & Resource Management 📦

We added the [Resource Manager component](https://github.com/libp2p/go-libp2p/tree/master/p2p/host/resource-manager#readme) in [v0.18.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.18.0). This enabled configuring limits to control the number of incoming & outgoing connections and streams, the number of streams per protocol & service, as well as configuring libp2p memory usage.

Furthermore, go-libp2p also added autoscaling limits and canonical log lines in [v0.21.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.21.0).
All of these are key to DoS mitigation. Please read our documentation on [how you can incorporate DoS mitigation into libp2p](https://docs.libp2p.io/concepts/security/dos-mitigation/).

### Interoperability Testing ⚙️

libp2p implementations in different languages support a wide variety of modules (i.e., transport protocols, stream multiplexers, secure channels, etc.). Furthermore, due to the advent of multiple new transports (like WebTransport, WebRTC), we began a concerted effort to test interoperability between go-libp2p and implementations in other languages (like Rust, JS, and Nim.)

The details of our interoperability testing efforts can be seen in the shared [libp2p/test-plans Roadmap](https://github.com/libp2p/test-plans/blob/master/ROADMAP.md#a-multi-dimensional-testinginterop-visibility).

### Monorepo Consolidation 1️⃣

go-libp2p is a monorepo as of the [v0.22.0 release](https://github.com/libp2p/go-libp2p/releases/tag/v0.22.0).

This effort was initiated to address repo sprawl and consolidate go-libp2p modules; the result was a monorepo and a big quality of life improvement. The go-libp2p maintainers always wanted to address sprawl but it wasn’t possible until started after [lazy module loading was added to Go 1.17](https://go.dev/ref/mod#lazy-loading).
The consolidation started in [v0.18.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.18.0) and finished in v0.22.0 release (where go-libp2p-core was finally migrated.)

### Simplify libp2p Setup Logic with Fx 🦄

In [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0) go-libp2p included a change to use [Fx](https://github.com/uber-go/fx), a Go dependency injection library.
This enabled simplyfying the logic necessary to [construct libp2p](https://github.com/libp2p/go-libp2p/pull/1858).

### AutoRelay discovers Circuit Relay v2 🔭

The [v0.19.0 release](https://github.com/libp2p/go-libp2p/releases/tag/v0.19.0) enabled AutoRelay to discover nodes running Circuit Relay v2. Support for relay v2 was first added in [late 2021 in v0.16.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.16.0) (which also removed support for relay v1 and added the [Direct Connenction Upgrade through Relay](https://github.com/libp2p/specs/blob/master/relay/DCUtR.md) protocol.)

### Contributions to other projects 🧑‍💻

A lot of features and changes in go-libp2p motivated (and necessitated) making contributions to other projects.
Chief among these are [quic-go](https://github.com/lucas-clemente/quic-go), [webtransport-go](https://github.com/quic-go/webtransport-go), and [pion/sctp](https://github.com/pion/sctp) & [pion/datachannel](https://github.com/pion/datachannel).

## Plans for 2023 📅

Our plans for the next year can be found in [our go-libp2p Roadmap](https://github.com/libp2p/go-libp2p/blob/master/ROADMAP.md).
If you have suggestions, please feel free to create a PR or make a suggestion [in this tracking issue](https://github.com/libp2p/go-libp2p/issues/1806).

Key areas go-libp2p of focus are:

- Interoperability and end-to-end testing
- Expanding seamless browser connectivity
- Adding support for libp2p + HTTP
- Optimizing performance
- Better observability with metrics

## Resources and how you can help contribute 💪

If you would like to contribute, please [connect with the libp2p maintainers](https://libp2p.io/#community).
If want to start pushing code immediately, feel free to ping the maintainers in [any of these help wanted/good first issues](https://github.com/libp2p/go-libp2p/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).

If you would like to learn more about libp2p, please see the libp2p:

- [Docs](https://docs.libp2p.io/)
- [Connectivity Website](https://connectivity.libp2p.io/)
  - This describes the various libp2p transport implementations
- [libp2p Specifications](https://github.com/libp2p/specs/)

Thank you for reading! 🙏
