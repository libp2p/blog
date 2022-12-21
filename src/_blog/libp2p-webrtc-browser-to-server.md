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

# WebRTC (Browser to Server) in libp2p

<!--
WebTransport in libp2p: Part 1 of Universal Browser Connectivity
WebRTC (Browser to Server): Part 2 of Universal Browser Connectivity
WebRTC (Browser to Browser): Part 3 of Universal Browser Connectivity
-->
This is the second entry in a series of posts on how libp2p achieves browser connectivity.
Read about the [first article on WebTransport here](https://blog.libp2p.io/2022-12-19-libp2p-webtransport/).

**Table of Contents**


[[toc]]

## Overview

The [libp2p project](https://libp2p.io) supports many [transport protocols](https://libp2p.io/implementations/#transports) across a variety of implementations.
These transport protocols enable applications using libp2p to run as server nodes (on a personal laptop or in a datacenter) or as browser nodes (inside a Web browser.)

Historically, libp2p has bridged these runtime environments with different node connectivity options to varying degrees:
- server node to server node via TCP and QUIC
- browser node to server node via WebSockets and more recently [WebTransport](https://blog.libp2p.io/2022-12-19-libp2p-webtransport)
- browser node to browser node (via [less than ideal solutions](#prior-webrtc-implementations)

Today our focus is on advancements in the **browser to server** use case...🥁*drumroll*
 
We're excited to present a new paradigm for browser to server connectivity and announce,

**native support for WebRTC now exists in libp2p!**

## Acknowledgements

Before going further we'd like to acknowledge the organizations involved in this breakthrough.
First, kudos goes to [Little Bear Labs](https://littlebearlabs.io/) who teamed up with Protocol Labs and the libp2p community to define the WebRTC specification and work on the implementation. Protocol Labs authored the [Rust](https://github.com/libp2p/rust-libp2p) implementation, while Little Bear Labs focused on the [Go](https://github.com/libp2p/go-libp2p) and [JavaScript](https://github.com/libp2p/js-libp2p-webrtc) implementations.
Second, thanks goes to Parity Technologies for helping initiate this effort [many years ago](todo: link to issue or pr) and for all the valuable input on the specification and Rust implementation.

Without further ado, let's begin by introducing WebRTC and how it's currently used. Then we'll go into a deep dive of the WebRTC implementation within libp2p.

## WebRTC in the Browser

`Web Real-Time Communication`, commonly referred to as `WebRTC`, is a [set of standards](https://w3c.github.io/webrtc-pc/) that allows browsers, as well as other clients and servers, to connect to other peers in order to exchange audio, video, and data.  In most cases, peers are directly connected to other peers, allowing for a more private experience and fewer hops than on a relay.

While WebRTC handles audio, video, and data traffic, we're just going to focus on the data aspect because that's the API leveraged in libp2p-webrtc.

WebRTC is built directly into browsers, so using the API is a simple and straightfoward task.  Peers connect to each other via a `RTCPeerConnection` interface.  Once connected, `RTCDataChannels` can be added to the connection to send and receive binary data.

![](https://i.imgur.com/Zv221BT.png)

<!--
participantspacing 7
entryspacing 0.6

Peer A->STUN: Who Am I?
STUN->Peer A: Symmetric Nat
Peer A->TURN: Channel Please
Peer A->Signaling Channel: Offer SDP
Signaling Channel->Peer B: Offer SDP
Peer B->STUN: Who Am I?
STUN->Peer B: 159.225.242.189
Peer B->Signaling Channel: Answer SDP
Signaling Channel->Peer A: Answer SDP


Peer A->(1)Signaling Channel: DTLS Handshake
Signaling Channel->(1)Peer B: DTLS Handshake
Peer B->(1)Signaling Channel: DTLS Handshake
Signaling Channel->(1)Peer A: DTLS Handshake


Peer A<->Signaling Channel:Duplex Send/Receive SCTP data, encrypted with DTLS
Signaling Channel<->Peer B:Duplex Send/Receive SCTP data, encrypted with DTLS
-->

<div style="font-size: 1.25rem; text-align: center; margin-bottom: 1rem; font-style: italic;">2 browsers connecting via WebRTC, where Peer A has router restrictions (i.e. behind a firewall)</div>

Peers use external [STUN](https://datatracker.ietf.org/doc/html/rfc3489) servers to determine their public address, as well as any router restrictions that prohibit peer-to-peer communications.  In the case of a restriction, [TURN](https://datatracker.ietf.org/doc/html/rfc8656) servers are used to relay data between peers using a Signaling Channel.

Once IP addresses are obtained, a peer sends an Offer [SDP](https://datatracker.ietf.org/doc/html/rfc4566) to the other peer.  This Offer SDP details the ways that the initiating peer can communicate (IP address, protocols, fingerprints, encryption,...etc.).  The other peer sends an Answer SDP to the initiating peer.  Both peers now have enough information to start the DTLS handshake.

The DTLS handshake is performed using fingerprints contained in the Offer and Answer SDPs. After the handshake is complete, data is sent between peers using the SCTP (Stream Control Transmission Protocol) protocol, encrypting messages with DTLS over UDP.


## WebRTC in LibP2P

<!--
participantspacing 20
entryspacing 0.75

box over Server: Generate TLS Certificate
box over Server: Listen on UDP Port
box over Browser: Create RTCPeerConnection
box over Browser: Create Server's Answer SDP
box over Browser: Create Offer SDP
Browser->Server:STUN Binding Request
box over Server: Create Browser's Offer SDP

Server->(1)Browser:DTLS Handshake
Browser->(1)Server:DTLS Handshake

Server->(1)Browser:LibP2P Noise Handshake
Browser->(1)Server:LibP2P Noise Handshake


Browser<->Server:Multiplex Send/Receive Framed Data
-->
![](https://i.imgur.com/fIg6zOh.png)

Connecting to a server from a browser in the WebRTC implementation in libp2p has some similarities but is differnet in several ways.

The server first generates a self-signed TLS certificate and listens on a UDP port for incoming STUN packets.  Whether known upfront or discovered, the assembled multiaddress of the server is an input into the browser.

The browser creates a [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection).  Using the components in the server's multiaddress, the browser creates the server's Answer SDP. The SDP is edited, or `munged`, to include an auto-generated ufrag and password, as well as the server's components (IP and Port). Similarly, the browser creates an Offer SDP and munges it witj the same values. 

Setting the Offer and Answer SDP on the browser triggers the sending of STUN packets to the server.  The server then creates the browser's Offer SDP using the values in the STUN Binding Request. 

The browser and server then engage in a DTLS handshake, opening the UDP Data Channel.  Since the server does not know the TLS certificate of the browser, a [Noise handshake](https://noiseprotocol.org/noise.html) is initiated by the server using the fingerprints in the SDP and completed by the browser over the Data Channel. DTLS-encrypted SCTP data is now ready to be exchanged over the UDP socket.

#### Multiaddress

The [multiaddress](https://docs.libp2p.io/concepts/fundamentals/addressing/) of a WebRTC address begins like a standard UDP address, but adds 3 additional components: `webrtc`, `hash`, and `p2p`.

```shell
/ip4/1.2.3.4/udp/1234/webrtc/certhash/<hash>/p2p/<peer-id>
```

* `webrtc`: the name of this transport
* `hash`: the [multihash](https://github.com/multiformats/multihash) of the libp2p node
* `p2p`: the peer-id of the libp2p node (optional)

### Benefits

#### Self-Signed Certificate

WebRTC enables browsers to connect to public libp2p nodes without the nodes requiring a TLS certificate in the browser's [certificate chain](https://en.wikipedia.org/wiki/X.509#Certificate_chains_and_cross-certification). Because the server can use a self-signed TLS certificate, WebRTC removes the need to include additional services like DNS and Let's Encrypt. 

#### Peer-to-Peer

WebRTC allows for peer-to-peer connections, opening up the browser-to-browser use case in libp2p. While this [specification](https://github.com/libp2p/specs/pull/497) is still a work in progress, the potential is very exciting as no other non-WebRTC transport offers this.

#### Broad Support

Chrome has supported WebRTC since 2012.  Other browsers soon followed, achieving support [on all evergreen browsers](https://caniuse.com/?search=webrtc).  WebRTC is literally everywhere.

#### Signaling Removed

In contrast to standard WebRTC signaling, you might notice signaling is completely removed in libp2p browser-to-server communication and that Signal Channels aren't needed.  Removing singaling results in fewer roundrips needed to establish a Data Channel as well as the added complexity of creating signaling. Additionally, in situations in standard WebRTC where Signal Channels were needed due to router restrictions, latency is lowered on all traffic using direct communication in libp2p.

### Limitations

#### Setup and Configuration

Because WebRTC represents a collection of technologies, it requires extensive setup and configuration when compared to other transports.

### Usage

The complexity of WebRTC is abstracted away in the implementations, making it seamless to swap out your existing transport with WebRTC.

Let's look at the JavaScript implementation as an example:

```javascript
import { webRTC } from 'js-libp2p-webrtc'

const node = await createLibp2p({
  transports: [webRTC()],
  connectionEncryption: [() => new Noise()],
});
```

The only difference from other transports is initializing with `webRTC()`.  That's all you need to do to implement WebRTC in the browser.  Easy, right?


## Alternative Transports

WebRTC isn't the only way to connect browsers to a libp2p node.  [Choosing the transport](https://connectivity.libp2p.io/) that fit's your use case is one of the many unique strengths of libp2p.

### WebSocket

The [WebSocket RFC](https://datatracker.ietf.org/doc/html/rfc6455) dates back to 2011 and specifies the opening of a 2-way socket from a browser to a server over TCP.  WebSocket is implemented in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/websocket), [Go](https://github.com/libp2p/go-libp2p/tree/master/p2p/transport/websocket), and [JavaScript](https://github.com/libp2p/js-libp2p-websockets) implementations. 

#### Benefits

Since the WebSocket transport is already implemented in libp2p, it can be used today in a browser-to-server scenario.  WebSockets are well supported in browsers and are easy to implement.  Using TCP, WebSockets are more reliable than WebRTC's UDP.

#### Limitations

WebSockets run over TCP, which is inherently slower than WebRTC's UDP.  The various upgrades and handshakes add up to 6 round trips before data can be exchanged.  Additionally, while WebRTC can leverage self-signed certificates, WebSockets cannot as they require the server to have a trusted TLS certificate using TCP.

### WebTransport

[WebTransport](https://datatracker.ietf.org/doc/html/draft-ietf-webtrans-overview) is the new kid on the block for real-time communication in the browser.  WebTransport is implemented in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/quic), [Go](https://github.com/libp2p/go-libp2p/tree/master/p2p/transport/webtransport), and [JavaScript](https://github.com/libp2p/js-libp2p-webtransport) implementations. 

#### Benefits

WebTransport has many of the same features of WebRTC (fast, secure, multiplexed), but without requiring servers to implement the WebRTC stack.  Tney also get around the valid TLS certificate requirement.  After the noise handshake completes, libp2p can use raw WebTransport streams and avoid the need for double encryption.

#### Limitations

You might be asking yourself, why pick WebRTC over WebTransport in libp2p?  It's like WebRTC, but easier to implement and with less complexity.  WebTransport is not without it's limitations.

WebTransport isn't supported [in all browsers](https://caniuse.com/webtransport). This lack of support is a big concern as it's unreasonable to expect users to _not_ use Firefox or Safari, or even older versions of Chromium-based browsers.

Another issue is that browsers utilizing the WebTransport API can only connect to servers.  This severly limits the utility of the transport as browser-to-browser communication is critical to closing the loop on full interopability in libp2p.

## Prior WebRTC Implementations

The new WebRTC transport was built on the shoulder of giants.  These legacy transports proved that WebRTC was a viable solution for libp2p.

### libp2p-webrtc-star

libp2p-webrtc-star was released earlier this year.  This transport utilizes centralized STUN and TURN servers to handle signaling, and was [never intended](https://github.com/libp2p/js-libp2p/issues/385) to be a long-term solution. The repository was archived in November in favor of the new js-libp2p-webrtc tranport due to the dependance on centralized servers. 

### libp2p-webrtc-direct
libp2p-webrtc-direct utizes websockets to exchange SDPs, removing the need for the centralzed dependency in libp2p-webrtc-star.  While the centralized problem was solved, the servers need to have valid TLS certificates for websocket connectivity. The repository was archived in November.

## Can I use WebRTC Now?

Yes, you can use libp2p-webrtc in the [Rust](https://github.com/libp2p/rust-libp2p/tree/master/transports/webrtc) and [JavaScript](https://github.com/libp2p/js-libp2p-webrtc) implementations!  The [Go](https://github.com/libp2p/go-libp2p) implementation is close to complete.  Follow the [PR](https://github.com/libp2p/go-libp2p/pull/1655) to get notified when merged.

## What's Next?

WebRTC offers the capability for browsers to connect to each other 🎉.  This isn't currently possible in any of the active libp2p transports and represents a major achievement in libp2p.

The [WebRTC browser-to-browser connectivity spec](https://github.com/libp2p/specs/pull/497) is currently being authored and development will soon start.  Follow the [PR](https://github.com/libp2p/specs/pull/497) for up-to-date information.

## Resources and How you can help contribute

If you would like to read further about WebRTC. Please see the libp2p:

- [Documentation on WebRTC](https://github.com/libp2p/docs/pull/264)
- [Connectivity site section on the protocol](https://connectivity.libp2p.io/#webrtc)
    - This describes WebRTC along with other transport implementations
- [Specification on WebRTC](https://github.com/libp2p/specs/tree/master/webrtc)

If you would like to contribute, please:

- [Connect with the libp2p maintainers](https://libp2p.io/#community)

Thank you for reading!