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
date: 2024-02-21
permalink: ''
translationKey: ''
header_image: /rust-libp2p.jpeg
author: DougAnderson444
---

# Rust-libp2p WebRTC in the Browser

We are excited to announce that [rust-libp2p](https://github.com/libp2p/rust-libp2p) running in the browser can now establish [WebRTC connections](https://webrtc.org/). Before now, WebRTC was only available on the server in [rust-libp2p](https://github.com/libp2p/rust-libp2p), but after months of coding and reviews, we are pleased to announce it is available on both the server and in the browser from rust-libp2p.

# Why WebRTC for rust-libp2p?

There are a few different options for a `Transport` to choose, each with its own pros and cons. So, why WebRTC? Let's dive into some of the benefits of WebRTC and why we decided it was important to implement it as a `Transport` within rust-libp2p for use in the browser.

## Benefits of using WebRTC

There are certain benefits of using WebRTC instead of other transports such as WebSockets and WebTransport.

### Easier node operation

Modern browsers require the served connections to use Transport Layer Security (TLS) in many cases. In the case of WebSockets, the certificates need to be signed by a Certificate Authority (CA) that is in the browser's trust-chain, which typically means to serve secure WebSockets (`wss://`), you'll need to set up a Domain Name System (DNS) and associated Let's Encrypt (or similar). These steps incur extra costs and hassle that create a barrier to entry for many people. Contrast that to the reduced steps for WebRTC, where we can use self-signed certificates, removing the need for doman names and trusted Certificate Authorities! WebTransport also allows the use of self-signed certificates, but rust-libp2p does not (yet) support WebTransport as a server-side transport. Subscribe to [transport/webtransport: Add WebTransport protocol rust-libp2p#2993](https://github.com/libp2p/rust-libp2p/issues/2993) for updates.

Imagine being able to write a web app in Rust, and have it be able to connect to a Rust node running on your desktop at home, without having to set up a DNS, Let's Encrypt, or any external server infrastructure with a Public IP address!

> You too, can now easily and securely become a [rust-libp2p](https://github.com/libp2p/rust-libp2p) _Node Operator_, even at home!

### Improved connectivity

WebRTC also allows us to connect two browsers directly. Typically, connecting two nodes requires one of them to "listen" on one or more interfaces and sharing its listen address with the other node. However, browsers don't provide direct access to a machine's network interfaces, and therefore can't "listen" for themselves. With WebRTC, browsers expose an API to establish a direct connection to another browser with the help of a signalling server. Because of the ease of setting up a libp2p WebRTC server as described in the previous subsection, anyone can set up their own "signalling server" themselves, or use one embedded into a Rust application anywhere that Rust compiles! 

> \*Note: This is a common point of confusion for WebRTC when connecting two browsers together. Although the browser can _eventually_ connect directly, to set up this direct connection we first need a signalling server. In the case of libp2p, we can use a libp2p node running `webrtc-direct` to conduct this signalling by using `circuit-relay`. We always need this `webrtc-direct` server first, which is why we implemented `webrtc-direct` first.

With `rust-libp2p` now available over WebRTC Transport in the browser, we have enabled developers to build full stack applications in Rust without the need for external certificate authorities or user setup steps. These full stack [rust-libp2p](https://github.com/libp2p/rust-libp2p) apps can connect from the browser to a node running at home (and eventually browser to browser). Due to the power and flexibility we gain from self-signed certificates, we enable node operators the ability to decentralize their infrastructure that runs the libp2p node.

## Benefits of Full Stack `rust-libp2p` 

Now that we have [rust-libp2p](https://github.com/libp2p/rust-libp2p) over WebRTC on both the server and the browser, we can share code between the two layers of the stack! Writing isomorphic code like this speeds up development by writing the code only once, and running it anywhere. An additional benefit is a single code base makes reviews and debugging much easier on developers.

Capitalizing on this benefit, we were even able to move a lot of code out of the server WebRTC crate into a [common WebRTC utilities crate ](https://github.com/libp2p/rust-libp2p/tree/master/misc/webrtc-utils) within the rust-libp2p repo.

## How does libp2p use WebRTC?

### Data Channels

WebRTC's flagship purpose in peer-to-peer communications is for connecting media (audio and video). However, there is also a powerful [data channel](https://webrtc.org/getting-started/data-channels) API available which allows users to exchange data streams as well. This is what libp2p uses at the transport layer. By tapping into this data channel API, we have been able to build the libp2p `Transport` over WebRTC.

### Server WebRTC vs Browser WebRTC

Using WebRTC on the server involves using a Rust crate (currently [webrtc-rs](https://github.com/webrtc-rs/webrtc)), but in the browser it is available to Rust through browser bindings from a crate called [`web-sys`](https://docs.rs/web-sys/latest/web_sys/) and then compiling the Rust code to WebAssembly (or, "`wasm`" for short). By wrapping the WebRTC bindings in a libp2p `Transport`, we have been able to enable the browser to establish connections over WebRTC in pure Rust compiled to WebAssembly!

### Breaking down the stack

Here is how libp2p uses WebRTC:

- The browser provides WebRTC programmatically through the Web API
- `wasm-bindgen` provides bindings to the WebRTC API in Rust through a crate called [`web-sys`](https://docs.rs/web-sys/latest/web_sys/)
- Then `rust-libp2p` wraps these `web-sys` bindings to implement a WebRTC `Transport`
- This `Transport` is made available for any application (such as Kademlia, Gossipsub, etc.) to use
- Finally, the Rust code is compiled to WebAssembly and runs in the browser's runtime

## Demo

There is a full stack example [in the repo](https://github.com/libp2p/rust-libp2p/tree/master/examples/browser-webrtc).

The demo runs an local `rust-libp2p` WebRTC server, compiles the browser side Rust to WebAssembly, hosts the code, and pings back and forth with that server. It's intended to be a simple example to get you up and running with WebRTC as a Transport.

## What's next?

There is still work to be done to connect browser-to-browser in Rust. 

- The `webrtc` [spec](https://github.com/libp2p/specs/tree/master/webrtc) is complete.
- The open issue [#4389](https://github.com/libp2p/rust-libp2p/issues/4389) remains to be implemented! 

We are always looking for more help and support from other community members to make this happen.

Having rust-libp2p available in the browser means we can tap into the rich [crates.io](crates.io) ecosystem of Rust to build really cool connected apps. Apps built with front-end frameworks like [Leptos](https://www.leptos.dev/), [Yew](https://yew.rs/), and [dioxus](https://dioxuslabs.com/) can now plug into libp2p within Rust.

We can't wait to see what you build!
