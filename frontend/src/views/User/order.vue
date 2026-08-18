<template>
  <div class="user-orders-view min-vh-100 py-4 bg-light-premium">
    <CContainer class="profile-container-wide">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-end mb-4 flex-wrap">
        <div>
          <h2 class="font-weight-bold text-dark section-title">{{ $i18n.locale === 'en' ? 'My Orders' : 'คำสั่งซื้อของฉัน' }}</h2>
          <div class="title-separator-sm mb-3"></div>
          <p class="text-muted mb-0">{{ $i18n.locale === 'en' ? 'Track your past purchases and delivery status.' : 'ติดตามประวัติการสั่งซื้อและสถานะการจัดส่ง' }}</p>
        </div>
        <CButton color="dark" variant="outline" shape="pill" class="btn-sm font-weight-bold shadow-sm hover-lift mt-3 mt-md-0" @click="$router.push('/user')">
          <CIcon name="cil-arrow-left" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Back to Dashboard' : 'กลับไปที่แดชบอร์ด' }}
        </CButton>
      </div>

      <!-- Orders List Card -->
      <CCard class="border-0 shadow-premium rounded-xl overflow-hidden mt-4">
        <CCardHeader class="bg-white border-bottom-0 pt-4 pb-3 px-4 d-flex justify-content-between align-items-center flex-wrap">
          <h5 class="font-weight-bold text-dark mb-0">{{ $i18n.locale === 'en' ? 'Order History' : 'ประวัติการสั่งซื้อ' }}</h5>
          
          <div class="d-flex align-items-center mt-3 mt-sm-0">
             <div class="search-box" style="min-width: 300px;">
               <CInput 
                 v-model="search"
                 :placeholder="$i18n.locale === 'en' ? 'Search orders...' : 'ค้นหาคำสั่งซื้อ...'" 
                 class="custom-search-input mb-0"
               >
                 <template #prepend-content><CIcon name="cilMagnifyingGlass"/></template>
               </CInput>
             </div>
          </div>
        </CCardHeader>

        <CCardBody class="p-0">
          <CDataTable
            :key="tableKey"
            :items="filteredOrders"
            :fields="fields"
            :items-per-page="5"
            :active-page="activePage"
            hover
            class="custom-table mb-0"
          >
            <template #orderId="{item}">
              <td class="align-middle py-3">
                <div class="d-flex align-items-center">
                  <div class="artwork-thumb mr-3 shadow-sm rounded overflow-hidden" style="width: 50px; height: 50px; min-width: 50px; background-color: #f0f0f0;">
                    <img v-if="item.artwork && item.artwork[0] && item.artwork[0].image" 
                         :src="item.artwork[0].image" 
                         class="w-100 h-100" 
                         style="object-fit: cover;" />
                    <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                      <CIcon name="cil-image" />
                    </div>
                  </div>
                  <div>
                    <div class="font-weight-bold text-dark text-truncate" style="max-width: 200px;">
                      {{ item.artwork && item.artwork[0] ? getName($i18n.locale, item.artwork[0]) : ($i18n.locale === 'en' ? 'No Artwork' : 'ไม่มีผลงาน') }}
                    </div>
                    <div class="small text-muted mb-1">
                      {{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ item.artwork && item.artwork[0] && item.artwork[0].artist ? getName($i18n.locale, item.artwork[0].artist) : ($i18n.locale === 'en' ? 'Artist' : 'ศิลปิน') }}
                    </div>
                    <div class="smallest text-muted font-family-mono">
                      ID: {{ item.orderNumber || item._id.substring(item._id.length - 8).toUpperCase() }}
                    </div>
                  </div>
                </div>
              </td>
            </template>
            
            <template #date="{item}">
              <td class="align-middle text-muted">
                {{ item.date }}
              </td>
            </template>

            <template #total="{item}">
              <td class="align-middle font-weight-bold text-success">
                ฿{{ item.total.toLocaleString() }}
              </td>
            </template>

            <template #status="{item}">
              <td class="align-middle">
                <div :class="['status-badge', getStatusBadge(item.statusName).class]">
                  <CIcon :name="getStatusBadge(item.statusName).icon" size="sm" class="status-icon" /> 
                  {{ getStatusBadge(item.statusName).label }}
                </div>
              </td>
            </template>

            <template #timeLeft="{item}">
              <td class="align-middle">
                <span :class="item.timeLeftDisplay === 'Expired' || item.timeLeftDisplay === 'หมดเวลา' ? 'text-danger font-weight-bold' : 'text-primary font-family-mono'">
                  {{ item.timeLeftDisplay }}
                </span>
              </td>
            </template>

            <template #action="{item}">
              <td class="align-middle text-right px-4" style="white-space: nowrap;">
                <!-- If not paid (no slip image) -->
                <button 
                  v-if="!item.image && (item.statusName === 'Pending Payment' || item.statusName === 'รอชำระเงิน')"
                  class="btn-quick-pay mr-2" 
                  v-c-tooltip="$i18n.locale === 'en' ? 'Upload Slip to Pay' : 'ชำระเงิน / ส่งสลิป'"
                  @click="triggerOrderSlipUpload(item)"
                >
                  <CIcon name="cil-cloud-upload" class="mr-1" />
                  {{ $i18n.locale === 'en' ? 'Pay' : 'ชำระเงิน' }}
                </button>

                <!-- Paid documents -->
                <template v-else-if="item.statusName !== 'Rejected' && item.statusName !== 'ยกเลิก'">
                  <!-- Receipt (Slip) -->
                  <button 
                    class="action-btn-doc icon-receipt mr-1" 
                    v-c-tooltip="$i18n.locale === 'en' ? 'Receipt (Slip)' : 'ใบเสร็จ (สลิป)'"
                    @click="downloadReceipt(item)"
                  >
                    <CIcon name="cil-file" size="sm" />
                  </button>

                  <!-- Invoice -->
                  <button 
                    class="action-btn-doc icon-invoice mr-1" 
                    v-c-tooltip="$i18n.locale === 'en' ? 'Download Invoice' : 'ดาวน์โหลดใบแจ้งหนี้'"
                    @click="downloadInvoice(item)"
                  >
                    <CIcon name="cil-cloud-download" size="sm" />
                  </button>

                  <!-- Certificate (Only if Approved) -->
                  <button 
                    class="action-btn-doc icon-cert mr-1" 
                    v-c-tooltip="!isApprovedOrder(item) ? ($i18n.locale === 'en' ? 'Locked: Order not approved yet' : 'ล็อก: ยังไม่อนุมัติคำสั่งซื้อ') : ($i18n.locale === 'en' ? 'Download Certificate' : 'ดาวน์โหลดใบรับรองผลงาน')"
                    @click="downloadCertificate(item)"
                    :disabled="!isApprovedOrder(item)"
                    :class="{ 'disabled-btn': !isApprovedOrder(item) }"
                  >
                    <CIcon name="cil-description" size="sm" />
                  </button>
                </template>

                <!-- View Details -->
                <button 
                    class="action-btn icon-view" 
                    v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'"
                    @click="viewDetails(item)"
                >
                    <CIcon name="cilMagnifyingGlass" size="lg" />
                </button>
              </td>
            </template>
          </CDataTable>
        </CCardBody>
        
        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="filteredOrders.length > 0">
                {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} {{ (activePage - 1) * 10 + 1 }} {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} {{ Math.min(activePage * 10, filteredOrders.length) }} {{ $i18n.locale === 'en' ? 'of' : 'จาก' }} {{ filteredOrders.length }} {{ $i18n.locale === 'en' ? 'orders' : 'รายการ' }}
            </div>
            <div class="text-muted text-sm" v-else>
                {{ $i18n.locale === 'en' ? 'Showing 0 orders' : 'ไม่พบรายการ' }}
            </div>
            <CPagination
                :active-page.sync="activePage"
                :pages="Math.max(1, Math.ceil(filteredOrders.length / 10))"
                size="sm"
                align="end"
                class="mb-0 pill-pagination"
            />
        </CCardFooter>
      </CCard>
    </CContainer>

    <OrderModal 
      :show.sync="showModal" 
      :order="selectedOrder" 
    />
    
    <input type="file" ref="orderSlipInput" class="d-none" @change="handleOrderSlipUpload" accept="image/*" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import OrderModal from './components/modal/OrderModal.vue';
import Service from '@/service/api';

export default {
  name: 'UserOrders',
  components: {
    OrderModal
  },
  mixins: [statusBadgeMixin],
  data() {
    return {
      showModal: false,
      selectedOrder: null,
      search: '',
      activePage: 1,
      now: Date.now(),
      timer: null,
      tableKey: 0
    }
  },
  computed: {
    ...mapGetters({
      allOrders: 'order/orders',
      userId: 'auth/userId'
    }),
    fields() {
      return [
        { key: 'orderId', label: this.$i18n.locale === 'en' ? 'ARTWORK' : 'ผลงานศิลปะ', _classes: 'font-weight-bold' },
        { key: 'date', label: this.$i18n.locale === 'en' ? 'Date Purchased' : 'วันที่สั่งซื้อ' },
        { key: 'total', label: this.$i18n.locale === 'en' ? 'Total Amount' : 'ยอดสุทธิ' },
        { key: 'status', label: this.$i18n.locale === 'en' ? 'Status' : 'สถานะ' },
        { key: 'timeLeft', label: this.$i18n.locale === 'en' ? 'Time Left' : 'เวลาที่เหลือ' },
        { key: 'action', label: this.$i18n.locale === 'en' ? 'Actions' : 'สถานะดำเนินการ', sorter: false, filter: false, _classes: 'text-right' }
      ]
    },
    processedOrders() {
      if (!this.allOrders) return [];
      // Filter orders belonging to the current user
      return this.allOrders
        .filter(order => order.user === this.userId || (order.user && order.user._id === this.userId))
        .map(order => ({
          ...order,
          orderId: order.orderNumber || order._id.substring(order._id.length - 8).toUpperCase(),
          date: new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          total: order.artwork ? order.artwork.reduce((acc, art) => acc + (art.price || 0), 0) : 0,
          statusName: (() => {
            const statusLabel = this.getName('en', order.status);
            const s = statusLabel ? statusLabel.toLowerCase() : '';
            if (s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success')) return this.$i18n.locale === 'en' ? 'Approved' : 'ยืนยันข้อมูล';
            if (s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('fail')) return this.$i18n.locale === 'en' ? 'Rejected' : 'ยกเลิก';
            
            if (!order.image) {
                return this.$i18n.locale === 'en' ? 'Pending Payment' : 'รอชำระเงิน';
            } else {
                return this.$i18n.locale === 'en' ? 'Pending Verification' : 'รอดำเนินการ';
            }
          })(),
          timeLeftDisplay: this.calculateTimeLeft(order)
        }));
    },
    filteredOrders() {
      let orders = this.processedOrders;
      if (this.search) {
        const q = this.search.toLowerCase();
        orders = this.processedOrders.filter(o => 
          o.orderId.toLowerCase().includes(q) ||
          o.statusName.toLowerCase().includes(q) ||
          o.date.toLowerCase().includes(q)
        );
      }
      return [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  },
  async created() {
    await this.$store.dispatch('order/get', {});
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    calculateTimeLeft(order) {
      // Only show countdown for items without a slip that are not completed/cancelled
      const statusLabel = this.getName('en', order.status);
      const s = statusLabel ? statusLabel.toLowerCase() : '';
      
      const isCompletedOrCancelled = s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success') || s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('fail');
      const hasSlip = !!order.image;

      if (isCompletedOrCancelled || hasSlip) return '-';

      const createdAt = new Date(order.createdAt).getTime();
      const deadline = createdAt + (24 * 60 * 60 * 1000);
      const diff = deadline - this.now;

      if (diff <= 0) return this.$i18n.locale === 'en' ? 'Expired' : 'หมดเวลา';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours}h ${minutes}m ${seconds}s`;
    },
    viewDetails(item) {
      this.selectedOrder = item;
      this.showModal = true;
    },
    triggerOrderSlipUpload(item) {
      this.selectedOrder = item;
      this.$nextTick(() => {
        if (this.$refs.orderSlipInput) {
          this.$refs.orderSlipInput.click();
        }
      });
    },
    async handleOrderSlipUpload(event) {
      const file = event.target.files[0];
      if (!file || !this.selectedOrder) return;

      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }

      try {
        this.$store.commit('dialog/showToast', { 
          title: this.$i18n.locale === 'en' ? 'Uploading...' : 'กำลังอัปโหลด...', 
          message: this.$i18n.locale === 'en' ? 'Please wait while we upload your slip.' : 'โปรดรอสักครู่ขณะระบบกำลังอัปโหลดสลิปของคุณ', 
          variant: 'info' 
        });
        
        await this.$store.dispatch('order/upload', {
          _id: this.selectedOrder._id,
          image: file
        });

        this.$store.commit('dialog/showToast', { 
          title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ', 
          message: this.$i18n.locale === 'en' ? 'Payment slip uploaded successfully.' : 'อัปโหลดสลิปชำระเงินเรียบร้อยแล้ว', 
          variant: 'success' 
        });

        // Refresh orders data
        await this.$store.dispatch('order/get', {});
        this.tableKey += 1;
      } catch (error) {
        console.error('Upload failed:', error);
        alert(this.$i18n.locale === 'en' ? 'Upload failed. Please try again.' : 'เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (this.$refs.orderSlipInput) {
          this.$refs.orderSlipInput.value = '';
        }
        this.selectedOrder = null;
      }
    },
    async downloadInvoice(item) {
      try {
        const orderId = item._id;
        const response = await this.$store.dispatch('order/getInvoice', orderId);
        
        // Create a blob link to download the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Invoice_${item.orderId || item._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
        alert(this.$i18n.locale === 'en' ? 'Could not download invoice. Please try again.' : 'ไม่สามารถดาวน์โหลดใบเสร็จได้ กรุณาลองใหม่อีกครั้ง');
      }
    },
    downloadReceipt(item) {
      if (item.image) {
        window.open(item.image, '_blank');
      }
    },
    async downloadCertificate(item) {
      try {
        const res = await Service.order('certificate', item._id);
        
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Certificate_${item.orderId || item._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download Certificate Error:', error);
        alert(this.$i18n.locale === 'en' ? 'Failed to download certificate.' : 'ดาวน์โหลดใบรับรองไม่สำเร็จ');
      }
    },
    isApprovedOrder(item) {
      const statusLabel = this.getName('en', item.status);
      const s = statusLabel ? statusLabel.toLowerCase() : '';
      return s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success');
    }
  }
}
</script>

<style scoped>
/* ... existing styles ... */
.badge-info, .status-badge.badge-info {
    background-color: rgba(52, 152, 219, 0.1) !important;
    color: #2980b9 !important;
    border: 1px solid #2980b9 !important;
}

.btn-quick-pay {
    background-color: #e55b5b;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 6px 16px;
    font-weight: 700;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(229, 91, 91, 0.2);
    display: inline-flex;
    align-items: center;
}
.btn-quick-pay:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(229, 91, 91, 0.3);
}

.action-btn-doc {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.action-btn-doc.icon-receipt {
    background-color: #fff9db;
    color: #f59f00;
    border-color: rgba(245, 159, 0, 0.35);
}
.action-btn-doc.icon-receipt:hover {
    background-color: #f59f00;
    color: white;
    border-color: #f59f00;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(245, 159, 0, 0.2);
}

.action-btn-doc.icon-invoice {
    background-color: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
}
.action-btn-doc.icon-invoice:hover {
    background-color: #8c1515;
    color: white;
    border-color: #8c1515;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(140, 21, 21, 0.15);
}

.action-btn-doc.icon-cert {
    background-color: #ebfbee;
    color: #40c057;
    border-color: rgba(64, 192, 87, 0.35);
}
.action-btn-doc.icon-cert:not(.disabled-btn):hover {
    background-color: #40c057;
    color: white;
    border-color: #40c057;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(64, 192, 87, 0.2);
}

.action-btn.icon-view {
    background-color: #f0f7ff;
    color: #007bff;
    border: 1px solid #d6eaff;
}
.action-btn.icon-view:hover {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.action-btn-doc:hover {
    background-color: #8c1515;
    color: white;
    border-color: #8c1515;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(140, 21, 21, 0.15);
}
.action-btn-doc.disabled-btn {
    background-color: #f1f5f9;
    color: #94a3b8;
    border-color: #e2e8f0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
.action-btn-doc.disabled-btn:hover {
    background-color: #f1f5f9;
    color: #94a3b8;
    border-color: #e2e8f0;
    transform: none;
    box-shadow: none;
}

.action-btn-doc:focus-visible,
.action-btn.icon-view:focus-visible,
.btn-quick-pay:focus-visible {
    outline: 3px solid rgba(0, 123, 255, 0.25);
    outline-offset: 2px;
}

.action-btn.icon-download {
    background-color: #f1f5f9;
    color: #475569;
}

.action-btn.icon-download:hover {
    background-color: #8c1515;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(140, 21, 21, 0.2);
}

.bg-light-premium {
    background-color: #f8f9fa;
}

.section-title {
    font-family: 'Cinzel', serif;
    font-size: 2.2rem;
    color: #2c3e50;
    letter-spacing: 1px;
}

.title-separator-sm {
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, #d4af37, #f3e5ab);
    border-radius: 2px;
}

.shadow-premium {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}

.rounded-xl {
    border-radius: 20px !important;
}

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-3px);
}

.bg-light-empty {
    background-color: #f8f9fa;
}

/* Custom Search Input */
.custom-search-input ::v-deep .form-control {
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    padding-left: 10px;
    background-color: #f8fafc;
    transition: all 0.3s ease;
}

.custom-search-input ::v-deep .form-control:focus {
    background-color: #ffffff;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

/* Premium Table Styles */
.premium-table ::v-deep table {
    margin-bottom: 0;
}

.premium-table ::v-deep thead th {
    border-top: none;
    border-bottom: 2px solid #f1f5f9;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
    background-color: #ffffff;
}

.premium-table ::v-deep tbody td {
    padding: 1rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
}

.btn-premium {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    color: white !important;
    border: none;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-premium:hover {
    background: linear-gradient(135deg, #8a3a31 0%, #612721 100%);
    box-shadow: 0 8px 20px rgba(97, 39, 33, 0.25) !important;
    transform: translateY(-2px);
}
</style>
