<template>
  <div>
    <h2 class="type-h2">Comments</h2>
    <div id="discourse-comments" class="mt-4 mb-24"></div>
  </div>
</template>

<script>
const safePermalink = (permalink, date) => {
  let domain = 'https://blog.libp2p.io/'
  const url = new URL(domain)
  url.pathname = permalink
  return url.toString()
}
export default {
  name: 'Comments',
  components: {},
  computed: {
    embedSrc() {
      return `https://discuss.libp2p.io/embed/comments?embed_url=${safePermalink(this.$frontmatter.permalink, this.$frontmatter.date)}`
    },
  },
  mounted() {
    window.DiscourseEmbed = {
      discourseUrl: 'https://discuss.libp2p.io/',
      discourseEmbedUrl: safePermalink(this.$frontmatter.permalink, this.$frontmatter.date),
    }
    const d = document.createElement('script')
    d.type = 'text/javascript'
    d.async = true
    d.src = window.DiscourseEmbed.discourseUrl + 'javascripts/embed.js'
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d)
  },
}
</script>
