---
tags:
- browser
- transport
- webrtc
title: WebRTC in libp2p
description:
date:
permalink: ""
translationKey: ''
header_image: /libp2p_WebRTC_blog_header-1.png
author: David Di Maria
---


# WebRTC (Browser-to-Server) in libp2p

<!--
WebTransport in libp2p: Part 1 of Universal Browser Connectivity
WebRTC (Browser to Server): Part 2 of Universal Browser Connectivity
WebRTC (Browser to Browser): Part 3 of Universal Browser Connectivity
-->
This is the second entry in the Universal Browser Connectivity series on how libp2p achieves browser connectivity.
Read about WebTransport in the [first post](https://blog.libp2p.io/2022-12-19-libp2p-webtransport/).

**Table of Contents**


[[toc]]

## Overview

The [libp2p project](https://libp2p.io) supports many [transport protocols](https://libp2p.io/implementations/#transports) across a variety of implementations.
These transport protocols enable applications using libp2p to run as server nodes (on a personal laptop or in a datacenter) or as browser nodes (inside a Web browser).

Historically, libp2p has bridged these runtime environments with different node connectivity options to varying degrees:
- server node to server node via TCP and QUIC;
- browser node to server node via WebSockets and, more recently, [WebTransport](https://blog.libp2p.io/2022-12-19-libp2p-webtransport);
- browser node to browser node (via [less than ideal solutions](#prior-webrtc-implementations).

Today our focus is on advancements in the **browser to server** use case...🥁*drumroll*

We're excited to present a new paradigm for browser-to-server connectivity and announce,

**native support for WebRTC now exists in libp2p!**

Browser to server offerings, old and new, came with their own set of shortcomings.
A new libp2p WebRTC solution establishes browser-to-server connectivity in a decentralized way across a broad spectrum of browsers and in multiple libp2p implementations.

> If you're familiar with the libp2p ecosystem, you may wonder, is this new? Hasn't there already been support for WebRTC in libp2p? The answer to both questions is **yes** - although support has existed, this new WebRTC solution is a fresh departure from older uses for WebRTC in libp2p. We describe more below.

## Acknowledgements

We would like to recognize and express our gratitude to [Little Bear Labs](https://littlebearlabs.io/) and [Parity Technologies](https://www.parity.io/) for their contributions to the development of the WebRTC specification and implementation in libp2p.

Little Bear Labs worked in collaboration with Protocol Labs and the libp2p community to define the WebRTC specification, and also focused on the Go and JavaScript implementations. Meanwhile, Parity Technologies focused on the Rust implementation and initiated this effort [several years ago](https://github.com/paritytech/smoldot/issues/1712). We appreciate the time and effort that both of these organizations have put into this project, and their invaluable input has been instrumental in its success.
First, kudos to [Little Bear Labs](https://littlebearlabs.io/), who teamed up with Protocol Labs and the libp2p community to define the WebRTC specification and work on the implementation. Second, thanks to [Parity Technologies](https://www.parity.io/) for helping initiate this effort [many years ago](https://github.com/paritytech/smoldot/issues/1712) and for all the valuable input on the specification and Rust implementation.

Before diving into the details of the WebRTC implementation in libp2p, let's first understand what WebRTC is and how it is used in the context of browser-based use cases.

## WebRTC in the browser

WebRTC, or Web Real-Time Communication, is a [set of standards](https://w3c.github.io/webrtc-pc/) that enables peer-to-peer connections between browsers, clients, and servers and the exchange of audio, video, and data in real-time. It is built directly into modern browsers and is straightforward to use via its API.

While WebRTC handles audio, video, and data traffic, we're just going to focus on the data aspect because that's the API leveraged in libp2p-webrtc.

In most cases, peers directly connect to other peers, improving privacy and requiring fewer hops than on a relay. Peers connect via an [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) interface. Once connected, [RTCDataChannels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) can be added to the connection to send and receive binary data.

To connect to each other, peers need to learn their public IP address and any router restrictions along the path that would prohibit peer-to-peer communication. WebRTC specifies the [STUN](https://datatracker.ietf.org/doc/html/rfc3489) protocol for that. In the case of a restriction, [TURN](https://datatracker.ietf.org/doc/html/rfc8656) servers relay data between peers using a Signaling Channel. In libp2p, we don't use these protocols.

Once IP addresses are obtained, a peer sends an Offer [SDP](https://datatracker.ietf.org/doc/html/rfc4566) to the other peer. This Offer SDP details how the initiating peer can communicate (IP address, protocols, fingerprints, encryption, etc.). The other peer sends an Answer SDP to the initiating peer. Both peers now have enough information to start the DTLS handshake.

The DTLS handshake is performed using fingerprints contained in the Offer and Answer SDPs. After the handshake is complete, data is sent between peers using the SCTP (Stream Control Transmission Protocol) protocol, encrypting messages with DTLS over UDP or TCP.


## WebRTC in libp2p

<!--
participantspacing 20
entryspacing 0.75

participant Browser
participant Server
box over Server: Generate TLS Certificate
box over Server: Listen on UDP Port
box over Browser: Create RTCPeerConnection
box over Browser: Create Server's Answer SDP
box over Browser: Create Offer SDP
Browser->Server:STUN Binding Request
box over Server: Create Browser's Offer SDP

Server->(1)Browser:DTLS Handshake
Browser->(1)Server:DTLS Handshake
box over Browser,Server: Full DTLS Handshake is 3 round trips

Server->(1)Browser:Libp2p Noise Handshake
Browser->(1)Server:Libp2p Noise Handshake


Browser<->Server:Multiplex Send/Receive Framed Data
-->
![](https://i.imgur.com/jF69zwh.png)

Connecting to a server from a browser in the WebRTC implementation in libp2p has some similarities but differs in several ways.  Many of the features supported in the WebRTC standard, such as video, audio, and STUN and Turn servers, are not needed in libp2p. The primary WebRTC component that libp2p leverages is the [RTCDataChannels(https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel).

### Server Setup
To establish a connection with the browser, the server performs the following steps:

1. Generates a self-signed TLS certificate.
1. Listens on a UDP port for incoming STUN packets.

### Browser Connection
The browser initiates the connection by performing the following actions:

1. Assembles the multiaddress of the server, which is either known upfront or discovered.
1. Creates an [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection).
1. Generates the server's Answer SDP using the components in the multiaddress.
1. Modifies the SDP, or "munges" it, to include an auto-generated ufrag and password, as well as the server's IP and port.
1. Creates an Offer SDP and modifies it with the same values.
1. Sets the Offer and Answer SDP on the browser, which triggers the sending of STUN packets to the server.


### Server Response
The server responds by creating the browser's Offer SDP using the values in the STUN Binding Request.

### DTLS Handshake
The browser and server then engage in a DTLS handshake to open a DTLS connection that WebRTC can run SCTP on top of. A [Noise handshake](https://github.com/libp2p/specs/blob/master/noise/README.md) is initiated by the server using the fingerprints in the SDP as input to the [prologue data](https://noiseprotocol.org/noise.html#prologue), and completed by the browser over the Data Channel. This handshake authenticates the browser and the server, although Noise is not used for the encryption of data. A total of six roundtrips are performed.

Once the DTLS and Noise handshakes are complete, DTLS-encrypted SCTP data is ready to be exchanged over the UDP socket.

> :bulb: Unlike standard WebRTC, signaling is completely removed in libp2p browser-to-server communication, and Signal Channels are not needed. Removing signaling results in fewer roundtrips to establish a Data Channel and reduces complexity by eliminating the need for signaling.

#### Message Framing

Since the browser's implementation of WebRTC doesn't support stream resets or half-closing of streams, message framing was implemented on the data channels to achieve those goals.

#### Multiaddress

The [multiaddress](https://docs.libp2p.io/concepts/fundamentals/addressing/) of a WebRTC address begins like a standard UDP address, but adds three additional protocols: `webrtc`, `hash`, and `p2p`.

```shell
/ip4/1.2.3.4/udp/1234/webrtc/certhash/<hash>/p2p/<peer-id>
```

* `webrtc`: the name of this transport
* `hash`: the [multihash](https://github.com/multiformats/multihash) of the certificate used in the DTLS handshake
* `p2p`: the peer-id of the libp2p node (optional)

### Benefits

#### Self-signed Certificate

WebRTC enables browsers to connect to public libp2p nodes without the nodes requiring a TLS certificate in the browser's [certificate chain](https://en.wikipedia.org/wiki/X.509#Certificate_chains_and_cross-certification). WebRTC allows the server to use a self-signed TLS certificate, eliminating the need for additional services like DNS and Let's Encrypt.

#### Broad support

WebRTC has been supported in Chrome since 2012, and support has since been added to all [evergreen browsers](https://caniuse.com/?search=webrtc). This makes WebRTC widely available and easy to implement in libp2p.

### Limitations

While WebRTC has several advantages, it also has some limitations to consider:

#### Setup and configuration

WebRTC is a complex set of technologies that requires extensive setup and configuration. This can be a drawback for some users.

#### Extensive Roundtrips

Another limitation is the 6 roundtrips required before data is exchanged. This may make other transports, such as [WebTransport](https://docs.libp2p.io/concepts/transports/webtransport/), more appealing for certain use cases where the browser supports it.

### Usage

The complexity of WebRTC is abstracted in the libp2p implementations, making it easy to swap in WebRTC as the transport. In the JavaScript implementation, for example, all you need to do is initialize with: 

```javascript
import { webRTC } from 'js-libp2p-webrtc'

const node = await createLibp2p({
  transports: [webRTC()],
  connectionEncryption: [() => new Noise()],
});
```

The only difference from other transports is initializing with `webRTC()`.  That's all you need to do to implement WebRTC in the browser.  Easy, right?
## Alternative transports

WebRTC is just one option for connecting browsers to libp2p nodes. libp2p supports a variety of transports, and choosing the right one for your use case is an important consideration. The [libp2p connectivity site](https://connectivity.libp2p.io/) was designed to help developers to consider the available options.

### WebSocket

The WebSocket protocol, defined in the [WebSocket RFC](https://datatracker.ietf.org/doc/html/rfc6455), allows for the opening of a two-way socket between a browser and a server over TCP. It is supported in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/websocket), [Go](https://github.com/libp2p/go-libp2p/tree/master/p2p/transport/websocket), and [JavaScript](https://github.com/libp2p/js-libp2p-websockets) libp2p implementations.

#### Limitations

One limitation of WebSocket is the number of roundtrips required to establish a connection. Handshakes and other upgrades add up to six roundtrips, which can be slower than other transports. Additionally, WebSocket requires the server to have a trusted TLS certificate using TCP, unlike WebRTC which can use a self-signed certificate.

### WebTransport

[WebTransport](https://datatracker.ietf.org/doc/html/draft-ietf-webtrans-overview) is the new kid on the block for communication in the browser. WebTransport is implemented in [Go](https://github.com/libp2p/go-libp2p/tree/master/p2p/transport/webtransport) and [JavaScript](https://github.com/libp2p/js-libp2p-webtransport) implementations. 

#### Benefits

WebTransport has many of the same benefits as WebRTC, such as fast, secure, and multiplexed connections, without requiring servers to implement the stack. It also allows libp2p to use raw WebTransport streams and avoid double encryption. Additionally, WebTransport requires fewer roundtrips to establish a connection than WebRTC, making it the preferred choice when supported.

As opposed to WebSockets, libp2p can use raw WebTransport streams and avoid the need for double encryption.

#### Limitations

You might be asking yourself, why pick WebRTC over WebTransport in libp2p? It's like WebRTC but easier to implement and with less complexity. Still, WebTransport is not without its limitations.

Currently, it is only implemented in Chrome and is still under development. Until WebTransport is supported by all major browsers, WebRTC can serve as a good fallback option.

## Legacy WebRTC implementations in libp2p

This new implementation of WebRTC in libp2p is a departure from previous, less effective solutions that were previously used to establish connectivity.

### libp2p-webrtc-star

libp2p-webrtc-star was [released]( https://github.com/libp2p/js-libp2p-webrtc-star/releases/tag/v0.5.0) in 2016. This transport utilizes centralized STUN and TURN servers to handle signaling and was [never intended](https://github.com/libp2p/js-libp2p/issues/385) to be a long-term solution. The repository was archived in November in favor of the new js-libp2p-webrtc transport due to the dependence on centralized servers. 

### libp2p-webrtc-direct

libp2p-webrtc-direct utilizes WebSockets to exchange SDPs, removing the need for centralized dependency in libp2p-webrtc-star. While libp2p-webrtc-direct solved the centralized problem, the servers must have valid TLS certificates for WebSocket connectivity. The repository was archived in November.

## Can I use WebRTC now?

Yes, you can use libp2p-webrtc in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/webrtc) and [JavaScript](https://github.com/libp2p/js-libp2p-webrtc) implementations!  The [Go](https://github.com/libp2p/go-libp2p) implementation is close to completion.  Follow the [development in go-libp2p](https://github.com/libp2p/go-libp2p/pull/1655) to get notified when it gets shipped.

In fact, the Rust implementation of WebRTC has already been put into use by the Parity team!
It has been enabled as an experimental feature and added to [Smoldot](https://github.com/paritytech/smoldot/issues/1712) (a lightweight client for [Substrate](https://substrate.io/) and [Polkadot](https://polkadot.network/).
There is also [ongoing work to enable it directly in Substrate](https://github.com/paritytech/substrate/pull/12529).

This is exciting news as WebRTC is already contributing to Parity's [roadmap to enable browser to server connectivity](https://github.com/paritytech/substrate/issues/7467) on their network!

## What's next?

WebRTC offers the capability for browsers to connect to browsers 🎉. This isn't currently possible in any of the active libp2p transports and represents a significant achievement in libp2p.

The [WebRTC browser-to-browser connectivity spec](https://github.com/libp2p/specs/pull/497) is currently being authored and development will soon start. Follow the [PR](https://github.com/libp2p/specs/pull/497) for up-to-date information.

## Resources and how you can help contribute

If you would like to read further about WebRTC. Please see the libp2p:

- [WebRTC Docs](https://github.com/libp2p/docs/pull/264)
- [WebRTC Connectivity](https://connectivity.libp2p.io/#webrtc)
    - This describes WebRTC along with other transport implementations
- [WebRTC Spec](https://github.com/libp2p/specs/tree/master/webrtc)

If you would like to contribute, please [connect with the libp2p maintainers](https://libp2p.io/#community).


Thank you for reading!