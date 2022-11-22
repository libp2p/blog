<script>
import { mapState } from 'vuex'

import countly from '../../util/countly'

export default {
  name: 'NewsletterForm',
  props: {},
  data: () => ({
    email: null,
  }),
  computed: {
    ...mapState('appState', ['latestWeeklyPost']),
  },
  methods: {
    subscribeClick() {
      countly.trackEvent(countly.events.NEWSLETTER_SUBSCRIBE)
    },
  },
}
</script>
