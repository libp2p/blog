---
tags:
- browser
- transport
title: WebTransport in libp2p
description:
date: 2022-12-19
permalink: "/2022-12-19-libp2p-webtransport/"
translationKey: ''
header_image: /libp2p_WebTransport_Blog_Header.png
author: Marten Seemann
---

# WebTransport in libp2p

<!--
WebRTC (Browser to Server): Part 2 of Universal Browser Connectivity
WebRTC (Browser to Browser): Part 3 of Universal Browser Connectivity
-->
This is the first entry in a series of posts on how libp2p achieves browser connectivity.

**Table of Contents**

[[toc]]

## Overview

Universal and seamless browser connectivity is a crucial goal of the [libp2p project](https://libp2p.io). Over many years, libp2p has made many strides to realize that vision. Today, we are proud to announce a significant milestone that puts us much closer to that aim:

**libp2p now supports the new, bleeding-edge [WebTransport protocol](#What-is-WebTransport)!**

In this article, we:

* [Introduce WebTranport](#What-is-WebTransport)
* Show what it means for apps and [how you can use it today](#Can-I-use-this-right-now) 
* Explain [its advantages over existing solutions](#The-old-solution-WebSocket-and-its-challenges)
* Give you a [deep dive into how it works](#Meet-WebTransport)
* Describe the [current state of WebTransport](#What’s-the-current-state-of-WebTransport-and-where-is-it-supported) (specs and implementations)


## What is WebTransport?

At a high level, [WebTransport](https://www.w3.org/TR/webtransport/) is a new [transport protocol](https://osi-model.com/transport-layer/) and [Web API](https://developer.mozilla.org/en-US/docs/Web/API) currently under development by both the [Internet Engineering Task Force (IETF)](https://www.ietf.org/) and the [World Wide Web Consortium (W3C)](https://www.w3.org/).

WebTransport is developing to meet [these goals](https://github.com/w3c/webtransport/blob/main/explainer.md#goals):

- Enable low latency communication between browsers and servers (efficiently transfer data and decrease travel time from browser to server).
- Have an API that supports different protocols and use cases (e.g., reliable/unreliable and ordered/unordered data transmission, client-server and peer-to-peer architectures, transmitting audio/video media as well as generic data).
- Have the same security properties as current solutions (e.g., WebSocket over TLS.)

With these goals in mind, WebTransport seeks to address a multitude of use cases, including browser gaming, live streaming, multimedia applications, and more. Low latency is essential because these applications need to send & receive data as fast as possible. Additionally, video conferencing and streaming applications can handle data transmitted unreliably and out of order. They even prefer that as it's [more efficient for their use case](https://www.cloudflare.com/learning/video/what-is-streaming/).

WebTransport meets these goals and allows sending data quickly on the web.

## WebSocket: The old solution and its challenges

Before we delve deeper, let's reflect on the history of browser connectivity in libp2p. Questions that come to mind are:
How did libp2p browser nodes connect to server nodes before the advent of WebTransport, and what challenges existed when bridging browsers to the libp2p ecosystem?

Browsers dial [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) connections (for [HTTP 1.1](https://www.w3.org/Protocols/rfc2616/rfc2616.html) and [HTTP/2](https://web.dev/performance-http2/)) and [QUIC](https://www.rfc-editor.org/rfc/rfc9000.html) connections (for [HTTP/3](https://www.cloudflare.com/learning/performance/what-is-http3/)) all the time. However, there’s no way to *just* dial a TCP or QUIC connection and use it for things other than HTTP.
<!-- Explain why -->

This posed a problem when integrating browser applications with libp2p. libp2p is built on top of a bidirectional, asynchronous stream abstraction, whereas HTTP is a stateless, unidirectional, synchronous request-response protocol. In HTTP, a client sends a request to a server and waits for it to respond. No state is stored, and the HTTP API only cares about the immediate request. In libp2p, interactions are event-based and asynchronous. Communication happens bidirectionally without waiting for responses; the state is kept around to keep contexts of events during transmission.

Therefore, for the longest time, the only way to connect a libp2p client running in the browser to the rest of the network was using the somewhat dated [WebSocket protocol](https://www.rfc-editor.org/rfc/rfc6455).

WebSocket works by first establishing a HTTP(S) connection (most commonly HTTP 1.1) to the server, and then performing a single HTTP request to “upgrade” the connection to a bidirectional byte-stream. In libp2p, this allowed us to then treat this WebSocket connection as a raw TCP connection.
We run an additional libp2p handshake on that connection and apply either ([yamux](https://github.com/libp2p/go-yamux) or [mplex](https://github.com/libp2p/specs/tree/master/mplex)) as the stream multiplexer. The added step is necessary because WebSocket is susceptible to a problem called [head-of-line blocking](https://hpbn.co/websocket/#websocket-multiplexing-and-head-of-line-blocking). Because the protocol doesn't support multiplexing natively, this can cause one message sent to block other messages behind it (even if the messages are independent of each other.)

This has multiple drawbacks:

- Slow time to connect
    - It takes six network roundtrips until the libp2p connection is finally established because of the steps involved in establishing a WebSocket connection.
- Inefficiency
    - We’re double-encrypting the data: The first time, it’s encrypted on the outer (HTTPS) connection, and then again by the libp2p security protocol.
- Increased latency
    - There's no native stream multiplexing in WebSocket, and even after we add our own multiplexer, each internal stream can still suffer from head-of-line blocking.

As a result, we could never expect the WebSocket transport to be fast and performant. Given that WebSocket was the only connectivity option for browsers, we had no choice but to pay the performance penalty.

In practice, a different obstacle prevented WebSocket from achieving widespread deployment in libp2p. When a browser connects to a website, in practically all cases, it does so via [HTTPS](https://www.cloudflare.com/learning/ssl/what-is-https/). HTTPS enforces the use of *Secure WebSocket*, which is just a fancy name for WebSocket over HTTPS (and not HTTP). This means that the server needs a valid [TLS certificate](https://aws.amazon.com/what-is/ssl-certificate/), i.e., a certificate signed by a [Certificate Authority](https://en.wikipedia.org/wiki/Certificate_authority) like [Let’s Encrypt](https://letsencrypt.org/).

However, most libp2p nodes don’t have such a certificate. This is because libp2p nodes constitute a decentralized peer-to-peer network where participants can run nodes on home laptops or browsers and join or leave the network at will. Most nodes don’t even possess a domain name, requiring a certificate from many CAs. While it’s not too hard to obtain a TLS certificate, it’s non-trivial to do so automatically in a decentralized manner.

Due to the difficulty of use in a peer-to-peer setting and performance penalties, WebSocket has always been a fringe transport protocol in the libp2p stack.

## Meet WebTransport

Thankfully, WebTransport addresses almost all of the pain points when using WebSocket!

Conceptually, WebTransport is similar to WebSocket, although it’s a new protocol on the wire. The browser can “upgrade” an [HTTP/2](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http2/) or an [HTTP/3 connection](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/) to a **WebTransport session**.
HTTP/3 runs on top of QUIC. A WebTransport session over HTTP/3 allows both endpoints to open (very thinly wrapped) QUIC streams to each other. This enables WebTransport to take advantage of QUIC's offerings, resulting in the following:

- Speedy time to connect using a fast handshake (just one network roundtrip.)
- Native stream multiplexing without head-of-line blocking
- Advanced loss recovery and congestion control
- Low latency communication and unordered and unreliable delivery of data

> Note: WebTransport with HTTP/2 provides TCP transport functionality where QUIC is unavailable.

Introducing a new verification option is the most critical change for our peer-to-peer use case. Being layered on top of QUIC, WebTransport always requires a (TLS) encrypted connection. The WebTransport browser API allows for two distinct modes:

1. Verification of the TLS certificate chain.
    - This is precisely what the browser does when checking the certificate for any website it connects to. This means that the server must possess a certificate signed by a CA.
2. Verification of the TLS certificate hash.
    - This option is intended for short-lived VM deployments, where servers only have self-signed certificates. The browser will trust the server if the hash of the certificate used during the handshake matches its expected hash.

Option (1) comes with the exactly the same problems that we encountered with WebSocket.

Option (2) allows us to use WebTransport on *any* libp2p node without manual configuration!

It works because when setting up a WebTransport server, the libp2p node will generate a self-signed TLS certificate and calculate the certificate hash. It then advertises the following [multiaddress](https://docs.libp2p.io/concepts/fundamentals/addressing/) to the network:

`/ip4/1.2.3.4/udp/4001/quic/webtransport/certhash/<hash>`.

The `certhash` component of the multiaddress tells the browser the certificate hash, allowing it to establish the WebTransport connection successfully.

In practice, you’ll see addresses containing multiple certificate hashes, e.g.

`/ip4/1.2.3.4/udp/4001/quic/webtransport/certhash/<hash1>/certhash/<hash2>`.

As described above, option (2) is intended for short-lived deployments, and browsers will only accept valid certificates for less than 14 days. We work around this constraint by generating two certificates: one valid for immediate use and another valid from when the first one expires. After 14 days, the server can forward its certificates and advertise an updated address containing the new certificate hash to the network.

### Deep dive: How WebTransport works

Let’s dive into the details! Understanding this section is unnecessary if you want to use WebTransport, so feel free to skip ahead.


<div class="container" style="display:flex; column-gap:10px;">
    <figure>
        <img src="../assets/WebTransport-blog-post-diagram-1.png" >
        <figcaption style="font-size:x-small;">
        </figcaption>
    </figure>
</div>

1. The browser dials a regular HTTP/3 connection to the server, verifying the certificate either by its chain of trust or by the certificate's hash.
2. The browser sends an `Extended CONNECT` request on an HTTP/3 stream, requesting establishing a WebTransport session. If the server sends a `200` HTTP status, the WebTransport session is successfully established.

Both sides can now open streams (both bidirectional and unidirectional) and send (unreliable) HTTP datagrams.

> Note: the unreliable datagrams are a property of UDP, which QUIC is built on top of. This unreliable and out-of-order delivery makes UDP, QUIC, and WebTransport perfect for applications like video streaming or browser gaming, where low latency and speed are paramount.

In libp2p, we still need to verify the libp2p peer IDs, so we’re not entirely done yet.

To do so, the browser opens a new WebTransport stream and starts a [Noise](https://noiseprotocol.org/noise.html) handshake. This is the same handshake we use to secure connections on top of TCP in libp2p. In this handshake, we bind the outer connection to this handshake, which allows us to verify that we’re not falling victim to a man-in-the-middle (MITM) attack.

Therefore, setting up a WebTransport connection in libp2p takes no more than three network roundtrips. Compare that to the six roundtrips we needed for WebSocket!

We might even be able to bring this down to 2 roundtrips in the future: In principle, it should be possible to run the `CONNECT` request and the Noise handshake in parallel. Currently, the browser API doesn’t allow this, but we’ve [submitted a proposal](https://github.com/w3c/webtransport/issues/435) to enable this feature.

<!-- TODO: do we need another diagram for this? -->

### Limitations

So far, we have discussed connectivity between browsers and servers and how WebTranport and WebSocket enable that. You may have noticed that we have yet to discuss peer-to-peer browser-to-browser connectivity and another prominent transport: [WebRTC](https://www.w3.org/TR/webrtc/).

This is where WebRTC shines, and WebTransport falls short: the latter does not support browser-to-browser connectivity. To meet this need, libp2p implementations are in the process of adding support for WebRTC browser-to-server connectivity ([supported in rust-libp2p](https://github.com/libp2p/rust-libp2p/releases/tag/v0.50.0)) as well as browser-to-browser connectivity ([coming soon](https://github.com/libp2p/specs/issues/475).) We plan to share more with you as we make progress on this front.

## What's the current state of WebTransport, and where is it supported?

### State of Specifications

### IETF Specs

As we’ve described above, WebTransport is new and as bleeding-edge as it gets.

The IETF specification of the protocol itself is still [in the draft stage with ongoing revisions](https://datatracker.ietf.org/doc/draft-ietf-webtrans-overview/) (the same is true for WebTransport over [HTTP/3](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/) and [HTTP/2](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http2/).)
This will likely be the case for many more months. As such, we don’t yet know what the final version of the protocol will look like.

### libp2p Specs

We have a prose specification on how libp2p uses WebTransport here: [libp2p WebTransport spec](https://github.com/libp2p/specs/tree/master/webtransport). This describes the addressing scheme, certificate use, HTTP endpoint, and security handshake in greater detail. Different libp2p language implementations write their WebTransport implementations following this specification.

It's important to note that libp2p only specifies the [HTTP/3](https://datatracker.ietf.org/doc/draft-ietf-webtrans-http3/) variant.

### State of WebTransport in Browsers

Currently, WebTransport support is limited to Chromium browsers ([which shipped in Chrome 97](https://chromestatus.com/feature/4854144902889472)) as the protocol and Web API are not supported elsewhere.
See the [Can I Use? page for more details](https://caniuse.com/webtransport).

From our experience integrating QUIC into libp2p, browser vendors will likely not simultaneously support multiple draft versions of WebTransport. Instead, they will drop support for older versions as soon as they deploy support for a new version.

### State of WebTransport in libp2p implementations

WebTransport is supported in two libp2p implementations as an experimental feature:

- go-libp2p [as of v0.23.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.23.0)
- js-libp2p through the [js-libp2p-webtransport npm package](https://www.npmjs.com/package/@libp2p/webtransport).

What's more, naturally, these two implementations are interoperable with one another. Here's a demonstration given by Alex Potsides (software engineer at Protocol Labs and maintainer of js-libp2p) at [libp2p Day](https://blog.ipfs.tech/2022-11-22-libp2p-day-2022-recap/#webtransport-transport). He demoed WebTransport [using the browser to fetch a file from Kubo (go-ipfs) directly](https://github.com/libp2p/js-libp2p-webtransport/tree/main/examples/fetch-file-from-kubo):

@[youtube](Dt42Ss6X_Vk)

Additionally, [rust-libp2p](https://github.com/libp2p/rust-libp2p) will add support for WebTransport [in the near future](https://github.com/libp2p/rust-libp2p/blob/master/ROADMAP.md#webtransport).

### Remaining work in libp2p

At the time of publication, the latest go-libp2p release is [v0.24.0](https://github.com/libp2p/go-libp2p/releases/tag/v0.24.0), and WebTransport is not yet a default transport. The work to enable it [is being done here](https://github.com/libp2p/go-libp2p/pull/1915).

As mentioned, the IETF specification is still in the draft stage. When browsers adopt newer versions of the draft, libp2p will need to adopt the draft versions accordingly. Depending on the scope of change between the two versions, libp2p implementations take the same approach as browsers: drop support for WebTransport implementations from older draft versions.

> Note: A consequence may be that as libp2p nodes and browsers upgrade to new versions, there will temporarily be a mismatch between the WebTransport versions, resulting in unsuccessful connection attempts.

Lastly, the feature will have to be promoted from an experimental once it is no longer an IETF draft.

## Can I use this right now?

Yes, please! As demonstrated [above](#State-of-WebTransport-in-libp2p-implementations), WebTransport already works between browsers and servers in applications powered by go-libp2p and js-libp2p.

### What use cases and applications does this unlock?

This unlocks many use cases, and we are excited for builders to strike their path. Here are some ideas:

- Enable browser nodes (or light clients) as "full" peers in a decentralized network.
    - Browser nodes can gossip directly to their peers in the wider decentralized network. This means they can receive and submit, egress and ingress messages directly without relying on centralized infrastructure or interfaces like an HTTP/GraphQL api.
- Enable browser extension crypto wallets to submit transactions directly to the blockchain.
- Get data from the DHT by directly connecting to a DHT server node.
- Upload to Filecoin directly from the browser.
- Enable decentralized peer-to-peer video streaming as a dapp.

These are just a few possibilities, with much more to unlock. Make the most of the speed and power of WebTransport!

## Resources and How you can help contribute

If you would like to read further about WebTransport. Please see the libp2p:

- [Documentation on WebTransport](https://docs.libp2p.io/concepts/transports/webtransport/)
- [Connectivity site section on the protocol](https://connectivity.libp2p.io/#webtransport)
    - This describes WebTransport along with other transport implementations
- [Specification on WebTransport](https://github.com/libp2p/specs/tree/master/webtransport)

If you would like to contribute, please:

- [Connect with the libp2p maintainers](https://libp2p.io/#community)

Thank you for reading!
