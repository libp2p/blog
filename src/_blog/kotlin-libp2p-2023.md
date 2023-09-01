---
tags:
  - libp2p
  - kotlin
title: Introducing Kotlin-libp2p
description:
date: 2023-09-01
permalink: ""
translationKey: ''
header_image: /kotlin-2023.png
author: Erwin Kok
---

# The kotlin-libp2p project: An Introduction

For the last two years I have been working on a new libp2p implementation using Kotlin [libp2p-kotlin](https://github.com/erwin-kok/kotlin-libp2p). I presented briefly this new implementation in the libp2p community call, and Prithvi Shahi
was so kind to invite me to write this short blog, of which I am more than happy to do. This blog describes my journey of those first years, my motivation, what I encountered, and such.

## Background

I have been a software engineer for more than 20 years, professionally. And as a hobby... well... almost my entire life. I love creating software and I consider it as art. I love well-structured code, I love quality code (robust and well
tested), I love state-of-the-art code. Btw, I should not forget to mention that this new libp2p implementation is entirely made in my spare time on a personal basis (my employer is not involved in any way).

## Peer To Peer Networking

So, it started more or less two years ago when a good friend of mine was talking about cryptocurrency, specifically Ethereum. I had (and still have) a Kubernetes "cluster" running at home (just one single node) and I thought: "Well, why not
deploy Ethereum nodes in my cluster?". Nothing fancy, because it was not connected to main-net, but it was working. Nice! And that made me curious, because I knew cryptocurrency, or at least the technology behind it, is decentralized. How
do these
nodes communicate with each other? Because it must be entirely different from client-server communication. How do these nodes find each other? How can a node directly connect to another node (NAT, Firewall)? If 'A' sends something to 'B',
perhaps it passes first 'C', 'D' and 'E'. How does it find the optimal route between 'A' and 'B'? And if a node in the mesh network disconnects, or a new node connects, how does the mesh deal with this dynamic behaviour? And that made me
very interested into peer-to-peer networking.

## Starting with libp2p

Once curious about P2P, it was not hard to find [libp2p.io](https://libp2p.io/). Nice! There are even specs there! And an implementation (or implementation**s**). How cool is it to connect to such an existing node? I spun up one of the
go-libp2p examples, and I was 'talking' to it. Being a Java programmer professionally it was almost straight forward for me to use that language. So I was just playing around with the different protocols. At first nothing fancy.

## Implementing crypto

One of the first things I had the deal with was the cryptography part. BouncyCastle is a very popular crypto implementation in Java, however, I don't like it. The code is not very understandable and is missing some good documentation. I was
spending days on getting BouncyCastle to work with the different crypto key formats, and in the end I thought "How cool is it to implement it myself?". So I did. I implemented the entire crypto stack and it was working. Cool! Btw, I have to
mention that I did not invent the implementation, I largely used the Go implementation as a reference. But it taught me a lot about elliptic curves, finite field theory, etc.

## Motivation

The main reason for me to start this project is educational, and for research purposes. When I started this project I was just "playing" around with some protocols. And, over time, I was curious about the next part: how does mplex work? And
noise? And multiformats? And datastore? Etc... Each time my hands were itching to implement the next part, and the next. And from one thing comes the other. I consider software as an art. Just like Van Gogh loves to paint, I love to create
software. I love to see Kademlia working, I love to see Quic working, etc. etc.

And, the other part is, its open source. Meaning, others can use parts of the software that is beneficial for them. Maybe not the whole project, but some ideas, algorithms, etc.

## Challenges

When I think of challenges, three areas pops up: threading, Mplex and Swarm.

I didn't like the threading part in Java, it was not performing well. And, threads don't scale well. So, I was looking for a "light-threads" library and was considering "Project Loom" at the time. However, Project Loom is still in its
infancy stage, and didn't continue with it. Via a colleague I heard about Kotlin and I immediately became enthusiastic, I think it's a very nice language and coroutines are awesome. For people that don’t know: Kotlin is a language developed
by JetBrains and is the preferred language for Android development. The Kotlin compiler compiles Kotlin into JVM bytecode (the same bytecode as Java) so Kotlin can run on any compliant JVM and is fully interoperable with Java. Although
coroutines are great, I had to be aware of several things. For example: Suspendable methods can not be called from non-suspendable methods (I think Go does not have this limitation). This is okay,
however, you have to take this into account when designing/developing the software. And, dead-locks can occur when using thread locking mechanisms such as ReentrantLock. Because when a function acquires a lock and is suspended while holding
the lock, when the function is resumed again, it can run on a different thread.

Although the Mplex protocol is rather trivial, I had some nasty issues while closing streams and closing connections in the right order. Streams send a 'ClosedFrame' to its peer to indicate the stream is half closed. But, since several
streams
share the same Connection, they also share the same output channel which is managed by the Connection. When I close the stream and also the connection, and due to ordering, the connection close can happen before the stream close. In such a
case, the '
CloseFrame' can not be sent on a closed channel. So, the connection close has to wait until all streams are closed (which is not trivial since a lot of things happen lazily).

Lastly, the Swarm is responsible for opening connections to peers. And synchronizing this is a bit tricky. Imagine multiple clients want to open a connection to the same peer. In this case, only one dial should be made to the peer and the
connection must be shared
between those clients (clients have distinct streams running atop of this shared connection). Also, a peer can have multiple addresses and I didn't want to have multiple connections to the same peer using different addresses. So, the
addresses are prioritized. First the first address is dialed. If this fails, the second address is dialed. And so on. The last challenge with swarming that I solved was the retrying mechanism. If a peer is offline, I want retry the dial by
first waiting (this increases between dial attempts) and then do the redial. And then multiple times. I synchronized everything by using a priority-queue with timestamps. A feature that I didn't implement yet is dial limiting, e.g. a
maximum of N dials can occur simultaneously.

## Satisfactions

The things that I loved to implement were several: Swarm, Datastore, Eventbus, and more. But the nicest satisfaction I had was the way how to handle ktor streams. I use Ktor as a low-level network library (opening sockets, sending/receiving
packets, etc.). Ktor is very generic and there are several ways to do the same thing, using packets(builders), using lambdas, but they all had their limitations/issues. In the end I settled with byte-channels and up till now they fulfil all
my needs. Actually, it is pretty straightforward: using a coroutine that reads N bytes from a byte-channel, do some processing (multiplexing/decrypting/encrypting/etc.) and put it on another byte-channel which is shared by the next 'hub' of
the processing pipeline. And Kotlin knows the concept of structured concurrency, such that a parent coroutine always waits for completion of its child coroutines (in a tree like structure). And, when a parent is cancelled, all its children
are cancelled as well.

## What's Next?

The next part is probably finishing the Identify protocol implementation (because I already started that) and then I start implementing Quic. After Quic I would like to implement Kademlia. Note that I currently do this in my spare time, so
I have limited time available.
