---
tags:
  - libp2p
  - update
  - Go
title: go-libp2p in 2022
description:
date: 2023-01-11
permalink: ''
translationKey: ''
header_image: /
author: Prithvi Shahi
---

We are excited to share with you all the progress that has been made on [go-libp2p](https://github.com/libp2p/go-libp2p) in 2022. It has been a year full of exciting new features, code organization, and a growing team of talented contributors.

Throughout the year, we released seven updates to go-libp2p ranging from [v0.18.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.18.0) to [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0), with a number of patch releases in between. We also welcomed [Marco](https://github.com/MarcoPolo) to the go-libp2p engineering team, bringing the total number of team members to two (alongside [Marten](https://github.com/marten-seemann))😀. In total, we had [21 contributors](https://github.com/libp2p/go-libp2p/graphs/contributors?from=2022-01-01&to=2022-12-31&type=c) to the project in 2022.

Without further ado, let's take a look at notable accomplishments in the last year:

## New Features ✨

### Transport Protocols 🚚

#### WebTransport 📡

One of the most exciting developments of the year was the release of the WebTransport protocol in [v0.23.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.23.0). WebTransport enables browser-to-server connectivity in go-libp2p when paired with a peer running [js-libp2p-webtransport](https://www.npmjs.com/package/@libp2p/webtransport) in the browser.

To learn more about this exciting feature, check out our blog post on [WebTransport in libp2p](https://blog.libp2p.io/2022-12-19-libp2p-webtransport/) and the [WebTransport documentation](https://docs.libp2p.io/concepts/transports/webtransport/).

#### WebRTC (Browser to Server) 🛰️

In addition to WebTransport, the go-libp2p team also began work on enabling the WebRTC transport, in partnership with Little Bear Labs. This new transport will allow for connectivity between go-libp2p server nodes and js-libp2p browser nodes using [js-libp2p-webrtc](https://github.com/libp2p/js-libp2p-webrtc). 

While this feature is still under development and testing, you can check out a proof-of-concept demo of it in action on our [libp2p Day 2022 Recap blog post](https://blog.libp2p.io/2022-11-22-libp2p-day-2022-recap/#why-webrtc). 

We expect to release this feature in Q1 2023.


#### QUIC 🐰

We also made developments to the existing QUIC implementation in go-libp2p. In go-libp2p, we mainted support for two versions of QUIC, [RFC 9000](https://datatracker.ietf.org/doc/) and the [draft-29 version](https://datatracker.ietf.org/doc/html/draft-ietf-quic-transport-29). In [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0)), did two things. The first was properly distinguish between these two QUIC versions in their multiaddress and second change the default dial behavior. Previously, go-libp2p nodes would dial draft-29 by default but now prefer the new QUIC version. This was partly inspired by the [alpha release of the QUIC implementation in rust-libp2p](https://github.com/libp2p/rust-libp2p/releases/tag/v0.50.0).

<!-- To learn more about how different versions of QUIC work please read: https://github.com/libp2p/docs/pull/238 -->
<!-- above docs is a blocker for merge -->

### Faster Handshakes 🤝

In the second half of 2022, the go-libp2p team began working to decrease the TTFB (time to first byte) and increase the speed of connection establishment (for transports that don't have native stream multiplexing like TCP and WebSocket). The first part of this effort was the [Early Muxer Negotiation feature](https://github.com/libp2p/specs/blob/master/connections/inlined-muxer-negotiation.md).

In [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0), go-libp2p added optimized muxer selection via [TLS' ALPN extension](https://github.com/libp2p/specs/blob/master/connections/inlined-muxer-negotiation.md#multiplexer-negotiation-over-tls) and [Noise extensions](https://github.com/libp2p/specs/blob/master/connections/inlined-muxer-negotiation.md#multiplexer-negotiation-over-noise).
This resulted in a net saving one round trip, which may seem minimal but is big waste during connection establishment!

<!-- To learn more about how early muxer negotiation works, please read: https://github.com/libp2p/docs/pull/274 -->
<!-- above docs is a blocker for merge -->

## Project Improvements 🏡

### DoS Protection 🏰 & Resource Management 📦

We added the [Resource Manager component](https://github.com/libp2p/go-libp2p/tree/master/p2p/host/resource-manager#readme) in [v0.18.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.18.0). This feature allows developers to configure limits on the number of incoming and outgoing connections and streams, the number of streams per protocol and service, as well as configure libp2p memory usage.

These controls are key for DoS mitigation, which is why we also added autoscaling limits and canonical log lines in [v0.21.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.21.0). 
To learn more about how to incorporate DoS mitigation into your libp2p projects, check out our documentation on the topic [here](https://docs.libp2p.io/concepts/security/dos-mitigation/).

### Interoperability Testing ⚙️

We also began a concerted effort to improve interoperability between go-libp2p and libp2p implementations in other languages, such as Rust, JS, and Nim. With the addition of new transports like WebTransport and WebRTC, it is important to ensure that these different implementations can work together seamlessly.

The details of our interoperability testing efforts can be seen in the shared [libp2p/test-plans Roadmap](https://github.com/libp2p/test-plans/blob/master/ROADMAP.md#a-multi-dimensional-testinginterop-visibility).

### Monorepo Consolidation 1️⃣

**go-libp2p is a monorepo as of the [v0.22.0 release](https://github.com/libp2p/go-libp2p/releases/tag/v0.22.0).**

In attempt to address the go-libp2p repo sprawl and consolidate various modules, a monorepo was created that resulted in a big quality of life improvement for the project. The go-libp2p maintainers always wanted to address the sprawl but it wasn’t possible until [lazy module loading was added to Go 1.17](https://go.dev/ref/mod#lazy-loading).
The consolidation started in [v0.18.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.18.0) and finished in [v0.22.0 release](https://github.com/libp2p/go-libp2p/releases/tag/v0.22.0) (where go-libp2p-core was finally migrated.)

### Simplify libp2p Setup Logic with Fx 🦄

In [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0) go-libp2p included a change to use [Fx](https://github.com/uber-go/fx), a Go dependency injection library.
This enabled simplyfying the logic necessary to [construct libp2p](https://github.com/libp2p/go-libp2p/pull/1858).

### AutoRelay discovers Circuit Relay v2 🔭

In [v0.19.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.19.0), we enabled AutoRelay to discover nodes running Circuit Relay v2. Support for relay v2 was first added in [late 2021 in v0.16.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.16.0) (which also removed support for relay v1 and added the [Direct Connection Upgrade through Relay](https://github.com/libp2p/specs/blob/master/relay/DCUtR.md) protocol). This improvement allows go-libp2p nodes to discover and connect to other nodes running Circuit Relay v2, improving the overall performance and reliability of the network.

### Contributions to other projects 🧑‍💻

In addition to the improvements made directly to go-libp2p, we also made a number of contributions to other projects in 2022.
Chief among them were [quic-go](https://github.com/lucas-clemente/quic-go), [webtransport-go](https://github.com/quic-go/webtransport-go), along with [pion/sctp](https://github.com/pion/sctp) and [pion/datachannel](https://github.com/pion/datachannel). These contributions helped progress network protocol development in go and improve the overall ecosystem.

## Plans for 2023 📅

As we look ahead to 2023, we have a number of exciting plans for go-libp2p. Our primary focus areas for the next year can be found in [our go-libp2p Roadmap](https://github.com/libp2p/go-libp2p/blob/master/ROADMAP.md). We encourage the developer community to review the roadmap and provide feedback and suggestions. You can do so by creating a pull request or by making a suggestion [in this tracking issue](https://github.com/libp2p/go-libp2p/issues/1806).

Key areas of focus:

- Interoperability and end-to-end testing
- Expanding seamless browser connectivity
- Adding support for libp2p + HTTP
- Optimizing performance
- Better observability with metrics

## Resources and how you can help contribute 💪

We always welcome contributions from the community! If you would like to get involved and help contribute to go-libp2p, there are a few ways you can do so.
To start, you can [connect with the libp2p maintainers](https://libp2p.io/#community) to learn more about the project and find out how you can get involved.

If you're ready to start pushing code immediately, you can also check out [any of these help wanted/good first issues](https://github.com/libp2p/go-libp2p/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) and start contributing right away. The libp2p maintainers are always happy to provide guidance and support to new contributors.

If you would like to learn more about libp2p, there are a number of resources available for you:

The [libp2p documentation](https://docs.libp2p.io/) provides a comprehensive overview of the libp2p project and its core components.
- The [Connectivity website](https://connectivity.libp2p.io/) describes the various libp2p transport implementations.
The [libp2p Specifications](https://github.com/libp2p/specs/) provide in-depth technical information about the various protocols and standards that underpin libp2p.

Thank you for reading! 🙏
