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
date: 2023-11-07
permalink: ''
translationKey: ''
header_image: /rust-libp2p.jpeg
author: DougAnderson444
---

# Rust-libp2p WebRTC now available in the Browser

WebAssembly WebRTC is now available for use as a browser transport with rust-libp2p! Before now, WebRTC was only available on the server in `rust-libp2p`, but after months of coding and reviews, we are pleased to annouce it is available on both the server and in the browser.

## Why WebRTC for libp2p?

### Data Channels

WebRTC's main purpose in peer-to-peer communications is for connecting media (audio and video). However, there is also a powerful [data channel](https://webrtc.org/getting-started/data-channels) API available which allows users to exchange data streams instead of audio/video. This is what libp2p uses at the transport layer. By tapping into this data channel API, we have been able to build libp2p Transports over WebRTC.

### Server WebRTC vs Browser WebRTC

Using WebRTC on the server involves using a Rust crate (currently [webrtc-rs](https://github.com/webrtc-rs/webrtc)), but in the browser it is available to Rust through browser bindings from a crate called [`web-sys`](https://docs.rs/web-sys/latest/web_sys/). By tying the libp2p code to these WebRTC bindings, we have been able to connect in the browser over WebRTC in pure Rust compiled to WebAssembly!

### Benefits of WebRTC over websockets and webtransport

One of the main benefits of using WebRTC on the server is that it does not need TLS certificates from a DNS domain -- you can run a home server over WebRTC without a dotcom! Instead, with `rust-libp2p` we can use self-signed certificates to provide the secure connections. Websockets however would require TLS certificates.

The second major benefot of WebRTC is it enables (eventual\*) direct browser-to-browser communication. Though webtransport can connect with self-signed certificates, it cannot connect browser-to-browser like WebRTC can.

> \*Note: This is a common point of confusion for WebRTC when connecting two browsers together. Although the browser can _eventually_ connect directly, to set up this direct connection we need a signalling server. In the case of libp2p, we can use a libp2p server to conduct this signalling by using circuit relay. But we always need the WebRTC server first. This server can be any libp2p node that is not running in the browser, it could be a home computer for example.

With WebRTC rust-libp2p now available in the browser, we can enable developers to build full stack applications in rust without the need for a domain name or external server.

### Benefits of Full Stack rust-webrtc

Before now, the only way the browser could connect to a rust-libp2p server over WebRTC was to use [js-libp2p](https://github.com/libp2p/js-libp2p).

However, full stack rust-libp2p WebRTC is so beneficial. First, troubleshooting was much more difficult to do in two stacks, two languages, two styles of implementation. Even though js-libp2p and rust-libp2p implement the same libp2p spec, it's much more difficult to switch between languages when troubleshooting bugs and data flow. With full-stack rust-libp2p, we can now build applications that run in the browser and on the server in rust, using the same language and style of implementation on both the client and the server. This makes both developing applications fatser and easier as we can re-use code in both the browser and on the server. In fact, we were able to move a lot of code out of the server crate into a [common WebRTC utilities crate within the rust-libp2p repo](https://github.com/libp2p/rust-libp2p/tree/master/misc/webrtc-utils), This will apply to libp2p applications as well!

## How does libp2p use WebRTC?

The bindings to [web-sys](https://docs.rs/web-sys/latest/web_sys/) are implemented as a transport, which means that you can connect to the libp2p network from the browser as you would any other transport in `rust-libp2p`. There is a full stack example [in the repo](https://github.com/libp2p/rust-libp2p/tree/master/examples/browser-webrtc).

## Tutorial

Code walk through?

## What's next?

There is still work to be done to connect browser-to-browser in rust using `web-sys`. The [spec](https://github.com/libp2p/specs/tree/master/webrtc) is complete, and just needs to be implemented! We are always looking for more help from other community members to make this happen.

Having `rust-libp2p` available in the browser means we can tap into the rich [crates.io](crates.io) ecosystem of rust to build really cool connected apps. Apps built with front-end frameworks like [Leptos](https://www.leptos.dev/), [Yew](https://yew.rs/), and [dioxus](https://dioxuslabs.com/) can now plug into libp2p within Rust.
