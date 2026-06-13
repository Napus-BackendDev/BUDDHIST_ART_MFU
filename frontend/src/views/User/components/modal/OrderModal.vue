<template>
  <CModal
    :title="$i18n.locale === 'en' ? 'Order Details' : 'รายละเอียดการสั่งซื้อ'"
    :show.sync="localShow"
    size="lg"
    :centered="true"
  >
    <div v-if="order" class="p-4 bg-light-empty">
        <div v-if="timeLeftDisplay" class="alert alert-warning text-center mb-4 border-0 shadow-sm rounded-pill py-2">
            <CIcon name="cil-clock" class="mr-2"/>
            <span class="font-weight-bold">
                {{ $i18n.locale === 'en' ? 'Payment Deadline:' : 'หมดเวลาชำระเงินใน:' }}
                <span :class="timeLeftDisplay === 'Expired' || timeLeftDisplay === 'หมดเวลา' ? 'text-danger' : 'text-primary'" class="font-family-mono ml-1">
                    {{ timeLeftDisplay }}
                </span>
            </span>
        </div>
        <div class="d-flex flex-column flex-sm-row justify-content-between mb-5">
          <div class="mb-3 mb-sm-0">
             <h6 class="text-muted text-uppercase mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Order ID' : 'รหัสการสั่งซื้อ' }}</h6>
             <h5 class="font-weight-bold text-dark mb-0">#{{ order.orderNumber || order.orderId || order.orderIdDisplay || (order._id ? order._id.substring(order._id.length - 8).toUpperCase() : '') }}</h5>
          </div>
          <div class="text-sm-right">
             <h6 class="text-muted text-uppercase mb-1 font-weight-bold">{{ $i18n.locale === 'en' ? 'Order Date' : 'วันที่สั่งซื้อ' }}</h6>
             <h5 class="font-weight-bold text-dark mb-0">{{ order.date || order.dateDisplay || new Date(order.createdAt).toLocaleDateString('en-GB') }}</h5>
          </div>
       </div>

       <!-- Document Downloads -->
       <div class="mb-5">
           <h6 class="text-muted text-uppercase mb-3 font-weight-bold">{{ $i18n.locale === 'en' ? 'Documents' : 'เอกสาร' }}</h6>
            <CRow>
                <CCol sm="4" class="mb-2">
                    <CButton 
                        block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2"
                        @click="downloadReceipt"
                        v-if="order.image"
                    >
                        <CIcon name="cil-file" class="mr-2"/> {{ $i18n.locale === 'en' ? 'Receipt' : 'ใบเสร็จ' }}
                    </CButton>
                    <div v-else>
                        <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="d-none">
                        <CButton 
                            block color="danger" shape="pill" class="font-weight-bold shadow-sm py-2"
                            style="background-color: #E55B5B; border: none;"
                            @click="triggerUpload"
                            :disabled="isUploading"
                        >
                            <CIcon v-if="isUploading" name="cil-reload" class="mr-2 spinner-animation"/>
                            <CIcon v-else name="cil-cloud-upload" class="mr-2"/> 
                            {{ isUploading ? ($i18n.locale === 'en' ? 'Uploading...' : 'กำลังอัปโหลด...') : ($i18n.locale === 'en' ? 'Upload Slip' : 'อัปโหลดสลิป') }}
                        </CButton>
                    </div>
                </CCol>
                <CCol sm="4" class="mb-2">
                    <CButton 
                        block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2"
                        @click="downloadCertificate"
                        :disabled="!isApproved"
                    >
                        <CIcon name="cil-description" class="mr-2"/> {{ $i18n.locale === 'en' ? 'Certificate' : 'ใบรับรองผลงาน' }}
                    </CButton>
                </CCol>
                <CCol sm="4" class="mb-2">
                    <CButton 
                        block variant="outline" color="dark" shape="pill" class="font-weight-bold shadow-sm py-2"
                        @click="downloadInvoice"
                        :disabled="!order.image"
                    >
                        <CIcon name="cil-cloud-download" class="mr-2"/> {{ $i18n.locale === 'en' ? 'Invoice' : 'ใบแจ้งหนี้' }}
                    </CButton>
                </CCol>
            </CRow>
        </div>

        <!-- Addresses -->
        <div class="mb-5" v-if="order.address">
            <CRow>
                <CCol sm="6" class="mb-3 mb-sm-0">
                    <h6 class="text-muted text-uppercase mb-2 font-weight-bold">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ออกใบเสร็จ' }}</h6>
                    <div class="small text-dark mb-0 bg-white p-3 rounded shadow-sm h-100">{{ order.address.bill || '-' }}</div>
                </CCol>
                <CCol sm="6">
                    <h6 class="text-muted text-uppercase mb-2 font-weight-bold">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</h6>
                    <div class="small text-dark mb-0 bg-white p-3 rounded shadow-sm h-100">{{ order.address.shipping || '-' }}</div>
                </CCol>
            </CRow>
        </div>

        <!-- Artwork List -->
        <div class="mb-5">
           <h6 class="text-muted text-uppercase mb-3 font-weight-bold">{{ $i18n.locale === 'en' ? 'Items' : 'รายการสินค้า' }}</h6>
           <div v-for="art in order.artwork" :key="art._id" class="d-flex align-items-center mb-3 bg-white p-3 rounded-lg shadow-sm">
               <div class="art-img-preview mr-3 rounded overflow-hidden" style="width: 60px; height: 60px;">
                   <img :src="art.image" class="w-100 h-100" style="object-fit: cover;" />
               </div>
               <div class="flex-grow-1">
                   <h6 class="font-weight-bold mb-0 text-dark">{{ getName($i18n.locale, art) }}</h6>
                   <div class="small text-muted">
                     {{ art.category ? getName($i18n.locale, art.category) : '' }}
                     <span v-if="art.artist">{{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ getName($i18n.locale, art.artist) }}</span>
                   </div>
               </div>
               <div class="text-right">
                   <span class="font-weight-bold text-primary">฿{{ (art.price || 0).toLocaleString() }}</span>
               </div>
           </div>
        </div>

        <!-- Total Amount -->
        <div class="bg-white p-3 rounded-lg shadow-sm mb-0">
             <div class="d-flex justify-content-between align-items-center">
                 <h5 class="font-weight-bold text-dark mb-0">{{ $i18n.locale === 'en' ? 'Total Amount' : 'ยอดรวมทั้งสิ้น' }}</h5>
                 <h4 class="font-weight-bold text-primary mb-0">฿{{ (order.total || order.totalAmount || 0).toLocaleString() }}</h4>
             </div>
        </div>
     </div>
    <template #footer>
      <CButton @click="localShow = false" color="dark" shape="pill" class="px-4 font-weight-bold shadow-sm hover-lift btn-premium w-100">
        {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
      </CButton>
    </template>
  </CModal>
</template>

<script>
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import Service from '@/service/api';

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
  data() {
    return {
      now: Date.now(),
      timer: null,
      isUploading: false
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
    },
    timeLeftDisplay() {
      if (!this.order) return '-';
      
      const statusLabel = this.getName('en', this.order.status);
      const isPending = statusLabel && (statusLabel.toLowerCase().includes('pending') || statusLabel.toLowerCase().includes('reserved'));
      const hasNoSlip = !this.order.image;

      if (!isPending || !hasNoSlip) return null;

      const createdAt = new Date(this.order.createdAt).getTime();
      const deadline = createdAt + (24 * 60 * 60 * 1000);
      const diff = deadline - this.now;

      if (diff <= 0) return this.$i18n.locale === 'en' ? 'Expired' : 'หมดเวลา';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    },
    isApproved() {
      if (!this.order) return false;
      const statusLabel = this.getName('en', this.order.status);
      const s = statusLabel ? statusLabel.toLowerCase() : '';
      return s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success');
    }
  },
  watch: {
    show(newVal) {
        if (newVal) {
            this.startTimer();
        } else {
            this.stopTimer();
            this.isUploading = false;
        }
    }
  },
  methods: {
    startTimer() {
        this.timer = setInterval(() => {
            this.now = Date.now();
        }, 1000);
    },
    stopTimer() {
        if (this.timer) clearInterval(this.timer);
    },
    downloadReceipt() {
        if (this.order.image) {
            window.open(this.order.image, '_blank');
        }
    },
    async downloadInvoice() {
        try {
            const res = await Service.order('invoice', this.order._id);
            this.downloadFile(res.data, `Invoice_${this.order.orderNumber || this.order._id}.pdf`);
        } catch (error) {
            console.error('Download Invoice Error:', error);
        }
    },
    async downloadCertificate() {
        try {
            const res = await Service.order('certificate', this.order._id);
            this.downloadFile(res.data, `Certificate_${this.order.orderNumber || this.order._id}.pdf`);
        } catch (error) {
            console.error('Download Certificate Error:', error);
        }
    },
    downloadFile(data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    triggerUpload() {
        this.$refs.fileInput.click();
    },
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }

        try {
            this.isUploading = true;
            this.$store.commit('dialog/showToast', { title: 'Uploading...', message: 'Please wait while we upload your slip.', variant: 'info' });
            
            await this.$store.dispatch('order/upload', {
                _id: this.order._id,
                image: file
            });

            this.$store.commit('dialog/showToast', { title: 'Success', message: 'Payment slip uploaded successfully.', variant: 'success' });
            
            // Clear the file input
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }

            // Refresh order data
            await this.$store.dispatch('order/get', {});
            
            // Close modal so the UI updates
            this.localShow = false;
        } catch (error) {
            console.error('Upload failed:', error);
            alert(this.$i18n.locale === 'en' ? 'Upload failed. Please try again.' : 'เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        } finally {
            this.isUploading = false;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
