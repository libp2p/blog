<script>
import RSSSubscription from '@theme/components/RSSSubscription.vue'

export default {
  name: 'LinksAndSocial',
  components: {
    RSSSubscription,
  },
  props: {
    blockLazyLoad: {
      type: Function,
      default: null,
    },
  },
  computed: {},
  methods: {},
}
</script>
