<template>
  <div>
    <h2 class="type-h2">Comments</h2>
    <div id="discourse-comments" class="mt-4 mb-24"></div>
  </div>
</template>

<script type="text/javascript">
DiscourseEmbed = {
  discourseUrl: 'https://discuss.libp2p.io/',
  discourseEmbedUrl: 'EMBED_URL',
};

(function() {
  var d = document.createElement('script'); d.type = 'text/javascript'; d.async = true;
  d.src = DiscourseEmbed.discourseUrl + 'javascript/embed.js';
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d);
})();
</script>
