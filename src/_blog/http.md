---
tags:
- http
- go
title: HTTP-P2P, HTTP with more Ps
description:
date: 2023-09-20
permalink: "/2023-09-20-http-p2p/"
translationKey: ''
header_image: /libp2p_http.png
author: Marco Munizaga
---

## Introduction

We're introducing a new [experimental API](https://pkg.go.dev/github.com/libp2p/go-libp2p@v0.31.0/p2p/http) in go-libp2p, enabling developers to utilize libp2p with the well-known semantics of HTTP. This isn't a special flavor of HTTP; it's standard HTTP, but enhanced with libp2p. Developers can now benefit from HTTP intermediaries such as [CDN caching](https://www.cloudflare.com/learning/cdn/what-is-caching/) and [layer 7 load balancing](https://www.nginx.com/resources/glossary/layer-7-load-balancing/). This allows developers to create HTTP applications that operate over NATs and seamlessly tap into libp2p's diverse transport options to boost connectivity. In addition, the HTTP transport now joins the roster of supported transports in libp2p.

Here are some use cases we are excited about:

- A peer can fetch content from another peer over the [IPFS Path Gateway](https://specs.ipfs.tech/http-gateways/path-gateway/) protocol, and it will work regardless if the remote peer is:
    - A CDN
    - An [R2 bucket](https://developers.cloudflare.com/r2/get-started/)
    - A random server with no domain name or TLS certificate
    - A laptop
    - A browser (🚀)
- HTTP Edge compute nodes can now behave as peers in the libp2p network.
    - Many edge compute nodes are constrained to either HTTP or WebSockets, with a premium cost on WebSockets.
- Simple HTTP clients like curl can now participate in the libp2p network.
- A browser can make a secure HTTP request to a peer using WebTransport or WebRTC, and thus avoid having to rely on Web PKI.
- Operators of bigger libp2p deployments can use layer 7 load balancing to route and scale their protocols easily. Projects like [Envoy](https://www.envoyproxy.io/) are now libp2p compatible.
- Throw away your long running virtual machine. Have peer browsers act as HTTP *servers* for each other. Keep state as a CRDT that is maintained by every peer of the application (à la [gossippad](https://github.com/marcopolo/gossip-pad)).
- Port existing HTTP applications to a p2p environment.
    - A [Mastodon](https://docs.joinmastodon.org) server that can serve clients over libp2p.
    - A [Gitea](https://about.gitea.com) server hosting your code on your laptop, and serving it to friends across NATs and without a domain name.

We’re hoping to get some early feedback as the API solidifies, so please try it out and let us know what you think in the [go-libp2p Discussions forum](https://github.com/libp2p/go-libp2p/discussions).

## Technical details

This new api is an implementation of the [libp2p+HTTP spec](https://github.com/libp2p/specs/pull/508). The main features are:

1. Defining a new HTTP transport
2. Providing HTTP semantics to users that work on ***any*** transport.
3. Defining a `.well-known/libp2p` resource for learning about a peer.

### A new HTTP Transport

A libp2p node can now listen on an HTTP transport and advertise its address as a multiaddr ending in `/tls/http` (or, equivalently, `/https`). For example, a libp2p node that is listening on port 443 would have a multiaddr of `/ip4/1.2.3.4/tcp/443/tls/http`. If the node has a domain name it could use that as well, i.e. `/dns/example.com/https`. The HTTP transport lives alongside the node’s other transports (tcp+tls+yamux, QUIC, WebRTC, etc). The key difference is that the HTTP transport only supports HTTP requests and responses, and thus does not support the stream-based interface that other libp2p transports support.

<aside>
💡 For more details about valid multiaddrs for the HTTP transport, refer to the [spec](https://github.com/libp2p/specs/blob/master/http/transport-component.md).

</aside>

The HTTP transport is a normal HTTPS server/client. There’s is nothing libp2p specific about it. This is on purpose as it allows us to interoperate with the wide existing HTTP ecosystem.

## HTTP Semantics

HTTP semantics differ from the HTTP transport in that they are the abstract form of HTTP. They don’t specify ***how*** an HTTP message will be encoded and sent to a remote node, they only specify ****what**** an HTTP message is and its interpretation. These semantics are defined by [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html). This difference means we can adopt HTTP semantics without limiting ourselves to ****only**** an HTTP transport. We can use WebTransport, WebRTC, or a hole-punched QUIC connection to make an HTTP request. This allows developers to create applications using familiar HTTP tools in a p2p setting. On a technical level, this is implemented by opening a new stream for every HTTP request and encoding the HTTP message as HTTP/1.1.

## .well-known/libp2p

The last feature solves a problem that’s unique to running HTTP in a p2p setting. It’s about protocol discovery and signaling. Given that you know about a peer, how do you learn about the application protocols they provide? Do they provide an [IPFS Gateway](https://specs.ipfs.tech/http-gateways/path-gateway/)? Do they index CIDs and can be queried over the [IPNI interface](https://docs.cid.contact/query-and-retrieve/querying-indexer-provider)?

In a traditional HTTP setting, servers are well known, and you have out-of-band knowledge about what they support. `api.foo.example.com` is the API for the `foo` service on `example.com`. But in a p2p setting, you may only have a peer’s Multiaddr (e.g. `/ip4/127.0.0.1/udp/49926/quic-v1/p2p/12D3KooWExdwiYFTpSbvtvpPvig3X8u2PLbd7QyNJHqpGzHYd8Dq`). You need a standard way to ask this peer about the features it supports. That’s where `/.well-known/libp2p` comes in. A node provides information about what protocols it supports and where they are mounted at in the `.well-known/libp2p` resource. For example, a node that supports the `/hello/1` application protocol and mounts it at `/hello-path/` would return the following `.well-known/libp2p` (JSON encoded):

```json
{"/hello/1":{"path":"/hello-path/"}}
```

This feature is optional. If you have some out-of-band mechanism for signaling supported protocols, you can use that instead of `.well-known/libp2p`. In the future, we expect this information to reside alongside a peer’s address information because it’s useful to know not only how to communicate to a peer, but also what protocols they support. For example, we may want to know if a peer supports the IPFS Gateway protocol before going through the effort of connecting to them. In this future, `.well-known/libp2p` will still provide the most up to date information about this peer, and can act as a graceful fallback.

Readers familiar with libp2p may recognize a similarity to the identify protocol that is run over streams. These solve a similar problem. The reason to introduce this new thing is to fit better with HTTP conventions and semantics, as well as to trim things we don’t need.

## How to use this

Right now, the best support is in go-libp2p and there’s some preliminary (albeit rough) support for js-libp2p with [js-libp2p-fetch](https://github.com/MarcoPolo/js-libp2p-fetch/tree/main). We hope to see first-class support across implementations, but until then you can still use this, just with a bit more effort. See the Other environments section below.

### In go-libp2p

go-libp2p has had the most time spent in crafting first-class support for libp2p+HTTP. The core idea is that you create an `HTTPHost` that is similar to a stream based libp2p `host.Host` except it’s built around HTTP semantics. The `HTTPHost` has methods to `.Serve` HTTP handlers over various transports, and make `http.RoundTripper` s or `http.Client`s for specific peers. Refer to the examples and the documentation in the godoc for more information. And file an issue (or a small PR) if any examples or documentation can be improved.

### In js-libp2p

The browser is a platform where libp2p+HTTP can truly shine. Build your application using the standard `[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)` API and then use either the native browser fetch implementation for an HTTP transport (the remote peer’s multiaddr ends in `/tls/http` or `/https`) or [js-libp2p fetch](https://www.npmjs.com/package/@marcopolo_/libp2p-fetch) for doing HTTP over a libp2p stream transport.

There’s still some manual switching of the underlying `fetch` implementation to use, but we hope that will become easier to use in the future. API suggestions and ideas here are welcome.

### In other environments

A goal with this work is to be interoperable with existing HTTP systems. Or, put another way, it is to make all existing HTTP systems libp2p-compatible. That means you’ll be able to interact with a go-libp2p node with `curl`, or get rid of your long running virtual machine and replace it with ephemeral on-demand edge compute. You’ll be able to create your p2p applications on top of HTTP semantics, and then leverage libp2p to run it **********everywhere**********.

If you’re interested in how to add libp2p+HTTP support to your environment, take a look at the [HTTP Spec](https://github.com/libp2p/specs/pull/508). It’s relatively small, and can be added *on top of* an existing libp2p-implementation (no core changes required).

## Prior Art

This isn’t the first time folks have wanted to give HTTP p2p super powers. Here is some prior art in this field:

- [go-libp2p-http](https://github.com/libp2p/go-libp2p-http), started in 2017, encoded HTTP messages as HTTP/1.1 and sent them over a libp2p stream with the default protocol ID of `"/libp2p-http"`. The new libp2p+HTTP API follows this implementation closely and is compatible with it, but standardizes on the protocol ID of `/http/1.1` to signal that this is an HTTP/1.1 encoded HTTP message.
- Kubo (formerly known as go-ipfs) in 2019 used the above go-libp2p-http package to proxy HTTP requests over libp2p streams with an experimental feature called [p2p-http-proxy](https://github.com/ipfs/kubo/blob/master/docs/experimental-features.md#p2p-http-proxy).
    - This feature is used by Peergos to run their HTTP applications in a p2p way. More info at https://peergos.org/posts/dev-update.

This new work builds upon past work and tries to standardize how HTTP over libp2p streams works with the [libp2p+HTTP spec](https://github.com/libp2p/specs/pull/508). This work also embraces HTTP transports as a way (but not the only way) to send HTTP messages.

## Future extensions

- Support libp2p Peer ID Authentication over HTTP: https://github.com/libp2p/specs/pull/564
- Support using generic request/response semantics rather than HTTP semantics: https://github.com/libp2p/specs/pull/561