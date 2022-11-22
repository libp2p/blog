<script>
import RSSSubscription from '@theme/components/RSSSubscription.vue'

import countly from '../../util/countly'

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
  methods: {
    trackSubmitItem() {
      countly.trackEvent(countly.events.LINK_CLICK_SUBMIT_ITEM)
    },
    trackPressKit() {
      countly.trackEvent(countly.events.LINK_CLICK_PRESS_KIT)
    },
  },
}
</script>
