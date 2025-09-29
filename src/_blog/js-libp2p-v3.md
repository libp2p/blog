---
tags:
- browser
- transport
- webrtc
- js-libp2p
title: Announcing the release of js-libp2p v3.0.0 🎉
description: An overview of changes and updates in the v3 release
date: 2025-09-30
permalink: "/2025-09-30-js-libp2p/"
translationKey: ''
header_image: /js-libp2p-v1-header.png
author: Alex Potsides
---

## Announcing the release of js-libp2p v3.0.0 🎉

`libp2p@3.x.x` has just shipped, representing our once-yearly roll-up of breaking changes.

Let's find out what's changed and why, and how you can upgrade your project to the latest and greatest.

## What's new? 🤩

### Streams as EventTargets

Prior to v2 of libp2p, streams were [streaming iterables](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9). This convention involves an object with `source` and `sink` properties - the `source` is an [AsyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) which yields data received by the stream, and `source` is an async function that accepts an iterator (sync or async) and returns a promise that resolves when the passed iterator finishes and all bytes have been written into an underlying resource, or rejects if an error is encountered before this occurs.

This interaction pattern has not been adopted outside the libp2p project and it's surrounding ecosystem which raises the bar for new developers, and it also leans heavily on promises which can introduce a [surprising amount of latency](https://github.com/ChainSafe/js-libp2p-gossipsub/pull/361) to seemingly simple operations.

As of v3, streams have become [EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)s. These follow a pattern familiar to anyone who has written JavaScript for a website whereby you attach event listeners for incoming message events and write data synchronously into the underlying resource, perhaps pausing for a bit if the underlying resource signals back that it is overloaded.

Data in both directions is processed synchronously which means applications can do more useful work in the current tick which increases performance and the absence of async makes them easier to reason about.

```ts
import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'

const node = await createLibp2p()

const peer = peerIdFromString('123Foo...')
const stream = await node.dialProtocol(peer, '/my-protocol/1.0.0', {
  signal: AbortSignal.timeout(5_000)
})

// register a listener for incoming data
stream.addEventListener('message', (evt) => {
  console.info(new TextDecoder().decode(evt.data.subarray()))
})

// send some data
stream.send(new TextEncoder().encode('hello world'))
```

Synchronous streams have shown a [small increase in throughput](https://observablehq.com/@libp2p-workspace/performance-dashboard?branch=bb8cd2619a7fd910540776800b9c90db64a15deb) but a bigger win here is the slight collapse in the spread of data measurements - with less internal async libp2p becomes more predictable and as such reliable.

#### Write back pressure

When an underlying resource is saturated, it should be able to notify the sender that it cannot accept any more data. This can happen when a buffer fills up or sending is being throttled to not exceed a rate limit.

This is known as [back pressure](https://en.wikipedia.org/wiki/Back_pressure).

With the new stream API a stream can apply back pressure by it's `.send()` method returning false. Once this method has returned false the sender should wait for a `'drain'` event before continuing to send data:

```ts
import { pEvent } from 'p-event'
import type { Stream, AbortOptions } from '@libp2p/interface'

async function sendAllTheData (stream: Stream, bufs: Uint8Array[], options?: AbortOptions): Promise<void> {
  // send every member of `bufs`
  for (const buf of bufs) {
    if (!stream.send(buf)) {
      // the stream has signalled
      await pEvent(stream, 'drain', {
        rejectionEvents: [
          'close'
        ]
      })
    }
  }
}
```

The stream maintains an internal write buffer - if the sender ignores back pressure and continues to send data then it will be queued here, but if the buffer reaches a maximum size the stream will be reset and the data dropped.

#### Read back pressure

A stream can be paused by invoking the `.pause()` method. While a stream is paused no `message` events will be emitted.

If the underlying transport supports this feature ([Yamux](https://github.com/chainSafe/js-libp2p-yamux):yes, other muxers: no), the remote end of the stream will signal to it's data supplier to pause by the `.send` method returning false.

Once the consumer is ready to read more data from the stream `.resume()` can be called, which will cause `message` events to be emitted again.

The stream maintains an internal read buffer - if the remote continues to send data it will be queued here, but if it reaches it's maximum size the stream will be reset and the data dropped.

#### Half-closable

libp2p streams are half-closable, that is calling `.close()` on a stream closes the local writeable end and signals to the remote that no more data will be sent.

The remote can still send data and must also close it's writeable end in order for the stream to be closed fully.

If the stream should be closed immediately, call `.abort()` which will drop any unsent data and reset the stream.

### Imperative streams

The `@libp2p/utils` module now exports some functions to make imperative stream programming simpler.  These are largely ported from the [it-protobuf-stream](https://www.npmjs.com/package/it-protobuf-stream), [it-length-prefixed-stream](https://www.npmjs.com/package/it-length-prefixed-stream) and [it-byte-stream](https://www.npmjs.com/package/it-byte-stream) modules.

#### byteStream

The `byteStream` module lets you read/write arbitrary amounts of bytes to/from the stream in an imperative style. The `read` method accepts a `bytes`
option which will resolve the returned promise once that number of bytes have
been received, otherwise it'll just return whatever bytes were read in the
last chunk of data received from the underlying stream.

```ts
import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'
import { byteStream } from '@libp2p/utils'

const node = createLibp2p({
  // libp2p config here
})

const remotePeer = peerIdFromString('123Foo...')
const stream = await node.dialProtocol(remotePeer, '/echo/1.0.0', {
  signal: AbortSignal.timeout(5_000)
})

const bytes = byteStream(stream)

await bytes.write(Uint8Array.from([0, 1, 2, 3]), {
  signal: AbortSignal.timeout(5_000)
})

const output = await bytes.read({
  signal: AbortSignal.timeout(5_000)
})

console.info(output) // Uint8Array([0, 1, 2, 3])
```

#### lengthPrefixedStream

The `lengthPrefixedStream` module lets you read/write arbitrary amounts of bytes
to/from the stream in an imperative style.

All data written to the stream is prefixed with a [varint](https://protobuf.dev/programming-guides/encoding/#varints)
that contains the number of bytes in the following message.

```ts
import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'
import { lengthPrefixedStream } from '@libp2p/utils'

const node = createLibp2p({
  // libp2p config here
})

const remotePeer = peerIdFromString('123Foo...')
const stream = await node.dialProtocol(remotePeer, '/echo/1.0.0', {
  signal: AbortSignal.timeout(5_000)
})

const lp = lengthPrefixedStream(stream)

await lp.write(Uint8Array.from([0, 1, 2, 3]), {
  signal: AbortSignal.timeout(5_000)
})

const output = await lp.read({
  signal: AbortSignal.timeout(5_000)
})

console.info(output) // Uint8Array([0, 1, 2, 3])
```

#### protobufStream

The `protobufStream` module lets you read/write [protobuf](https://protobuf.dev)
messages to/from the stream in an imperative style.

In the example below the `Message` class is generated from a `.proto`
file using [protons](http://npmjs.com/package/protons). Other protobuf
encoders/decoders are available.

```ts
import { createLibp2p } from 'libp2p'
import { peerIdFromString } from '@libp2p/peer-id'
import { protobufStream } from '@libp2p/utils'
import { Message } from './hello-world.js'

const node = createLibp2p({
  // libp2p config here
})

const remotePeer = peerIdFromString('123Foo...')
const stream = await node.dialProtocol(remotePeer, '/echo/1.0.0', {
  signal: AbortSignal.timeout(5_000)
})

const pb = protobufStream(stream)

await pb.write({
  hello: 'world'
}, Message, {
  signal: AbortSignal.timeout(5_000)
})

const output = await pb.read({
  signal: AbortSignal.timeout(5_000)
})

console.info(output) // { hello: 'world' }
```

### Stream middleware

`libp2p@3.x.x` adds a `.use()` function, largely inspired by [express.js-style middleware](https://expressjs.com/en/guide/using-middleware.html) - this allows you to intercept incoming/outgoing libp2p streams and access/modify the stream data outside the protocol handler.

This allows things like access control or data transformations to take place without needing to change the protocol handler, which you may not have direct control over.

```ts
import { createLibp2p } from 'libp2p'

const node = createLibp2p({
  // libp2p config here
})

node.use('/my/protocol', async (stream, connection, next) => {
  // perform middleware actions here

  next(stream, connection)
})
```

## Protocol handlers and topologies can now be async

Prior to `libp2p@3.x.x` protocol handlers and topology callbacks had to be synchronous methods.

Performing async work in a protocol handler was very common, so a frequently used pattern was to create a resolved promise (e.g. `Promise.resolve().then(...)`) and to perform the continuation in the `then` callback.

From v3 they can return promises to improve developer experience a tiny amount.

If the returned promise rejects the stream will be aborted using the rejection reason.

**Before**

```ts
import { createLibp2p } from 'libp2p'

const node = createLibp2p({
  // libp2p config here
})

// protocol handlers had to be synchronous
node.handle('/my/protocol', ({ stream, connection }) => {
  Promise.resolve().then(async () => {
    for await (const buf of stream) {
      //... process stream data
    }
  })
    .catch(err => {
      stream.abort(err)
    })
})

// topology callbacks had to be synchronous
node.register('/my/protocol', {
  onConnect: (peer, connection) {
    Promise.resolve().then(async () => {
      // do async work
    })
  }
})
```

**After**

```ts
import { createLibp2p } from 'libp2p'

const node = createLibp2p({
  // libp2p config here
})

// protocol handlers can now return promises
node.handle('/my/protocol', async (stream, connection) => {
  for await (const buf of stream) {
    //... process stream data
  }
})

// topology callbacks can now return promises
node.register('/my/protocol', {
  onConnect: async (peer, connection) {
    // do async work
  }
})
```

### Breaking changes

All breaking changes are covered in the [v2 -> v3 migration guide](https://github.com/libp2p/js-libp2p/blob/main/doc/migrations/v2.0.0-v3.0.0.md) - please see this doc for a detailed breakdown.

- Streams are now `EventTarget`s
- All methods/properties marked `@deprecated` have been removed
- The protocol handler signature has changed from `({ stream, connection }): void` to `(stream, connection): void | Promise<void>`
- `@multiformats/multiaddr` v13+ is required

## What's next? 🚀

The libp2p roadmap for 2026 is currently being developed. Please join the [libp2p community call](https://luma.com/libp2p?tag=community) if you'd like to have some input.

As of September 30th [@achingbrain](https://github.com/achingbrain) will no longer be the maintainer of js-libp2p (see https://github.com/libp2p/js-libp2p/discussions/3253) which leaves the project with a [perilous](https://github.com/libp2p/js-libp2p/graphs/contributors) [bus factor](https://en.wikipedia.org/wiki/Bus_factor). Perhaps you can help? Please join the [js-libp2p open maintainers call](https://luma.com/libp2p?tag=javascript) if so.

## Resources and how you can contribute 💪

If you would like to learn more about libp2p, a great place to start is always the [docs](https://docs.libp2p.io/), but we have also included some additional resources below:

* [js-libp2p Discussions](https://github.com/libp2p/js-libp2p/discussions)
  * This is a great place to discuss issues, ideas, and enhancements with the community.
* [Slack - the libp2p-implementers channel](https://filecoinproject.slack.com/archives/C03K82MU486)
  * This is a great place to have real-time discussions with the community.
* [libp2p Specifications](https://github.com/libp2p/specs/)
  * This describes the various libp2p specifications across implementations.
