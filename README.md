# libp2p Blog & News

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg)](https://protocol.ai)
[![](https://img.shields.io/badge/platform-VuePress-green.svg)](https://vuepress.vuejs.org/)
[![](https://img.shields.io/badge/deployed%20on-Fleek-ff69b4.svg)](http://fleek.co/)


This repository contains code and content for the [libp2p Blog & News](https://blog.libp2p.io/) website.

### Adding your blog entry

It's recommend that you add your blog entry manually by creating a new Markdown file and creating a pull request.
This allows us to review blog posts line by line and go through a proper review cycle.

The steps are as follows:
1. Add your new file in `src/_blog`
2. Add any images or assets in `src/assets`
3. Add the path to your Markdown file in a new line in the file `.forestry/front_matter/templates/blog-post.yml`

When writing a new post, you'll also need to fill in the header information
```
---
tags:
  - <any tags you want i.e. libp2p>
  - libp2p
title: <title of your blog post>
description: <short description; this field is optional>
date: <the date you would like to publish the blog post, can be in the future>
permalink: <set as '' unless you want a specific permalink>
translationKey: <set as ''>
header_image: <the header image for the blog post. The file should be in src/assets and it should be added here as /filename.jpg>
author: <Your Name>
```

Here is an example pull request that adds a new blog entry for reference: https://github.com/libp2p/blog/pull/33/files

### Build and run locally

This site is built in [Vuepress](https://vuepress.vuejs.org/guide/), and uses Vue/JavaScript for functional code and Markdown for post content.

To build a local copy, run the following:

1. Clone this repository:

   ```bash
   git clone https://github.com/libp2p/blog.git
   ```

1. Move into the `blog` folder and install the npm dependencies:

   ```bash
   cd blog
   npm install
   ```

1. Start the application in _dev mode_:

   ```bash
   npm start
   ```

1. Open [localhost:8080](http://localhost:8080) in your browser.

You can close the local server with `CTRL` + `c`. To restart the local server, run `npm start` from inside the `blog` directory.

### PR and preview

Once you're happy with your local changes, please make a PR **against the `main` branch**. Including detailed notes on your PR - particularly screenshots to depict any changes in UI - will help speed up approval and deployment.

All PRs against `main` automatically generate Fleek previews to make it easier to "check your work". You can view your PR's preview by clicking `Details` in the `fleek/build` check at the bottom of your PR page:<br/>
![image](https://user-images.githubusercontent.com/1507828/110034382-9dbb5b80-7cf7-11eb-89a4-7772970677d3.png)

A reviewer will be by shortly to have a look!

## Maintainers

This site's codebase is under active maintenance by members of the core [libp2p team](https://libp2p.io/).

## License

© Protocol Labs | Code is licensed with the [MIT](LICENSE) License. Except as noted, other content licensed [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/us/).
