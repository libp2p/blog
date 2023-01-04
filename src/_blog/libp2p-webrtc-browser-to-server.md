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
header_image: /_.png
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

Before going further, we'd like to acknowledge the organizations involved in this breakthrough.
First, kudos to [Little Bear Labs](https://littlebearlabs.io/), who teamed up with Protocol Labs and the libp2p community to define the WebRTC specification and work on the implementation. Second, thanks to [Parity Technologies](https://www.parity.io/) for helping initiate this effort [many years ago](https://github.com/paritytech/smoldot/issues/1712) and for all the valuable input on the specification and Rust implementation.
Parity Technologies authored the [Rust](https://github.com/libp2p/rust-libp2p) implementation. Little Bear Labs focused on the [Go](https://github.com/libp2p/go-libp2p) and [JavaScript](https://github.com/libp2p/js-libp2p-webrtc) implementations. Protocol Labs led the specification work and provided reviews of the implementations.

Without further ado, let's begin by introducing WebRTC and how it's currently used. Then we'll dive deep into the WebRTC implementation within libp2p.

## WebRTC in the browser

`Web Real-Time Communication`, commonly referred to as `WebRTC`, is a [set of standards](https://w3c.github.io/webrtc-pc/) that allows browsers, clients, and servers to connect to other peers to exchange audio, video, and data. In most cases, peers directly connect to other peers, improving privacy and requiring fewer hops than on a relay.

While WebRTC handles audio, video, and data traffic, we're just going to focus on the data aspect because that's the API leveraged in libp2p-webrtc.

WebRTC is built directly into browsers, so using the API is straightforward. Peers connect via an [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) interface. Once connected, [RTCDataChannels](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) can be added to the connection to send and receive binary data.

Peers use external [STUN](https://datatracker.ietf.org/doc/html/rfc3489) servers to determine their public address and any router restrictions that prohibit peer-to-peer communications. In the case of a restriction, [TURN](https://datatracker.ietf.org/doc/html/rfc8656) servers relay data between peers using a Signaling Channel.

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
Server->(1)Browser:DTLS Handshake
Browser->(1)Server:DTLS Handshake

Server->(1)Browser:libp2p Noise Handshake
Browser->(1)Server:libp2p Noise Handshake


Browser<->Server:Multiplex Send/Receive Framed Data
-->
![](https://i.imgur.com/m7SdrC0.png)

Connecting to a server from a browser in the WebRTC implementation in libp2p has some similarities but differs in several ways.

Many of the features supported in the WebRTC standard, such as video, audio, and STUN and Turn servers, are not needed in libp2p.  The primary WebRTC component that libp2p leverages is the [RTCDataChannels(https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel).

The server first generates a self-signed TLS certificate and listens on a UDP port for incoming STUN packets.  Whether known upfront or discovered, the assembled multiaddress of the server is an input into the browser.

The browser creates a [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection). The browser creates the server's Answer SDP using the components in the multiaddress. The SDP is edited, or `munged`, to include an auto-generated ufrag and password and the server's components (IP and Port). Similarly, the browser creates an Offer SDP and munges it with the same values. 

Setting the Offer and Answer SDP on the browser triggers the sending of STUN packets to the server.  The server then creates the browser's Offer SDP using the values in the STUN Binding Request. 

The browser and server then engage in a DTLS handshake, opening a DTLS connection that WebRTC can run SCTP on top of.  A [Noise handshake](https://github.com/libp2p/specs/blob/master/noise/README.md) is initiated by the server using the fingerprints in the SDP as inputs to the [prologue data](https://noiseprotocol.org/noise.html#prologue) and completed by the browser over the Data Channel. This handshake authenticates the browser, though Noise is not utilized for the encryption of data.  A total of 6 roundtrips are performed.  DTLS-encrypted SCTP data is now ready to be exchanged over the UDP socket.  

In contrast to standard WebRTC, signaling is completely removed in libp2p browser-to-server communication, and that Signal Channels aren't needed. Removing signaling results in fewer roundtrips to establish a Data Channel and the added complexity of creating signaling. Additionally, in standard WebRTC, where Signal Channels were needed due to router restrictions, latency is lowered on all traffic using direct communication in libp2p.

#### Message Framing

Since WebRTC doesn't support stream resets or half-closing of streams, messaging framing was implemented on the data channels to achieve those goals.  Encoded Protobuf messages are sent in the following format:

```proto
message Message {
  enum Flag {
    FIN = 0;
    STOP_SENDING = 1;
    RESET_STREAM = 2;
  }
  optional Flag flag = 1;
  optional bytes message = 2;
}
```

#### Multiaddress

The [multiaddress](https://docs.libp2p.io/concepts/fundamentals/addressing/) of a WebRTC address begins like a standard UDP address, but adds three additional components: `webrtc`, `hash`, and `p2p`.

```shell
/ip4/1.2.3.4/udp/1234/webrtc/certhash/<hash>/p2p/<peer-id>
```

* `webrtc`: the name of this transport
* `hash`: the [multihash](https://github.com/multiformats/multihash) of the certificate used in the DTLS handshake
* `p2p`: the peer-id of the libp2p node (optional)

### Benefits

#### Self-signed Certificate

WebRTC enables browsers to connect to public libp2p nodes without the nodes requiring a TLS certificate in the browser's [certificate chain](https://en.wikipedia.org/wiki/X.509#Certificate_chains_and_cross-certification). Because the server can use a self-signed TLS certificate, WebRTC removes the need to include additional services like DNS and Let's Encrypt. 

#### Broad support

Chrome has supported WebRTC since 2012.  Other browsers soon followed, achieving support [on all evergreen browsers](https://caniuse.com/?search=webrtc).  WebRTC is literally everywhere.

### Limitations

#### Setup and configuration

Because WebRTC represents a collection of technologies, it requires extensive setup and configuration compared to other transports.  

#### Extensive Roundtrips

Another limitation is the 6 roundtrips required before data is exchanged.  This makes WebTransport a more compelling transport for the browser to server use case where the browser supports WebTransport.

### Usage

The complexity of WebRTC is abstracted in the implementations, making it seamless to swap your existing transport with WebRTC.

Let's look at the JavaScript implementation as an example:

```javascript
import { webRTC } from 'js-libp2p-webrtc'

const node = await createLibp2p({
  transports: [webRTC()],
  connectionEncryption: [() => new Noise()],
});
```

The only difference from other transports is initializing with `webRTC()`.  That's all you need to do to implement WebRTC in the browser.  Easy, right?


## Alternative transports

WebRTC is one of many ways to connect browsers to a libp2p node. [Choosing the transport](https://connectivity.libp2p.io/) that fits your use case is one of the many unique strengths of libp2p.

### WebSocket

The [WebSocket RFC](https://datatracker.ietf.org/doc/html/rfc6455) dates back to 2011 and specifies the opening of a two-way socket from a browser to a server over TCP. WebSocket is implemented in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/websocket), [Go](https://github.com/libp2p/go-libp2p/tree/master/p2p/transport/websocket), and [JavaScript](https://github.com/libp2p/js-libp2p-websockets) libp2p implementations. 

#### Limitations

The various upgrades and handshakes add up to six round trips before data can be exchanged. Additionally, while WebRTC can leverage self-signed certificates, WebSockets cannot, as they require the server to have a trusted TLS certificate using TCP.

### WebTransport

[WebTransport](https://datatracker.ietf.org/doc/html/draft-ietf-webtrans-overview) is the new kid on the block for real-time communication in the browser.  WebTransport is implemented in [Go](https://github.com/libp2p/go-libp2p/tree/master/p2p/transport/webtransport) and [JavaScript](https://github.com/libp2p/js-libp2p-webtransport) implementations. 

#### Benefits

WebTransport has many of the enhanced features of WebRTC (fast, secure, multiplexed) without requiring servers to implement the stack while also getting around the valid TLS certificate requirement.

As opposed to WebSockets, libp2p can use raw WebTransport streams and avoid the need for double encryption.  

WebTransport requires less roundtrips than WebRTC to establish a connection, making it the preferred choice when supported.

#### Limitations

You might be asking yourself, why pick WebRTC over WebTransport in libp2p? It's like WebRTC but easier to implement and with less complexity. WebTransport is not without its limitations.

The WebTransport protocol itself is still under development, and currently only implemented supported [in Chrome](https://caniuse.com/webtransport), but not yet in Firefox or Safari.  Until WebTransport is implemented by all major browsers, WebRTC is a great fallback.

## Legacy WebRTC implementations in libp2p

The new WebRTC transport was not the first of its kind.  These legacy transports proved that WebRTC was a viable solution for libp2p.

### libp2p-webrtc-star

libp2p-webrtc-star was [released]( https://github.com/libp2p/js-libp2p-webrtc-star/releases/tag/v0.5.0) in 2016. This transport utilizes centralized STUN and TURN servers to handle signaling and was [never intended](https://github.com/libp2p/js-libp2p/issues/385) to be a long-term solution. The repository was archived in November in favor of the new js-libp2p-webrtc transport due to the dependence on centralized servers. 

### libp2p-webrtc-direct

libp2p-webrtc-direct utilizes WebSockets to exchange SDPs, removing the need for centralized dependency in libp2p-webrtc-star. While libp2p-webrtc-direct solved the centralized problem, the servers must have valid TLS certificates for WebSocket connectivity. The repository was archived in November.

## Can I use WebRTC now?

Yes, you can use libp2p-webrtc in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/webrtc) and [JavaScript](https://github.com/libp2p/js-libp2p-webrtc) implementations!  The [Go](https://github.com/libp2p/go-libp2p) implementation is close to complete.  Follow the [PR](https://github.com/libp2p/go-libp2p/pull/1655) to get notified when merged.

In fact, the Parity team has already began using the Rust WebRTC implementation!
The transport has been enabled as an experimental feature and [added to Smoldot](https://github.com/paritytech/smoldot/issues/1712) (a lightweight [Substrate](https://substrate.io/) and [Polkadot](https://polkadot.network/) client!
There is also ongoing work to [enable it directly in Substrate](https://github.com/paritytech/substrate/pull/12529).

This is exciting news as WebRTC is already contributing to Parity's [roadmap to enable browser to server connectivity](https://github.com/paritytech/substrate/issues/7467) on their network!
## What's next?

WebRTC offers the capability for browsers to connect to browsers 🎉. This isn't currently possible in any of the active libp2p transports and represents a significant achievement in libp2p.

The [WebRTC browser-to-browser connectivity spec](https://github.com/libp2p/specs/pull/497) is currently being authored and development will soon start.  Follow the [PR](https://github.com/libp2p/specs/pull/497) for up-to-date information.

## Resources and how you can help contribute

If you would like to read further about WebRTC. Please see the libp2p:

- [WebRTC Docs](https://github.com/libp2p/docs/pull/264)
- [WebRTC Connectivity](https://connectivity.libp2p.io/#webrtc)
    - This describes WebRTC along with other transport implementations
- [WebRTC Spec](https://github.com/libp2p/specs/tree/master/webrtc)

If you would like to contribute, please [connect with the libp2p maintainers](https://libp2p.io/#community).


Thank you for reading!