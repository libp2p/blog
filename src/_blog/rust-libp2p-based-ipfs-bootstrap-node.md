---
tags:
  - 'Kademlia'
  - 'Rust'
  - 'libp2p'
title: A Rusty Bootstrapper
description: 'Running rust-libp2p-server on one of our four IPFS bootstrap nodes.'
date: 2023-07-24
permalink: "/2023-rust-libp2p-based-ipfs-bootstrap-node/"
translationKey: ''
header_image:
author: Max Inden (@mxinden)
---

Cross-posting ["A Rusty Bootstrapper"](https://blog.ipfs.tech/2023-rust-libp2p-based-ipfs-bootstrap-node/) from the IPFS blog.

> # Summary
>
> As of July 13, 2023, one of the four "public good" IPFS bootstrap nodes operated by Protocol Labs has been running [rust-libp2p-server](https://github.com/mxinden/rust-libp2p-server) instead of [Kubo](https://github.com/ipfs/kubo), which uses [go-libp2p](https://github.com/libp2p/go-libp2p/). rust-libp2p-server is a thin wrapper around [rust-libp2p](https://github.com/libp2p/rust-libp2p). We run both Kubo and rust-libp2p-server on IPFS bootstrap nodes to increase resilience. A bug or vulnerability is less likely to be in both Kubo and rust-libp2p-server than Kubo alone. In addition to increasing resilience we gain experience running large rust-libp2p based deployments on the IPFS network.

[Click here](https://blog.ipfs.tech/2023-rust-libp2p-based-ipfs-bootstrap-node/) to go to the full blog post.
