---
tags:
- libp2p
title: libp2p at IPFS þing 2023 Recap
description: Recap of libp2p presentations and workshops at IPFS þing 2023
date: 2023-05-11
permalink: "/2023-libp2p-IPFS-Thing-recap/"
translationKey: ''
header_image: /ipfs-thing-2023-logo.png
author: Dave Huseby
---

**Table of Contents**

[[toc]]

## Introduction

Last month, April 15th - 19th 2023, the IPFS community came together in Brussels, Belgium for [IPFS þing 2023](https://blog.ipfs.tech/2023-ipfs-thing-recap/). The libp2p users and contributors community came out to meet up once again to interface with the broader IFPS community as well as share all of the great accomplishments and new work going on in the libp2p project. It was great to reconnect with people from organizations supporting and contributing to libp2p such as [Peergos](https://peergos.org/) and [Source Network](https://source.network/).

<div class="container" style="display:flex; column-gap:10px;">
    <figure>
        <img src="../assets/ipfs-thing-2023-03.jpg"  width="100%">
        <figcaption style="font-size:x-small;">Group shot of the IPFS þing 2023</a>
        </figcaption>
    </figure>
</div>

Over the course of five days the the libp2p community gave 6 different talks on the recent libp2p developments and finished strong with a workshop where participants built their own peer-to-peer chat application leveraging the same technology as the [Universal Connectivity](https://github.com/libp2p/universal-connectivity) demonstrator project.

## Goals

The goals of the libp2p contributors attending IPFS þing 2023 were to:

1. Build excitement by demonstrating the [Universal Connectivity application](https://github.com/libp2p/universal-connectivity).
2. Give updates on the continually improving performance, dealing with non-uniform network topology, interoperability improvements, and lowering the barriers to libp2p compatibility.
3. Reconnect with community contributors and build up the greater libp2p community.

## Recap of Talks

### Connecting Everything, Everywhere, All at Once with libp2p

[Max Inden](https://github.com/mxinden) (rust-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](4v-iIB0C9_8)

Max's talk about the [Universal Connectivity demonstrator app](https://github.com/libp2p/universal-connectivity) broke the record for the most people involved: [@2color / Daniel](https://github.com/2color), [@TheDiscordian](https://github.com/TheDiscordian), [@jochasinga / Pan](https://github.com/jochasinga), [@achingbrain / Alex](https://github.com/achingbrain), [@maschad / Chad](https://github.com/maschad), [@p-shahi / Prithvi](https://github.com/p-shahi), [@marcopolo / Marco](https://github.com/marcopolo), [@thomaseizinger / Thomas](https://github.com/thomaseizinger), and [@mxinden / Max](https://github.com/mxinden) all collaborated to make it happen. The live demo showed a go-libp2p node talking to a rust-libp2p node talking to go-libp2p laptop talking to js-libp2p browsers using a variety of transports including [QUIC](https://github.com/libp2p/specs/tree/master/quic), [WebRTC Direct](https://github.com/libp2p/specs/blob/master/webrtc/webrtc-direct.md), [WebRTC](https://github.com/libp2p/specs/blob/master/webrtc/webrtc.md), and [WebTransport](https://github.com/libp2p/specs/tree/master/webtransport). The work on the Universal Connectivity demonstrator app turned out to be an excellent driver for [interop testing and the need for further work there](https://github.com/libp2p/test-plans).

### libp2p Performance

[Max Inden](https://github.com/mxinden) (rust-libp2p maintainer, Software Engineer at Protocol Labs)<br>
[Marco Munizaga](https://github.com/marcopolo) (go-libp2p and zig-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](2h9jth3nvJw)

Watch Max and Marco describe how libp2p maintainers think about and measure performance, plus learn about some of the optimizations that are in the latest versions. This talk captures the in-progress work by libp2p maintainers to have automated, realistic, and easily reproducible benchmarks for the implementations.

### The Incredible Benefits of libp2p + HTTP: A Match Made in Decentralization Heaven

[Marten Seemann](https://github.com/marten-seemann) (go-libp2p maintainer, Software Engineer at Protocol Labs)<br>
[Marco Munizaga](https://github.com/marcopolo) (go-libp2p and zig-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](Ixyo1G2tJZE)

Marten, with the help of Marco, presented on advancements in using [HTTP over libp2p](https://github.com/libp2p/specs/pull/508). HTTP is a universally supported protocol with lots of established infrastructure but it has some key limitations that libp2p solves. In this talk Marco and Marten demonstrate the use of js-libp2p and service workers to intercept normal HTTP calls in the browser and re-route them over the libp2p connection to a peer that handles the HTTP request and serves the content back over the libp2p connection. This approach solves the problem of making web apps able to use both normal HTTP to access regular web servers and libp2p connections to access HTTP servers running as libp2p peers.

### How to Build Your Own Compatible libp2p Stack from Scratch in an Afternoon

[Marten Seemann](https://github.com/marten-seemann) (go-libp2p maintainer, Software Engineer at Protocol Labs)<br>
[Marco Munizaga](https://github.com/marcopolo) (go-libp2p and zig-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](aDHymXQJ4bs)

Don't miss this presentation by Marten and Marco. They start off showing how libp2p is evolving and improving with the addition of the QUIC transport followed by an explanation of how simple it is to create a compatible libp2p stack out of a QUIC library, the libp2p TLS extension and some code for doing peer ID encoding and sending multistream headers. To prove how simple it is, Marco showed off his zig-libp2p implementation sending a ping to a go-libp2p node.

### Enabling More Applications to Join the libp2p DHT Ecosystem

[Gui Michel](https://github.com/guillaumemichel) (Research Engineer at Protocol Labs)

@[youtube](OHrtv1jz2Jc)

Gui presents on a proposal to clarify the the boundary between libp2p and the IPFS DHT and implementation features. This approach to doing "composable" DHTs is designed to build global DHTs for many more libp2p applications that speak protocols and support features that aren't IPFS related all without harming the existing IPFS network. This presentation is a medium level of technical detail and certainly offers some exciting possibilities.

### Hole Punching in the Wild

[Max Inden](https://github.com/mxinden) (rust-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](R-ToBsdlEk4)

In a reprise of Max's [popular talk from FOSDEM](https://fosdem.org/2023/schedule/event/network_hole_punching_in_the_wild/), learn how libp2p's hole punching mechanism works and what we've learned from the [measurement campaign run last year](https://discuss.libp2p.io/t/decentralized-nat-hole-punching-measurement-campaign/1616).

### libp2p Workshop

[Thomas Eizinger](https://github.com/thomaseizinger) (rust-libp2p maintainer, Software Engineer at Protocol Labs)

During the unconference sessions late in the week, Thomas hosted a libp2p workshop where participants went through the process of building a peer-to-peer chat application using rust-libp2p. The workshop's code is in [this repo](https://github.com/thomaseizinger/libp2p-workshop.git). You too can give it a try by cloning the code with `git clone --mirror https://github.com/thomaseizinger/libp2p-workshop.git` so that you get all of the branches. This workshop is designed to be followed in iterations. Start by checking out the `iteration-1` branch and follow along in the README. Once complete, check out the `iteration-2` branch and again follow the additional steps in the README. The repo contains branches for `iteration-1`, `iteration-2`, `iteration-3`, `iteration-4`, `iteration-5`, and `iteration-final`. Each branch has additional steps in the README. When done, you will have a functioning peer-to-peer chat application built using rust-libp2p!

## Get Involved/Stay Tuned

We wanted to thank all members of the libp2p community including the maintainers, contributors, and supports of the work. Excitement is growing in libp2p and there are many opportunities for new people to get involved in the future of the project:

- If you’d like to get involved and contribute to libp2p, you can reach out to us using these means: [https://libp2p.io/#community](https://libp2p.io/#community)
- If you’re a self-starter and want to start pushing code immediately, feel free to ping the maintainers in any of these help wanted/good first issues: [go-libp2p](https://github.com/libp2p/go-libp2p/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22), [js-libp2p](https://github.com/libp2p/js-libp2p/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22), and [rust-libp2p](https://github.com/libp2p/rust-libp2p/issues?q=is%3Aopen+is%3Aissue+label%3Agetting-started).
- If you want to work in and around libp2p full-time, there are various teams hiring including the implementation teams.  See [https://jobs.protocol.ai/jobs?q=libp2p](https://jobs.protocol.ai/jobs?q=libp2p) for opportunities across the [Protocol Labs Network](https://plnetwork.io/).

To learn more about libp2p generally, checkout:

- The [libp2p documentation portal](https://docs.libp2p.io/)
- The [libp2p connectivity website](https://connectivity.libp2p.io/)
- The [libp2p curriculum put together by the Protocol Labs Launchpad program](https://curriculum.pl-launchpad.io/curriculum/libp2p/introduction/)

You can reach out to us and stay tuned for our next event announcement by joining our [various communication channels](https://libp2p.io/#community), joining the [discussion forum](https://discuss.libp2p.io/), following us on [Twitter](https://twitter.com/libp2p), or saying hi in the #libp2p-implementers channel in the [Filecoin public Slack](http://filecoin.io/slack).

Cheers!

<div class="container" style="display:flex; column-gap:10px;">
    <figure>
        <img src="../assets/ipfs-thing-2023-08.jpg"  width="500">
        <figcaption style="font-size:x-small;">Talking about libp2p is always fun</figcaption>
    </figure>
    <figure>
        <img src="../assets/ipfs-thing-2023-02.jpg" width="500">
        <figcaption style="font-size:x-small;">Max and Marco</figcaption>
    </figure>
    <figure>
        <img src="../assets/ipfs-thing-2023-05.jpg"  width="500">
        <figcaption style="font-size:x-small;">Max and Marco</figcaption>
    </figure>
</div>
<div class="container" style="display:flex; column-gap:10px;">
    <figure>
        <img src="../assets/ipfs-thing-2023-04.jpg"  width="500">
        <figcaption style="font-size:x-small;">Max and Marco</figcaption>
    </figure>
    <figure>
        <img src="../assets/ipfs-thing-2023-06.jpg"  width="500">
        <figcaption style="font-size:x-small;">Dave and Thomas</figcaption>
    </figure>
    <figure>
        <img src="../assets/ipfs-thing-2023-07.jpg"  width="500">
        <figcaption style="font-size:x-small;">Marco and Marten</figcaption>
    </figure>
</div>

