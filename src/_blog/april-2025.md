---
title: 'April 2025 Newsletter'
description: "This is the latest updates on libp2p"
date: 2025-04-30
permalink: '/newsletters/2025/04'
translationKey: ''
header_image: "/news-coverage-placeholder.png"
author: Dave Grantham
tags:
  - libp2p
  - Community
  - Newsletter
---

**Table of Contents**

[[toc]]

## April 2025 Newsletter 📰
Welcome to the April 2025 libp2p monthly newsletter! This month we had our
first virtual libp2p day, PLDG Cohort 2 wrap-up, more record-breaking meetings
and lots of bug fixes and improvements across seven different implementation
repos.

Before we get to the highlights, it is my pleasure to annouce that libp2p Day
is coming to [EthCC](ethcc-2025) in Cannes, France on July 1st! The plan is to
spend the morning doing the new "Intro to libp2p Programming" workshop followed
by a few hours of technical talks. Plan on joining us! You can register to join
us [here](libp2p-day-ethcc-registration). If you'd like to present a talk, you
can submit your proposal [here](libp2p-day-ethcc-proposals).

## Releases This Month 🚀 
This month we saw releases from four different implementations. First up is the
latest [cpp-libp2p v0.1.36](cpp-libp2p-release) with dependency cleanups, and
bug fixes in QUIC and Yamux. As usual, the py-libp2p team has been doing a ton
of work culminating in the [py-libp2p v0.2.5](py-libp2p-release) release with,
most notably, an implementation of the identify-push protocol. The latest
[js-libp2p v2.8.5](js-libp2p-release) release includes a number of fixes
including WebRTC certificate reuse across restarts. Lastly, April saw a new
[litep2p @ v0.9.4](libp2p-release) that includes improvements in the identify,
noise, kademlia, and bitswap protocols. Great work everyone!

## Community Updates 📅
Each month the libp2p community gives a brief update as part of the [EngRes The
Gathering community meeting](engres-meetings). This month our very own Manu
Sheel Gupta of the Protocol Labs Developers Guild, and a maintainer of the
py-libp2p project stepped in to give the [libp2p update](libp2p-update). Great
job Manu and thank you for your continued dedication to the libp2p community! 

## Interop Testing Improvements 🧇
The [interop testing](interop-testing) framework is getting some significant
upgrades. We use testing to ensure all the libp2p implementations are
compatible with each other. We run tests between every pair of implementations
and several versions of different implementations. As a consequence, the number
of tests grows exponentially with the number of implementations added. Now that
the libp2p project has nine active implementations (Python, Nim, JS, Rust, Go,
C++, .Net, JVM and litep2p) adding them all is not practical because the test
run would take hours to complete.

Recently a [pull request](interop-filter) was submitted to improve the test
runner's ability to filter and ignore tests. This allows the default GitHub CI
workflow to run the tests for the most commonly used implementations with
specialized workflows for testing features (e.g. QUIC compatibility) or
specific implementations (e.g. js-libp2p). Now there is nothing holding us back
from adding all the active implementations. Look for the addition of
py-libp2p, dotnet-libp2p, cpp-libp2p, and hopefully litep2p in the near future.

Also, a new local testing runner script and caching server [pull
request](interop-runner) was submitted to improve the experience of running the
tests locally. Here's is a recording of a terminal session using the new runner
script to run the tests for just the latest Rust, Go, and JS libp2p releases.
The local caching server enables the caching of Docker images and other
artifacts to speed up each test run by avoiding the Docker build step. The test
runner script runs the tests the same way as the GitHub CI workflow so you can
debug failing tests locally before pushing and waiting on CI.

![Local Interop Test Run](../assets/interop-tests.gif)

## Congratulations and Thanks 🎉
Each month seems to be improving on the last and April is no exception.
Congratulations to every contributor who helped push libp2p forward as a
project. Thank you to every one of you who showed up to a meeting, filed an
issue, submitted a pull request, or was just someone fun to chat with on
Discord/Telegram/Slack.

Here's to growing the momentum through May!

Cheers! 🍻

### Did You Know libp2p Has an X account?

<a href="https://twitter.com/libp2p?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @libp2p</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[Join our Discord server](https://discord.gg/5CUB5s4d) to chat with the libp2p
community, ask questions, and make friends.

[ethcc-2025]: https://ethcc.io/
[libp2p-day-ethcc-registration]: https://lu.ma/b74pwb04
[libp2p-day-ethcc-proposals]: https://forms.gle/TQGnp1LdGwPdxfLJ7
[cpp-libp2p-release]: https://github.com/libp2p/cpp-libp2p/releases/tag/v0.1.36
[py-libp2p-release]: https://github.com/libp2p/py-libp2p/releases/tag/v0.2.5
[js-libp2p-release]: https://github.com/libp2p/js-libp2p/pull/3086
[libp2p-release]: https://github.com/paritytech/litep2p/pull/382
[engres-meetings]: https://lu.ma/engres-the-gathering
[libp2p-update]: https://youtu.be/YgA1TmRpOxY?si=wpvIZr09wtHql88x&t=338
[interop-testing]: https://github.com/libp2p/test-plans/
[interop-filter]: https://github.com/libp2p/test-plans/pull/641#issuecomment-2828793799
[interop-runner]: https://github.com/libp2p/test-plans/pull/646
