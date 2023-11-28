---
tags:
  - rust-libp2p
  - rust
  - libp2p
  - browser
  - webrtc
  - webassembly
  - wasm
title: rust-libp2p in the Browser with WebRTC!
description: News about how rust-libp2p in the browser connects to nodes in a network using WebRTC
date: 2023-12-07
permalink: ''
translationKey: ''
header_image: /rust-libp2p.jpeg
author: DougAnderson444
---

# Rust-libp2p WebRTC now available in the Browser

[rust-libp2p](https://github.com/libp2p/rust-libp2p) running in the browser can now establish [WebRTC connections](https://webrtc.org/)! Before now, WebRTC was only available on the server in `rust-libp2p`, but after months of coding and reviews, we are pleased to annouce it is available on both the server and in the browser.

# Why WebRTC for libp2p?

We have a few Transports to choose from, so why WebRTC? Let's dive into some of the benefits of WebRTC.

## Data Channels

WebRTC's main purpose in peer-to-peer communications is for connecting media (audio and video). However, there is also a powerful [data channel](https://webrtc.org/getting-started/data-channels) API available which allows users to exchange data streams instead of audio/video. This is what libp2p uses at the transport layer. By tapping into this data channel API, we have been able to build libp2p Transports over WebRTC.

## Server WebRTC vs Browser WebRTC

Using WebRTC on the server involves using a Rust crate (currently [webrtc-rs](https://github.com/webrtc-rs/webrtc)), but in the browser it is available to Rust through browser bindings from a crate called [`web-sys`](https://docs.rs/web-sys/latest/web_sys/) and then compiling the Rust code to WebAssembly (or, wasm for short). By wrapping the WebRTC bindings in a libp2p Transport, we have been able to enable the browser to establish connections over WebRTC in pure Rust compiled to WebAssembly!

## Benefits of WebRTC over WebSockets and WebTransport

There are certain benefits of using WebRTC instead WebSockets and WebTransport.

The benefit of using WebRTC instead of Websockets on the server is that WebRTC uses self-signed TLS certificates, eliminating the need for users to set up additional services like DNS and Let's Encrypt, which we would have to do with Websockets to make it available via `wss://`. This is great because it means users can run a public libp2p WebRTC server out of the box and have access that server from outside their network without additional steps or resources.

The benefit of WebRTC instead of WebTransport is WebRTC enables (eventual\*) direct browser-to-browser communication. Though webtransport can connect with self-signed certificates, it cannot connect browser-to-browser like WebRTC can.

> \*Note: This is a common point of confusion for WebRTC when connecting two browsers together. Although the browser can _eventually_ connect directly, to set up this direct connection we need a signalling server. In the case of libp2p, we can use a libp2p node running `webrtc-direct` to conduct this signalling by using `circuit-relay`. We always need this `webrtc-direct` server first, which is why we implemented `webrtc-direct` first. This server can be any libp2p node that is not running in the browser, it could be a virtual private server or home computer for example.

With `rust-libp2p` now available over WebRTC Transport in the browser, we can enable developers to build full stack applications in Rust without the need for external certificate authorities or setup steps.

## Benefits of Full Stack `rust-libp2p` 

Now that we have `rust-libp2p` on both the server and the browser, we can share code between the two layers of the stack! Writing isomorphic code like this speeds up development by writing the code only once, and running it anywhere. An additional benefit is a single code base makes reviews and debugging much easier on developers.

Using this benefit, we were even able to move a lot of code out of the server WebRTC crate into a [common WebRTC utilities crate ](https://github.com/libp2p/rust-libp2p/tree/master/misc/webrtc-utils) within the rust-libp2p repo.

## How does libp2p use WebRTC?

Here is how libp2p uses WebRTC:

- The browser provides a WebRTC programmatically through the Web API
- The `wasm-bindgen` crate provides bindings to the WebRTC API in rust through a crate called [`web-sys`](https://docs.rs/web-sys/latest/web_sys/)
- Then `rust-libp2p` wraps these `web-sys` bindings to implement a WebRTC transport
- This Transport is made available for any application (such as Kademlia, Gossipsub, etc.) to use
- Finally, the rust code is compile to WebAssembly and runs in the browser


## Demo

There is a full stack example [in the repo](https://github.com/libp2p/rust-libp2p/tree/master/examples/browser-webrtc).

The demo runs an example local `rust-libp2p` WebRTC server, and also hosts the WebAssembly code to connect and ping back and forth with that server. It's intended to be a simple example to get you up and running with WebRTC as a Transport.

## What's next?

There is still work to be done to connect browser-to-browser in rust using `web-sys`. 

- The `webrtc` [spec](https://github.com/libp2p/specs/tree/master/webrtc) is complete
- The open issue [#4389](https://github.com/libp2p/rust-libp2p/issues/4389) needs to be implemented! 

We are always looking for more help and support from other community members to help make this happen.

Having `rust-libp2p` available in the browser means we can tap into the rich [crates.io](crates.io) ecosystem of rust to build really cool connected apps. Apps built with front-end frameworks like [Leptos](https://www.leptos.dev/), [Yew](https://yew.rs/), and [dioxus](https://dioxuslabs.com/) can now plug into libp2p within Rust.

We can't wait to see what you build!
