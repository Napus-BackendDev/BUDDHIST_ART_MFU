<template>
  <CModal
    title="Order Details"
    :show.sync="localShow"
    size="lg"
    :centered="true"
  >
    <div v-if="order" class="p-4 bg-light-empty">
       <div class="d-flex flex-column flex-sm-row justify-content-between mb-5">
          <div class="mb-3 mb-sm-0">
             <h6 class="text-muted text-uppercase mb-1 font-weight-bold">Order ID</h6>
             <h5 class="font-weight-bold text-dark mb-0">#{{ order.orderId }}</h5>
          </div>
          <div class="text-sm-right">
             <h6 class="text-muted text-uppercase mb-1 font-weight-bold">Order Date</h6>
             <h5 class="font-weight-bold text-dark mb-0">{{ order.date }}</h5>
          </div>
       </div>

       <!-- Document Downloads -->
       <div class="mb-5">
           <h6 class="text-muted text-uppercase mb-3 font-weight-bold">Documents</h6>
           <CRow>
               <CCol sm="4" class="mb-2">
                   <CButton block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2">
                       <CIcon name="cil-file" class="mr-2"/> Receipt
                   </CButton>
               </CCol>
               <CCol sm="4" class="mb-2">
                   <CButton block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2">
                       <CIcon name="cil-description" class="mr-2"/> Certificate
                   </CButton>
               </CCol>
               <CCol sm="4" class="mb-2">
                   <CButton block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2">
                       <CIcon name="cil-cloud-download" class="mr-2"/> Invoice
                   </CButton>
               </CCol>
           </CRow>
       </div>

       <!-- Addresses -->
       <div class="mb-5" v-if="order.address">
           <CRow>
               <CCol sm="6" class="mb-3 mb-sm-0">
                   <h6 class="text-muted text-uppercase mb-2 font-weight-bold">Billing Address</h6>
                   <div class="small text-dark mb-0 bg-white p-3 rounded shadow-sm h-100">{{ order.address.bill || '-' }}</div>
               </CCol>
               <CCol sm="6">
                   <h6 class="text-muted text-uppercase mb-2 font-weight-bold">Shipping Address</h6>
                   <div class="small text-dark mb-0 bg-white p-3 rounded shadow-sm h-100">{{ order.address.shipping || '-' }}</div>
               </CCol>
           </CRow>
       </div>

       <!-- Artwork List -->
       <div class="mb-5">
          <h6 class="text-muted text-uppercase mb-3 font-weight-bold">Items</h6>
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
                  <span class="font-weight-bold text-primary">฿{{ art.price.toLocaleString() }}</span>
              </div>
          </div>
       </div>

       <!-- Total Amount -->
       <div class="bg-white p-3 rounded-lg shadow-sm mb-0">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="font-weight-bold text-dark mb-0">Total Amount</h5>
                <h4 class="font-weight-bold text-primary mb-0">฿{{ order.total.toLocaleString() }}</h4>
            </div>
       </div>
    </div>
    <template #footer>
      <CButton @click="localShow = false" color="dark" shape="pill" class="px-4 font-weight-bold shadow-sm hover-lift btn-premium w-100">
        Close
      </CButton>
    </template>
  </CModal>
</template>

<script>
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
