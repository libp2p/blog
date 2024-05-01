<script>
import { mapState } from 'vuex'

export default {
  name: 'NewsletterForm',
  props: {},
  data: () => ({
    email: null,
  }),
  computed: {
    ...mapState('appState', ['latestWeeklyPost']),
  },
  methods: {},
}
</script>
