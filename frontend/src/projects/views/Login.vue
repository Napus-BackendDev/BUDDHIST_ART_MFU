<template>
  <div>
    <CRow>
      <CCol>
      </CCol>
    </CRow>
  </div>
</template>
<script>
export default {
  name: 'index',
  props: {
    icon: {
      type: String,
      default: 'cil-user'
    },
    caption: {
      type: String,
      default: 'Create / Update'
    },

  },
  data() {
    return {


    }
  },

  mounted() {

  },

  created() {
    this.onInit();
  },

  beforeDestroy() {

  },

  methods: {
    onInit() {
      this.$store.commit('auth/showSignInModal', true);
    },


  },

  watch: {

  }
}

</script>
