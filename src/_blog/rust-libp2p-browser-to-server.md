---
tags:
  - rust-libp2p
  - libp2p
  - browser
  - webrtc
title: Rust libp2p in the Browser with WebRTC!
description: News about how rust-libp2p now connects with the network via WebRTC
date: 2023-11-07
permalink: ''
translationKey: ''
header_image: /rust-libp2p.jpeg
author: DougAnderson444
---

# Rust libp2p in the Browser with WebRTC!

## What is rust-libp2p?

Rust-libp2p is a set of libraries that allow you to connect to the libp2p network. Libp2p is a modular peer-to-peer networking stack that is used by many projects in the IPFS ecosystem. It is also used by many other projects outside of IPFS, such as Ethereum, Polkadot, and many others.

## What is WebRTC?

WebRTC is a peer-to-peer protocol that allows browsers to connect to each other. It is used by many projects, such as Zoom, Google Meet, and many others. It is a protocol that is built into the browser, and allows for peer-to-peer connections without the need for a server.

## Benefits of WebRTC over websockets and webtransport

WebRTC is a peer-to-peer protocol that anables browsers and servers to connect with each other. It is a protocol that is built into the browser, and allows for peer-to-peer connections without the need for a server. The benefit os using WebRTC on the server side is that the server does not need certificates provided by a domain name -- you can run a home server without a dotcom!

With WebRTC in the browser, this enables developers to build full stack applications in rust without the need for a domain name or external server.

## WebRTC options we had available in libp2p

There were a few options available to us when we wanted to implement WebRTC in rust-libp2p. The first option was to use the [js-libp2p](https://github.com/libp2p/js-libp2p). The second was the `wasm-ext` protocol, which is now deprecated. And the third option (the option we implemented) was to use the bidnings to the browser provided by [web-sys](https://docs.rs/web-sys/latest/web_sys/).

## Why full stack rust-libp2p WebRTC is so beneficial

When I used js-libp2p, troubleshooting was difficult to do since there were two stacks, two languages, two styles of implementation. With rust-libp2p, we can now build full stack applications in rust, and use the same language and style of implementation on both the client and the server. This makes both developing applications easier as we can re-use code in both the browser and on the server, and as it makes troubleshooting much easier since the stack is in a single language with a single protocol. Even though js-libp2p and rust-libp2p implement the same libp2p spec, it's much more difficult to switch between languages when troubleshooting bugs and data flow.

## How does libp2p use WebRTC?

The bindings to web_sys are implemented as a Transport. This means that you can connect to the network in the browser as you would on the server. There is a full stack example [in the repo](https://github.com/libp2p/rust-libp2p/tree/master/examples/browser-webrtc).

## What's next?

There is still work to be done to connect browser-to-browser in rust using web_sys. The spec is complete, and we are always looking for more help from other community members as well. Rust-libp2p using web_sys WebRTC means you can tap into the rich crate.io ecosystem of rust to build really cool connected apps.
