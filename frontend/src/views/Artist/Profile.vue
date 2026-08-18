<template>
  <div v-if="form" class="profile-view-bg min-vh-100 pt-5 pb-4">
    <CContainer class="profile-container-wide">
    <ArtistProfileHeader 
      :user="user" 
      :isPublic="isPublic" 
      @edit="isEditing = true" 
      @navigate="handleNavigate"
    />

    <PostTermSaleNotice v-if="!isPublic" />
 
      <transition name="fade" mode="out-in">
        
        <div v-if="activeView === 'portfolio'" key="portfolio">
          <!-- Artwork Portfolio Section -->
          <CCard class="profile-portfolio-card mt-4 border-0 shadow-premium rounded-xl overflow-hidden">
            <CCardHeader class="portfolio-header bg-white border-0 pt-5 px-4 px-md-5 d-flex justify-content-between align-items-end flex-wrap">
              <div class="header-title-group mb-3 mb-md-0">
                <h3 class="mb-1 font-weight-bold text-dark portfolio-title">{{ $i18n.locale === 'en' ? 'My Artwork Portfolio' : 'ข้อมูลผลงานของฉัน' }}</h3>
                <p class="text-muted mb-0 portfolio-subtitle">{{ $i18n.locale === 'en' ? 'Explore and manage your collection of digital and physical art pieces.' : 'สำรวจและจัดการคอลเลกชันผลงานศิลปะดิจิทัลและศิลปะบนผืนผ้าใบของคุณ' }}</p>
              </div>
              <div v-if="!isPublic" class="header-actions-group">
                <CButton color="primary" shape="pill" class="px-4 py-2 font-weight-bold shadow-sm btn-add-artwork" @click="handleAddNewArtwork">
                  <CIcon name="cil-plus" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Add New Artwork' : 'เพิ่มผลงานศิลปะใหม่' }}
                </CButton>
              </div>
            </CCardHeader>
            
            <CCardBody class="p-4 p-md-5">
              <div class="portfolio-grid-container">
                <ArtworkCard 
                  :artworks="paginatedArtworks" 
                  :isPublic="isPublic"
                  @edit="handleEditArtwork"
                  @delete="handleDeleteArtwork"
                />
              </div>

              <!-- Portfolio Pagination -->
              <div v-if="totalArtworksPages > 1" class="d-flex justify-content-center mt-5 mb-2">
                <CPagination
                  :active-page.sync="activePage"
                  :pages="totalArtworksPages"
                  align="center"
                  class="premium-pagination"
                />
              </div>
            </CCardBody>
          </CCard>
      
        </div>

        <div v-else-if="activeView === 'submissions'" key="submissions" class="mt-4">
          <ArtistSubmissions @view-detail="handleViewDetail" />
        </div>

        <div v-else-if="activeView === 'submission-detail'" key="submission-detail" class="mt-4">
          <ArtistSubmissionsDetail 
            :id="selectedSubmissionId" 
            @back="activeView = 'submissions'" 
          />
        </div>

        <div v-else-if="activeView === 'orders'" key="orders" class="mt-4">
          <CCard class="border-0 shadow-premium rounded-xl overflow-hidden">
            <CCardHeader class="bg-white border-0 pt-5 px-4 px-md-5 d-flex justify-content-between align-items-center flex-wrap">
              <div class="header-title-group mb-3 mb-md-0">
                <h3 class="mb-1 font-weight-bold text-dark portfolio-title">{{ $i18n.locale === 'en' ? 'My Order History' : 'ประวัติคำสั่งซื้อของฉัน' }}</h3>
                <p class="text-muted mb-0 portfolio-subtitle">{{ $i18n.locale === 'en' ? 'Track your past purchases and collection expansion.' : 'ติดตามการสั่งซื้อและการขยายคอลเลกชันของคุณ' }}</p>
              </div>
              <div class="search-box" style="min-width: 300px;">
                <CInput 
                  v-model="orderSearch"
                  :placeholder="$i18n.locale === 'en' ? 'Search orders...' : 'ค้นหาคำสั่งซื้อ...'" 
                  class="custom-search-input mb-0"
                >
                  <template #prepend-content><CIcon name="cilMagnifyingGlass"/></template>
                </CInput>
              </div>
            </CCardHeader>

            <CCardBody class="p-0">
              <CDataTable
                :items="filteredOrders"
                :fields="[
                  { key: 'orderIdDisplay', label: $i18n.locale === 'en' ? 'Order ID' : 'รหัสคำสั่งซื้อ' },
                  { key: 'dateDisplay', label: $i18n.locale === 'en' ? 'Date' : 'วันที่' },
                  { key: 'totalAmount', label: $i18n.locale === 'en' ? 'Total' : 'ยอดรวม' },
                  { key: 'statusName', label: $i18n.locale === 'en' ? 'Status' : 'สถานะ' },
                  { key: 'timeLeft', label: $i18n.locale === 'en' ? 'Time Left' : 'เวลาที่เหลือ' },
                  { key: 'action', label: '', _style: 'width:1%', sorter: false, filter: false }
                ]"
                :items-per-page="10"
                :active-page="orderActivePage"
                hover
                class="custom-table mb-0"
              >
                <template #orderIdDisplay="{item}">
                  <td class="align-middle py-3 px-4">
                    <div class="d-flex align-items-center">
                      <div class="artwork-thumb mr-3 shadow-sm rounded overflow-hidden" style="width: 45px; height: 45px; background-color: #f8fafc; min-width: 45px;">
                        <img v-if="item.artwork && item.artwork[0]" :src="item.artwork[0].image" class="w-100 h-100 object-fit-cover" />
                        <CIcon v-else name="cil-image" class="text-muted m-2" />
                      </div>
                      <div>
                        <div class="font-weight-bold text-dark mb-0 line1" style="max-width: 200px;">
                          {{ item.artwork && item.artwork[0] ? getName($i18n.locale, item.artwork[0]) : '#' + item.orderIdDisplay }}
                        </div>
                        <div class="small text-muted d-flex align-items-center">
                          <span v-if="item.artwork && item.artwork.length > 0">
                            {{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ getOrderArtists(item) }}
                          </span>
                        </div>
                        <div v-if="item.artwork && item.artwork.length > 1" class="small text-info font-weight-bold mt-1">
                          +{{ item.artwork.length - 1 }} {{ $i18n.locale === 'en' ? 'more item(s)' : 'รายการเพิ่มเติม' }}
                        </div>
                      </div>
                    </div>
                  </td>
                </template>
                <template #dateDisplay="{item}">
                  <td class="align-middle text-muted px-4">{{ item.dateDisplay }}</td>
                </template>
                <template #totalAmount="{item}">
                  <td class="align-middle font-weight-bold text-primary px-4">฿{{ item.totalAmount.toLocaleString() }}</td>
                </template>
                <template #statusName="{item}">
                  <td class="align-middle px-4">
                    <div :class="['status-badge', getStatusBadge(item.statusName).class]">
                      <CIcon :name="getStatusBadge(item.statusName).icon" class="status-icon mr-1" />
                      {{ item.statusName }}
                    </div>
                  </td>
                </template>
                <template #timeLeft="{item}">
                  <td class="align-middle px-4">
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
                        @click="viewOrderDetails(item)"
                    >
                        <CIcon name="cilMagnifyingGlass" size="lg" />
                    </button>
                  </td>
                </template>
              </CDataTable>
            </CCardBody>
          </CCard>
        </div>
      </transition>
    </CContainer>

    <OrderModal 
      :show.sync="showOrderModal" 
      :order="selectedOrder" 
    />

    <EditProfileModal 
      v-if="form"
      :show.sync="isEditing" 
      :initialData="form"
      :loading="loading"
      @save="onProfileSave"
      @cancel="fetchProfile"
    />
    
    <ArtworkCreateModal 
      v-if="!isPublic"
      :show="showArtworkModal" 
      :initialArtistId="userId"
      :loading="loading"
      @update:show="showArtworkModal = $event"
      @save="handleArtworkSave"
    />

    <ArtworkEditModal
      v-if="!isPublic"
      :show="showEditModal"
      :artwork="selectedArtwork"
      :loading="loading"
      @update:show="showEditModal = $event"
      @save="handleArtworkUpdate"
    />
    
    <input type="file" ref="orderSlipInput" class="d-none" @change="handleOrderSlipUpload" accept="image/*" />
  </div>
</template>

<script>
import ArtistProfileHeader from './components/ArtistProfileHeader.vue'
import ArtworkCard from '@/components/CardArtwork.vue'
import SubmissionTable from './components/table/SubmissionTable.vue'
import ArtistSubmissions from './Submissions.vue'
import ArtistSubmissionsDetail from './SubmissionsDetail.vue'
import OrderModal from './components/modal/OrderModal.vue'
import ArtworkCreateModal from './components/modal/ArtworkCreateModal.vue'
import ArtworkEditModal from './components/modal/ArtworkEditModal.vue'
import EditProfileModal from './components/modal/EditProfileModal.vue'
import PostTermSaleNotice from './components/PostTermSaleNotice.vue'
import { mapGetters } from 'vuex';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
  name: 'ArtistProfile',
  mixins: [statusBadgeMixin],
  components: {
    ArtistProfileHeader,
    ArtworkCard,
    SubmissionTable,
    ArtistSubmissions,
    ArtistSubmissionsDetail,
    OrderModal,
    ArtworkCreateModal,
    ArtworkEditModal,
    EditProfileModal,
    PostTermSaleNotice
  },
  data() {
    return {
      activeView: 'portfolio',
      selectedSubmissionId: null,
      selectedOrder: null,
      showOrderModal: false,
      orderSearch: '',
      orderActivePage: 1,
      form: null,
      loading: false,
      isEditing: false,
      showArtworkModal: false,
      showEditModal: false,
      selectedArtwork: null,
      selectedFile: null,
      artworkToDelete: null,
      activePage: 1,
      itemsPerPage: 8,
      now: Date.now(),
      timer: null
    }
  },
  computed: {
    ...mapGetters({
      userId: 'auth/userId',
      users: 'user/user',
      allArtworks: 'artwork/artworks',
      allOrders: 'order/orders',
      dialogCode: 'dialog/isCode'
    }),
    profileUserId() {
      return this.$route.params.id || this.userId;
    },
    resolvedArtistId() {
      return this.user ? this.user._id : this.profileUserId;
    },
    isPublic() {
      if (!this.userId) return true;
      if (!this.$route.params.id) return false;
      return String(this.resolvedArtistId || '').toLowerCase() !== String(this.userId || '').toLowerCase();
    },
    user() {
      // Find the user identified by profileUserId or matching slugified name
      if (!this.users) return null;
      if (!Array.isArray(this.users)) {
        return this.users;
      }
      return this.users.find(u => {
        if (u._id === this.profileUserId) return true;
        
        const nameEn = this.getName('en', u);
        if (nameEn && nameEn.replace(/\s+/g, '-').toLowerCase() === this.profileUserId.toLowerCase()) return true;

        const nameTh = this.getName('th', u);
        if (nameTh && nameTh.replace(/\s+/g, '-') === this.profileUserId) return true;
        
        return false;
      });
    },
    artistArtworks() {
      if (!this.allArtworks || !Array.isArray(this.allArtworks)) return [];
      
      // 1. Filter by artist ID
      let filtered = this.allArtworks.filter(art => {
        if (!art.artist) return false;
        const id = typeof art.artist === 'object' ? (art.artist._id || art.artist) : art.artist;
        return String(id) === String(this.resolvedArtistId);
      });

      // 2. If public, filter by Approved status
      if (this.isPublic) {
        filtered = filtered.filter(art => {
          if (!art.status || !art.status.approval) return false;
          const status = this.getName('en', art.status.approval);
          return status === 'Approved';
        });
      }

      // Sort by latest updated
      return [...filtered].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
    },
    paginatedArtworks() {
      if (!this.artistArtworks) return [];
      const start = (this.activePage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.artistArtworks.slice(start, end);
    },
    totalArtworksPages() {
      if (!this.artistArtworks) return 0;
      return Math.ceil(this.artistArtworks.length / this.itemsPerPage);
    },
    processedOrders() {
      if (!this.allOrders) return [];
      return this.allOrders
        .filter(order => order.user === this.resolvedArtistId || (order.user && order.user._id === this.resolvedArtistId))
        .map(order => ({
          ...order,
          orderIdDisplay: order._id.substring(order._id.length - 8).toUpperCase(),
          dateDisplay: new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          totalAmount: order.artwork ? order.artwork.reduce((acc, art) => acc + (art.price || 0), 0) : 0,
          statusName: (() => {
            const statusLabel = this.getName('en', order.status);
            const s = statusLabel ? statusLabel.toLowerCase() : '';
            if (s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success')) {
              return this.$i18n.locale === 'en' ? 'Approved' : 'เสร็จสิ้น';
            }
            if (s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('fail')) {
              return this.$i18n.locale === 'en' ? 'Rejected' : 'ยกเลิก';
            }
            
            if (!order.image) {
              return this.$i18n.locale === 'en' ? 'Pending Payment' : 'รอชำระเงิน';
            } else {
              return this.$i18n.locale === 'en' ? 'Pending Verification' : 'รอตรวจสอบ';
            }
          })(),
          timeLeftDisplay: this.calculateTimeLeft(order)
        }));
    },
    filteredOrders() {
      let orders = this.processedOrders;
      if (this.orderSearch) {
        const q = this.orderSearch.toLowerCase();
        orders = this.processedOrders.filter(o => 
          o.orderIdDisplay.toLowerCase().includes(q) ||
          o.statusName.toLowerCase().includes(q) ||
          o.dateDisplay.toLowerCase().includes(q)
        );
      }
      return [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  },
  async created() {
    this.$store.dispatch('artwork/get');
    if (!this.$route.params.id) {
      this.$store.dispatch('order/get', {});
    }
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    getOrderArtists(item) {
      if (!item.artwork || !Array.isArray(item.artwork)) return 'N/A';
      const names = item.artwork
        .map(art => art.artist ? this.getName(this.$i18n.locale, art.artist) : '')
        .filter(Boolean);
      const uniqueNames = [...new Set(names)];
      return uniqueNames.length > 0 ? uniqueNames.join(', ') : 'N/A';
    },
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
    downloadReceipt(item) {
      if (item.image) {
        window.open(item.image, '_blank');
      }
    },
    async downloadInvoice(item) {
      try {
        const response = await this.$store.dispatch('order/getInvoice', item._id);
        this.downloadFile(response.data, `Invoice_${item.orderIdDisplay || item._id}.pdf`);
      } catch (error) {
        console.error('Download Invoice Error:', error);
        alert(this.$i18n.locale === 'en' ? 'Failed to download invoice.' : 'ดาวน์โหลดใบแจ้งหนี้ไม่สำเร็จ');
      }
    },
    async downloadCertificate(item) {
      try {
        const baseUrl = (process.env.VUE_APP_API_URL || '').replace(/\/$/, '');
        const token = this.$store.state.xAccessToken;
        const response = await fetch(`${baseUrl}/api/v1/order/certificate/${item._id}`, {
          method: 'GET',
          cache: 'no-store',
          headers: token ? {
            'X-Access-Token': token,
            Authorization: `Bearer ${token}`
          } : {}
        });

        if (!response.ok) {
          throw new Error(`Certificate download failed with status ${response.status}`);
        }

        const pdfBlob = await response.blob();
        this.downloadFile(pdfBlob, `Certificate_${item.orderIdDisplay || item._id}.pdf`);
      } catch (error) {
        console.error('Download Certificate Error:', error);
        alert(this.$i18n.locale === 'en' ? 'Failed to download certificate.' : 'ดาวน์โหลดใบรับรองผลงานไม่สำเร็จ');
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
    isApprovedOrder(item) {
      const statusLabel = this.getName('en', item.status);
      const s = statusLabel ? statusLabel.toLowerCase() : '';
      return s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success');
    },
    handleViewSubmission(item) {
      if(item && item._id) {
        this.selectedSubmissionId = item._id;
        this.activeView = 'submission-detail';
      }
    },
    handleNavigate(view) {
      this.activeView = view;
    },
    handleViewDetail(id) {
      this.selectedSubmissionId = id;
      this.activeView = 'submission-detail';
    },
    viewOrderDetails(item) {
      this.selectedOrder = item;
      this.showOrderModal = true;
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
        this.loading = true;
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
      } catch (error) {
        console.error('Upload failed:', error);
        alert(this.$i18n.locale === 'en' ? 'Upload failed. Please try again.' : 'เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (this.$refs.orderSlipInput) {
          this.$refs.orderSlipInput.value = '';
        }
        this.loading = false;
        this.selectedOrder = null;
      }
    },
    handleEditSubmission(item) {
      this.$store.commit('dialog/showToast', { title: 'Info', message: 'Edit submission in Dashboard', variant: 'info' });
    },
    handleDeleteSubmission(item) {
      if (confirm('Are you sure you want to delete this submission?')) {
        this.$store.dispatch('submission/delete', { _id: item._id })
          .then(() => {
            this.$store.dispatch('submission/get', {});
          });
      }
    },
    handleEditArtwork(art) {
      this.selectedArtwork = art;
      this.showEditModal = true;
    },
    handleDeleteArtwork(art) {
      if (confirm(`Are you sure you want to delete "${this.getName('en', art)}"? This action cannot be undone.`)) {
        this.$store.dispatch('artwork/delete', { _id: art._id })
          .then(() => {
            this.$store.commit('dialog/showToast', {
              title: 'Deleted',
              message: 'Artwork has been removed from your portfolio.',
              variant: 'success'
            });
            // Refresh list
            this.$store.dispatch('artwork/get');
          })
          .catch(err => {
            console.error('Delete failed:', err);
            this.$store.commit('dialog/showToast', {
              title: 'Error',
              message: 'Failed to delete artwork.',
              variant: 'danger'
            });
          });
      }
    },
    getName(lang, item) {
      if (!item) return '';
      if (typeof item === 'string') return item;
      const titleField = item.title || item.name || '';
      if (typeof titleField === 'string' && titleField) return titleField;
      if (Array.isArray(titleField)) {
        const obj = titleField.find(n => n.key === lang);
        return obj ? obj.value : (titleField[0] ? titleField[0].value : '');
      }
      return '';
    },
    async fetchProfile() {
      if (!this.profileUserId) return;
      
      try {
        this.loading = true;
        // Fetch specific user profile using explore action (public endpoint)
        const currentUser = await this.$store.dispatch('user/explore', { _id: this.profileUserId });
        
        if (currentUser) {
          // Fetch submissions using the resolved ID (only if not public guest view)
          if (!this.$route.params.id) {
            this.$store.dispatch('submission/get', { artist: currentUser._id });
          }

          const getName = (lang) => {
            if (Array.isArray(currentUser.name)) {
              const obj = currentUser.name.find(n => n.key === lang);
              return obj ? obj.value : '';
            }
            return '';
          };
          
          this.form = {
            _id: currentUser._id,
            studentId: currentUser.studentId,
            image: currentUser.image,
            nameTh: getName('th'),
            nameEn: getName('en'),
            email: currentUser.contact ? currentUser.contact.studentEmail : '',
            personalEmail: currentUser.contact ? currentUser.contact.personalEmail : '',
            telephone: currentUser.contact ? currentUser.contact.telephone : '',
            bio: currentUser.bio || '',
            addressBill: currentUser.address ? currentUser.address.bill : '',
            addressShipping: currentUser.address ? currentUser.address.shipping : ''
          };
        } else {
          console.error("Profile Error: User not found in database matching ID/slug:", this.profileUserId);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        this.loading = false;
      }
    },
    async onProfileSave({ form, file }) {
      try {
        this.loading = true;
        const payload = {
          _id: form._id,
          name: [
            { key: 'th', value: form.nameTh },
            { key: 'en', value: form.nameEn }
          ],
          contact: {
            studentEmail: form.email,
            personalEmail: form.personalEmail,
            telephone: form.telephone
          },
          bio: form.bio,
          address: {
            bill: form.addressBill,
            shipping: form.addressShipping
          }
        };

        if (form.image && !file) {
          payload.image = form.image;
        }

        // 1. Update text data first
        await this.$store.dispatch('user/update', payload);

        // 2. Upload image if a new photo was selected
        if (file) {
          const formData = new FormData();
          formData.append('_id', this.userId);
          formData.append('image', file);

          await this.$store.dispatch('user/upload', formData);
        }
        
        this.$store.commit('dialog/showToast', { title: 'Success', message: 'Profile updated successfully!', variant: 'success' });
        
        await this.fetchProfile();
        this.isEditing = false;
      } catch (error) {
        console.error('Error updating profile:', error);
        this.$store.commit('dialog/showToast', { title: 'Error', message: 'Failed to update profile.', variant: 'danger' });
      } finally {
        this.loading = false;
      }
    },
    handleAddNewArtwork() {
      this.showArtworkModal = true;
    },
    async handleArtworkSave(payload) {
      try {
        this.loading = true;
        
        // --- STEP 1: CREATE ARTWORK RECORD (JSON) ---
        // Prepare JSON payload for metadata creation
        const createPayload = {
          title: payload.title,
          description: payload.description,
          technique: payload.technique,
          artist: payload.artist,
          category: payload.category,
          size: payload.size,
          price: payload.price,
          status: payload.status,
          remark: payload.remark
        };

        this.$store.commit('dialog/showToast', {
          title: 'Processing',
          message: 'Creating artwork record...',
          variant: 'info'
        });

        const createResponse = await this.$store.dispatch('artwork/create', createPayload);
        
        // Extract the created ID (assuming backend returns { data: { data: { _id: ... } } })
        const artworkId = createResponse.data.data._id;
        
        if (!artworkId) throw new Error('Failed to retrieve artwork ID');

        // --- STEP 2: UPLOAD ARTWORK IMAGE (MULTIPART) ---
        if (payload._image) {
          this.$store.commit('dialog/showToast', {
            title: 'Processing',
            message: 'Uploading artwork image...',
            variant: 'info'
          });

          const formData = new FormData();
          formData.append('_id', artworkId);
          formData.append('image', payload._image);

          await this.$store.dispatch('artwork/upload', formData);
        }
        
        this.$store.commit('dialog/showToast', {
          title: 'Success',
          message: 'Artwork added to your portfolio successfully!',
          variant: 'success'
        });
        
        this.showArtworkModal = false;
        
        // Refresh artwork list
        await this.$store.dispatch('artwork/get');
        
      } catch (error) {
        console.error('Error in artwork creation flow:', error);
        
        // Attempt to show more specific error if available from backend
        const errorMessage = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to add artwork. Please check your connection and try again.';

        this.$store.commit('dialog/showToast', {
          title: 'Error',
          message: errorMessage,
          variant: 'danger'
        });
      } finally {
        this.loading = false;
      }
    },
    async handleArtworkUpdate(payload) {
      try {
        this.loading = true;
        
        // --- STEP 1: UPDATE ARTWORK RECORD (JSON) ---
        this.$store.commit('dialog/showToast', {
          title: 'Processing',
          message: 'Updating artwork details...',
          variant: 'info'
        });

        const updatePayload = {
          _id: payload._id,
          title: payload.title,
          description: payload.description,
          technique: payload.technique,
          artist: payload.artist,
          category: payload.category,
          size: payload.size,
          price: payload.price,
          status: payload.status,
          remark: payload.remark
        };

        await this.$store.dispatch('artwork/update', updatePayload);
        
        // --- STEP 2: UPLOAD NEW IMAGE IF CHANGED ---
        if (payload._image && payload._image instanceof File) {
          this.$store.commit('dialog/showToast', {
            title: 'Processing',
            message: 'Uploading new artwork image...',
            variant: 'info'
          });

          const formData = new FormData();
          formData.append('_id', payload._id);
          formData.append('image', payload._image);

          await this.$store.dispatch('artwork/upload', formData);
        }
        
        this.$store.commit('dialog/showToast', {
          title: 'Success',
          message: 'Artwork updated successfully!',
          variant: 'success'
        });
        
        this.showEditModal = false;
        this.selectedArtwork = null;
        
        // Refresh artwork list
        await this.$store.dispatch('artwork/get');
        
      } catch (error) {
        console.error('Error in artwork update flow:', error);
        
        const errorMessage = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to update artwork. Please try again.';

        this.$store.commit('dialog/showToast', {
          title: 'Error',
          message: errorMessage,
          variant: 'danger'
        });
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    profileUserId: {
      handler: 'fetchProfile',
      immediate: true
    }
  }
}
</script>

<style scoped>
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
    transition: all 0.2s ease;
    cursor: pointer;
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

.profile-view-bg {
  background-color: #f8fafc;
}
.profile-container-wide {
  max-width: 1440px !important;
}

.btn-back-subtle {
  color: #64748b;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-back-subtle:hover {
  background-color: #ffffff;
  color: #8c1515;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transform: translateX(-4px);
}

.shadow-premium {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02) !important;
}

.rounded-xl {
  border-radius: 1.5rem !important;
}

/* Avatar Upload Style */
.avatar-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Portfolio Section Styling */
.profile-portfolio-card {
  z-index: 2;
  position: relative;
  background-color: #ffffff;
  border: 1px solid #f1f5f9 !important;
}

.portfolio-header {
  border-bottom: none !important;
}

.portfolio-title {
  font-size: 1.75rem;
  letter-spacing: -0.02em;
  color: #1e293b;
}

.portfolio-subtitle {
  font-size: 0.95rem;
  font-weight: 500;
  max-width: 600px;
}

.btn-add-artwork {
  font-size: 0.9rem;
  background-color: #8c1515 !important;
  border: none !important;
  transition: all 0.3s ease;
}

.btn-add-artwork:hover {
  background-color: #701111;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(140, 21, 21, 0.2) !important;
}

.portfolio-grid-container {
  min-height: 400px;
}

/* Override ArtworkCard default margins if needed */
::v-deep .artwork-card {
  margin-bottom: 2rem;
}

/* Pagination Styling */
.premium-pagination ::v-deep .page-link {
  border: none;
  background-color: #f8fafc;
  color: #64748b;
  margin: 0 4px;
  border-radius: 8px !important;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.6rem 1rem;
}

.premium-pagination ::v-deep .page-item.active .page-link {
  background-color: #8c1515 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(140, 21, 21, 0.2);
}

.premium-pagination ::v-deep .page-link:hover {
  background-color: #f1f5f9;
  color: #1e293b;
  transform: translateY(-2px);
}

.premium-pagination ::v-deep .page-item.disabled .page-link {
  background-color: transparent;
  opacity: 0.5;
}
</style>
