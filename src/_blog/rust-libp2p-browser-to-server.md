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

# Rust-libp2p WebRTC now available in the Browser

WebRTC is now available (in alpha) for use as a browser Transport for rust-libp2p! Before now, WebRTC was only available on the server-side in rust-libp2p, but after months of coding and reviews, it is available on both the server and in the browser.

## Why WebRTC?

### Data Channels

WebRTC is a peer-to-peer protocol that allows browsers and servers to connect to each other. It's main focus is to connect media (audio and video), however there is also a [data channel](https://webrtc.org/getting-started/data-channels) available which is what libp2p uses. By tapping into the data channel API, we have been able to build libp2p Transports over WebRTC.

### Server vs Browser WebRTC

Using WebRTC on the server involves using a Rust library, but in the browser it is available to Rust libraries through browser bindings from a crate called [`web-sys`](https://docs.rs/web-sys/latest/web_sys/). By tying the libp2p code to these WebRTC bindings, we have been able to connect in the browser over WebRTC in pure Rust!

### Benefits of WebRTC over websockets and webtransport

The benefit of using WebRTC on the server is that the server does not need certificates provided by TLS and a domain name -- you can run a home server over WebRTC without a dotcom! In rust-libp2p we can use self-signed certificates to enable the connections. Websocket would require TLS certificates. Webtransport can connect with self-signed certificates, however this transport cannot connect browser-to-browser like WebRTC can.

With WebRTC rust-libp2p now available in the browser, we can enable developers to build full stack applications in rust without the need for a domain name or external server.

### Benefits over using js-libp2p-webrtc

Before now, the only way the browser could connect to a rust-libp2p server over WebRTC was to use [js-libp2p](https://github.com/libp2p/js-libp2p).

However, full stack rust-libp2p WebRTC is so beneficial. First, troubleshooting was much more difficult to do in two stacks, two languages, two styles of implementation. Even though js-libp2p and rust-libp2p implement the same libp2p spec, it's much more difficult to switch between languages when troubleshooting bugs and data flow. With full-stack rust-libp2p, we can now build applications that run in the browser and on the server in rust, using the same language and style of implementation on both the client and the server. This makes both developing applications fatser and easier as we can re-use code in both the browser and on the server. In fact, we were able to move a lot of code out of the server crate into a [common WebRTC utilities crate within the rust-libp2p repo](https://github.com/libp2p/rust-libp2p/tree/master/misc/webrtc-utils), This will apply to libp2p applications as well!

## How does libp2p use WebRTC?

The bindings to web_sys are implemented as a Transport. This means that you can connect to the network in the browser as you would on the server. There is a full stack example [in the repo](https://github.com/libp2p/rust-libp2p/tree/master/examples/browser-webrtc).

## Tutorial

Code walk through?

## What's next?

There is still work to be done to connect browser-to-browser in rust using `web-sys`. The [spec](https://github.com/libp2p/specs/tree/master/webrtc) is complete, and just needs to be implemented! We are always looking for more help from other community members to make this happen.

Having `rust-libp2p` available in the browser means we can tap into the rich [crates.io](crates.io) ecosystem of rust to build really cool connected apps. Apps built with front-end frameworks like [Leptos](https://www.leptos.dev/), [Yew](https://yew.rs/), and [dioxus](https://dioxuslabs.com/) can now plug into libp2p within Rust.
