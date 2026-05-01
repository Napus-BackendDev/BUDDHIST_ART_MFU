<template>
  <CModal
    title="Order Details"
    :show.sync="localShow"
    size="lg"
    :centered="true"
  >
    <div v-if="order" class="p-4 bg-light-empty">
       <CRow class="mb-4">
          <CCol sm="6">
             <h6 class="text-muted text-uppercase mb-1 small font-weight-bold">Order ID</h6>
             <h5 class="font-weight-bold text-dark">#{{ order.orderId }}</h5>
          </CCol>
          <CCol sm="6" class="text-sm-right">
             <h6 class="text-muted text-uppercase mb-1 small font-weight-bold">Order Date</h6>
             <h5 class="font-weight-bold text-dark">{{ order.date }}</h5>
          </CCol>
       </CRow>

       <!-- Document Downloads -->
          <div class="mb-4 px-1">
              <h6 class="text-muted text-uppercase mb-3 small font-weight-bold">Documents</h6>
              <CRow>
                  <CCol sm="6" class="mb-2">
                      <CButton block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2">
                          <CIcon name="cil-file" class="mr-2"/> Receipt
                      </CButton>
                  </CCol>
                  <CCol sm="6" class="mb-2">
                      <CButton block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2">
                          <CIcon name="cil-cloud-download" class="mr-2"/> Invoice
                      </CButton>
                  </CCol>
              </CRow>
          </div>

       <!-- Artwork List -->
       <div class="mb-4">
          <h6 class="text-muted text-uppercase mb-3 small font-weight-bold">Items</h6>
          <div v-for="art in order.artwork" :key="art._id" class="d-flex align-items-center mb-3 bg-white p-3 rounded-lg shadow-sm">
              <div class="art-img-preview mr-3 rounded overflow-hidden" style="width: 60px; height: 60px;">
                  <img :src="art.image" class="w-100 h-100" style="object-fit: cover;" />
              </div>
              <div class="flex-grow-1">
                  <h6 class="font-weight-bold mb-0 text-dark">{{ getName('en', art) }}</h6>
                  <div class="small text-muted">
                    {{ art.category ? getName('en', art.category) : '' }}
                    <span v-if="art.artist">by {{ getName('en', art.artist) }}</span>
                  </div>
              </div>
              <div class="text-right">
                  <div class="font-weight-bold text-primary mb-1">฿{{ art.price.toLocaleString() }}</div>
                  <CButton 
                      v-if="order.statusName === 'Approved' || order.statusName === 'Completed'"
                      size="sm" 
                      color="dark" 
                      variant="outline"
                      class="px-2 py-1 text-nowrap"
                      style="font-size: 0.75rem;"
                      @click="downloadCertificate(art._id)"
                  >
                      <CIcon name="cil-description" class="mr-1" size="sm"/> Certificate
                  </CButton>
              </div>
          </div>
       </div>

       <CCard class="border-0 shadow-sm rounded-lg mb-0">
           <CCardBody>
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="font-weight-bold text-dark mb-0">Total Amount</h5>
                    <h4 class="font-weight-bold text-primary mb-0">฿{{ order.total.toLocaleString() }}</h4>
                </div>
           </CCardBody>
       </CCard>
    </div>
    <template #footer>
      <CButton @click="localShow = false" color="dark" shape="pill" class="px-4 font-weight-bold shadow-sm hover-lift btn-premium w-100">
        Close
      </CButton>
    </template>
  </CModal>
</template>

<script>
import axios from 'axios';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
  name: 'OrderModal',
  mixins: [statusBadgeMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    order: {
      type: Object,
      default: () => null
    }
  },
  computed: {
    localShow: {
      get() {
        return this.show;
      },
      set(val) {
        this.$emit('update:show', val);
      }
    }
  },
  methods: {
    async downloadCertificate(art_id,order_id) {
        const art = this.order.artwork.find(a => a._id === art_id);
        if (!art) {
          this.$store.commit('dialog/showToast', {
            title: 'Error',
            message: 'Artwork not found.',
            variant: 'danger'
          });
          return;
        }
        const baseUrl = (process.env.VUE_APP_API_URL || '').replace(/\/$/, '');
        try {
          const response = await axios.post(
            baseUrl + '/api/v1/order/generate-pdf',
            {
              artworkPath: art.image,
              artwork_id: art_id,
              order_id: this.order.orderId
            },
            { responseType: 'blob' }
          );
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } catch (error) {
          this.$store.commit('dialog/showToast', {
            title: 'Error',
            message: 'Failed to generate certificate.',
            variant: 'danger'
          });
        }
    }
  }
}
</script>

<style scoped>
.btn-premium {
    background: #2c3e50;
    border: none;
    color: white;
    transition: all 0.3s ease;
}

.btn-premium:hover {
    background: #1a252f;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.hover-lift {
    transition: transform 0.2s ease;
}

.hover-lift:hover {
    transform: translateY(-2px);
}
</style>
