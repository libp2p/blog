---
tags:
- libp2p
title: libp2p at IPFS þing 2023 Recap
description: Recap of libp2p presentations and workshops at IPFS þing 2023
date: 2023-05-05
permalink: "/2023-05-05-libp2p-IPFS%C3%BEing-recap/"
translationKey: ''
header_image: /ipfs-thing-2023-logo.svg
author: Dave Huseby
---

**Table of Contents**

[[toc]]

## Introduction

Last month, April 15th - 19th 2023, the IPFS community came together in Brussels, Belgium for [IPFS þing 2023](https://blog.ipfs.tech/2023-ipfs-thing-recap/). The libp2p users and contributors community came out to meet up once again to interface with the broader IFPS community as well as share all of the great accomplishments and new work going on in the libp2p project. It was great to reconnect with people from organizations supporting and contributing to libp2p such as [Peergos](https://peergos.org/), [Source Network](https://source.network/), 

<div class="container" style="display:flex; column-gap:10px;">
    <figure>
        <img src="../assets/ipfs-thing-2023-03.jpg"  width="500">
        <figcaption style="font-size:x-small;">Group shot of the IPFSþing 2023</a>
        </figcaption>
    </figure>
</div>

Over the course of five days the the libp2p community gave 4 different talks on the recent libp2p developments and finished strong with a workshop where participants built their own peer-to-peer chat application leveraging the same technology as the [Universal Connectivity](https://github.com/libp2p/universal-connectivity) demonstrator project.

## Goals

The goals of the libp2p contributors attending IPFSþing were:

1. Build excitement by demonstrating the [Universal Connectivity application](https://github.com/libp2p/universal-connectivity).
2. Give updates on the continually improving performance, dealing with non-uniform network topology with hole punching, and lowering the barriers to libp2p compatibility.
3. Reconnect with community contributors and building up the greater libp2p community.

## Recap of Talks

### Hole Punching in the Wild

Max Inden (rust-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](R-ToBsdlEk4)

Learn from Max on how libp2p's hole punching mechanism works and what we've learned from the measurement campaign run last year.

### libp2p Performance

<div class="container" style="display:flex; column-gap:10px;">
    <figure>
    <figure>
        <img src="../assets/ipfs-thing-2023-02.jpg" width="100%">
        <figcaption style="font-size:x-small;">Max Inden and Marco Munizaga entertain us with a skit about libp2p performance.
            <a href="https://app.iconik.io/share/assets/16fdde28-dd2c-11ed-9cf1-fe682d265912/?object_type=collections&object_id=3a266a5e-dd28-11ed-9faf-e667e71f3893&hash=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaGFyZV9pZCI6IjBkM2VhZDJjLWRkMzEtMTFlZC1iYzA3LTFhMGQ4ZDEzMTExNCIsInNoYXJlX3VzZXJfaWQiOiIwZDRmMjQwZS1kZDMxLTExZWQtYmMwNy0xYTBkOGQxMzExMTQiLCJleHAiOjE4Mzk0MjM4MjZ9.OjJFG2ItCyURSqwzvxmh6dyFVo7LHwdR2puBq0KAm00">[Pic credit.]</a>
        </figcaption>
    </figure>
</div>

Max Inden (rust-libp2p maintainer, Software Engineer at Protocol Labs)
Marco Munizaga (go-libp2p and zig-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](2h9jth3nvJw)

Watch Max and Marco talk about all of the performance related aspects of libp2p and what optimizations are in the latest versions. They give a great overview of how the Protocol Labs libp2p team does automated performance testing using terraform and two AWS servers on opposite ends of the United States.

### The Incredible Benefits of libp2p + HTTP: A Match Made in Decentralized Heaven

<div class="container" style="display:flex; column-gap:10px;">
    <figure>
        <img src="../assets/ipfs-thing-2023-01.jpg"  width="100%">
        <figcaption style="font-size:x-small;">Marco Munizaga and Marten Seemann explain how to build your own compatible libp2p stack.
            <a href="https://app.iconik.io/share/assets/8b123fe8-dd2c-11ed-8154-3e3ce49f182b/?object_type=collections&object_id=3a266a5e-dd28-11ed-9faf-e667e71f3893&hash=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaGFyZV9pZCI6IjBkM2VhZDJjLWRkMzEtMTFlZC1iYzA3LTFhMGQ4ZDEzMTExNCIsInNoYXJlX3VzZXJfaWQiOiIwZDRmMjQwZS1kZDMxLTExZWQtYmMwNy0xYTBkOGQxMzExMTQiLCJleHAiOjE4Mzk0MjM4MjZ9.OjJFG2ItCyURSqwzvxmh6dyFVo7LHwdR2puBq0KAm00">[Pic credit.]</a>
        </figcaption>
    </figure>
</div>

Marten Seemann (go-libp2p maintainer, Software Engineer at Protocol Labs)
Marco Munizaga (go-libp2p and zig-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](aDHymXQJ4bs)

Don't miss this presentation by Marten and Marco. They start off showing how libp2p is evolving and improving with the addition of the QUIC transport followed by an explanation of simple it is to create a compatible libp2p stack out of a QUIC library, the libp2p TLS extension and some code for doing peer ID encoding and sending multistream headers. To prove how simple it is, Marco showed of his zig-libp2p implementation sending a pig to a go-libp2p node.

### Connecting everthing, everywhere, all at once with libp2p

Max Inden (rust-libp2p maintainer, Software Engineer at Protocol Labs)

@[youtube](4v-iIB0C9_8)

Max's talk about the [Universal Connectivity demonstrator app](https://github.com/libp2p/universal-connectivity) broke the record for the most people involved. @2color / Daniel, @TheDiscordian, @jochasinga / Pan, @achingbrain / Alex, @maschad / Chad, @p-shahi / Prithvi, @marcopolo / Marco, @thomaseizinger / Thomas, and @mxinden / Max all collaborated to make it happen. The work on the Universal Connectivity demonstrator app turned out to be an excellent driver for [interop testing and the need for further work there](https://github.com/libp2p/interop). The live demo worked in showing a go-libp2p server talking to a rust-libp2p server talking to go-libp2p laptop talking to js-libp2p browsers all using a variety of transports including QUIC, WebRTC Direct, and WebTransport. Max also introduced us to the [new libp2p website focused on connectivity](https://connectivity.libp2p.io/).

### libp2p Workshop

Thomas Eizinger (rust-libp2p maintainer, Software Engineer at Protocol Labs)

During the unconference sessions late in the week, Thomas hosted a libp2p workshop where participants went through the process of building a peer-to-peer chat application using the rust-libp2p. The workshop's code is in [this repo](https://github.com/thomaseizinger/libp2p-workshop.git). You too can give it a try by cloning the code with `--mirror` so that you get all of the branches. This workshop is designed to be followed in iterations. Start by checking out the `iteration-1` branch and follow along in the README.md. Once complete, you can check out the `iteration-2` branch and again follow along the additional steps in the READM.md. The repo contains branches for `iteration-1`, `iteration-2`, `iteration-3`, `iteration-4`, `iteration-5`, and `iteration-final`. When done you should have a functioning peer-to-peer chat application built using rust-libp2p.

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
    <figure>
        <img src="../assets/ipfs-thing-2023-08.jpg"  width="500">
        <figcaption style="font-size:x-small;">Talking about libp2p is always fun</figcaption>
    </figure>
</div>

