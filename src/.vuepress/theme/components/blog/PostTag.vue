<template>
  <router-link
    v-if="link"
    :to="{ path: $localePath, query: { tags: tag.slug } }"
    :class="computedClass"
    rel="nofollow"
  >
    #{{ tag.name }}
  </router-link>
  <button v-else :class="computedClass">
    #{{ tag.name }}
  </button>
</template>

<script>
export default {
  name: 'PostTag',
  props: {
    link: {
      type: Boolean,
      default: () => false,
    },
    tag: {
      type: Object,
      required: true,
    },
    dark: {
      type: Boolean,
      default: null,
    },
    className: {
      type: String,
      default: '',
    },
    callback: {
      type: Function,
      default: () => {},
    },
    parent: {
      type: String,
      default: 'card',
    },
  },
  computed: {
    computedClass() {
      return [
        'post-tag leading-none p-1 mr-1 rounded cursor-pointer transition duration-300 ease-in-out',
        this.dark
          ? 'bg-white text-charcoal hover:bg-charcoalMuted hover:text-white my-1'
          : 'bg-white text-charcoalMuted hover:bg-charcoalMuted hover:text-white',
        this.className,
      ]
    },
  },
  methods: {},
}
</script>
