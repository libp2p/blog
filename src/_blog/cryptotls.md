---
tags:
- quic
- go
- standard library
- crypto/tls
title: Adding a QUIC API for Go's standard library TLS package
description:
date: 2023-08-15
permalink: "/2023-08-15-quic-crypto-tls/"
translationKey: ''
header_image: /quic-crypto-tls.png
author: Marten Seemann
---

# Adding a QUIC API for Go's standard library TLS package

You might have [heard us talk about this before](https://www.youtube.com/watch?v=aDHymXQJ4bs): QUIC has become the most important transport in libp2p. For example, QUIC accounts for 80-90% of the connections made to PL-run bootstrappers participating in the public IPFS DHT (see our [public go-libp2p dashboard](https://protocollabs.grafana.net/public-dashboards/2bd3f1bee9964d40b6786fbe3eafd9fc?orgId=1)). [quic-go](https://github.com/quic-go/quic-go) is a QUIC implementation written in pure Go that is not only used in go-libp2p, but also in [Caddy](https://caddyserver.com/), a full-featured webserver (for its HTTP/3 support), [Adguard](https://github.com/AdguardTeam/AdGuardHome), for providing DNS over QUIC, and in the synchronization tool [syncthing](https://github.com/syncthing/syncthing/), and [many other projects](https://github.com/quic-go/quic-go#projects-using-quic-go).

## QUIC and TLS 1.3

All QUIC connections use TLS 1.3 to encrypt the messages. There’s no such thing as an unencrypted QUIC connection! However, due to running on top of UDP—the unreliable and unordered Internet protocol—QUIC's interactions with the TLS stack differs from how a TLS connection on top of TCP functions. The details are described in [RFC 9001](https://www.rfc-editor.org/rfc/rfc9001.html). When QUIC was standardized, it became necessary for all TLS stacks across languages to expose new APIs. For the longest time, the Go standard library TLS package (crypto/tls) lacked an API for this purpose. The quic-go project had no choice but to fork crypto/tls to add the required APIs themselves.

To complicate matters, the quic-go API aimed to accept a regular `tls.Config`—the struct used to configure the behavior of a TLS connection, defining, among others, the TLS certificates to use—not a type exposed by our TLS fork. This was to ensure that users of the library didn't have to create separate configs for their TCP/TLS servers and their QUIC servers. This is a pretty common use case such as when running HTTP/3 and HTTP/2 in parallel. To meet this requirement, quic-go used the dreaded `unsafe` package to convert between `qtls.Config` and `tls.Config`. And since there was no guarantee that the layout of these structs would remain constant between Go releases—in fact, they did change quite frequently—quic-go had to create a new fork of crypto/tls for every new Go version every 6 months.

This meant:

1. A lot of extra effort for us every time a new Go version was released. Applying the changes to the fork could get quite complicated, if there were lots of changes in crypto/tls.
2. Every time there was a security-related fix in crypto/tls, users had to update to a new (patch) release of quic-go as well.
3. Since the layout of the configuration structs in crypto/tls could change in future Go versions, quic-go had to restrict the Go versions that could be used to build quic-go. This lack of forwards-compatibility prompted regular complaints from users.

## Solving the Problem once and for all

To tackle this situation, we joined forces with Filippo Valsorda, a former member of Google’s Go team. Although he has left the company, he is still maintaining crypto/tls and other crypto packages in the standard library. Filippo—now a full-time open-source maintainer—is sponsored by Protocol Labs for his [remarkable work](https://words.filippo.io/full-time-maintainer/).

Our first joint endeavor established an API for crypto/tls that enables QUIC implementations to use crypto/tls; detailed in this [GitHub issue](https://github.com/golang/go/issues/44886). This new API was designed to only support the normal (1-RTT) QUIC handshake, not the 0-RTT handshake; more on that below.

After long discussions—both over calls and on the GitHub issue—we arrived at a much cleaner proposal than our homegrown qtls API.

0-RTT allows clients to resume connections to servers they have previously connected to and send application data in an encrypted first packet. Adding support for 0-RTT was a fairly large endeavor. This is because the TLS and the QUIC stacks must coordinate quite a lot to enable this feature. For example, both the client and the server need to remember certain configuration parameters—called QUIC transport parameters—from the original QUIC connection. Among others, these transport parameters include values like flow control windows (i.e. how many bytes a client is allowed to send on a newly established stream) and how many streams the client is allowed to open. This information is needed for the client to stay within these limits when resuming a connection. The server typically encrypts these values and stores them in the session ticket. When the client restores the session, it sends the session ticket to the server—as part of the TLS ClientHello message—allowing the server to restore the transport parameters without having to persist them after a connection closes!. The client also needs to store some of its parameters alongside the ticket, so it can restore them when resuming the session.

This means that crypto/tls needed to support adding data to session tickets, both the client and server sides. It turned out that the API required for this would also solve a large number of other longstanding [issues related to session tickets](https://github.com/golang/go/issues/60105).

This is only one of the problems we had to solve to make 0-RTT work. Another complication arises from the fact that the server can reject 0-RTT for any reason; typically for DoS protection or because it doesn’t consider the QUIC transport parameters acceptable anymore. In that case, 0-RTT packets are discarded and the handshake continues as a regular (1-RTT) QUIC handshake. This necessitated a new [API for deciding about 0-RTT rejection](https://github.com/golang/go/issues/60107) and for clients to be informed of it.

## Current Status

After an intense period of collaboration and development, we are thrilled to have all these changes included in the Go 1.21 release. The implementation of these proposals in the standard library was performed by [Damien Neil](https://github.com/neild) and [Filippo Valsorda](https://github.com/FiloSottile). On the quic-go side, we made use of the new APIs as soon as the changes were published. This allowed us to use quic-go's test suite to stress-test the implementation. This was really valuable, since quic-go’s test suite is quite extensive and covers a large number of corner cases. And it indeed found a small issue, which we subsequently [fixed](https://go-review.googlesource.com/c/go/+/498215).

And while we have a small workaround for one remaining [issue](https://github.com/golang/go/issues/60506), we are hopeful of a resolution in the next release.

The newly introduced changes have been released in [quic-go v0.37](https://github.com/quic-go/quic-go/releases/tag/v0.37.0), and in [go-libp2p v0.30](https://github.com/libp2p/go-libp2p/releases/tag/v0.30.0). We anticipate that these changes will work seamlessly once users update their dependencies and compiler version, but file an issue in go-libp2p.
