<template>
  <div class="user-profile-view min-vh-100 py-4 bg-light-premium">
    <CContainer class="profile-container-wide">
      <div class="mb-5 text-center text-md-left">
        <h2 class="font-weight-bold text-dark section-title">{{ $i18n.locale === 'en' ? 'Profile' : 'โปรไฟล์' }}</h2>
        <div class="title-separator-sm mb-3 mx-auto mx-md-0"></div>
        <p class="text-muted">{{ $i18n.locale === 'en' ? 'Manage your personal information and track your orders.' : 'จัดการข้อมูลส่วนตัวและติดตามคำสั่งซื้อของคุณ' }}</p>
      </div>

      <CRow>
        <!-- Left Column: Avatar & Bio -->
        <CCol lg="4" class="mb-4">
          <CCard class="profile-card border-0 shadow-premium rounded-xl h-100 mb-0 position-relative overflow-hidden">
             <div class="card-accent-bar"></div>
            <CCardBody class="text-center p-4 p-md-5 z-index-2 position-relative">
              <div class="avatar-upload-wrapper mb-4 mx-auto" @click="triggerUpload" style="cursor: pointer;" title="Click to change photo">
                <div class="avatar-preview shadow-lg position-relative overflow-hidden">
                  <img v-if="form.image" :src="form.image" class="w-100 h-100" style="object-fit: cover;" />
                  <div v-else class="d-flex align-items-center justify-content-center h-100 w-100 bg-light text-secondary">
                    <CIcon name="cil-user" size="2xl" />
                  </div>
                  <div class="avatar-overlay d-flex align-items-center justify-content-center position-absolute w-100 h-100" style="top:0; left:0; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.3s;">
                      <CIcon name="cil-camera" size="xl" class="text-white" />
                  </div>
                </div>
                <input type="file" ref="fileInput" class="d-none" @change="onFileChange" accept="image/*" />
              </div>
              <h4 class="font-weight-bold mb-3 text-dark">{{ fullName }}</h4>
              <CBadge color="primary" class="badge-premium px-3 py-2">{{ $i18n.locale === 'en' ? 'Customer' : 'ผู้สะสมผลงานศิลปะ' }}</CBadge>
              <div class="text-left mt-4 border-top pt-4">
                  <div class="contact-info-item mb-3 d-flex align-items-center premium-hover" v-if="form.personalEmail">
                      <div class="icon-box-sm mr-3 shadow-sm min-w-36">
                        <CIcon name="cil-envelope-closed" />
                      </div>
                      <span class="text-dark font-weight-bold text-truncate">{{ form.personalEmail }}</span>
                  </div>
                  <div class="contact-info-item mb-3 d-flex align-items-center premium-hover" v-if="form.telephone">
                      <div class="icon-box-sm mr-3 shadow-sm min-w-36">
                        <CIcon name="cil-phone" />
                      </div>
                      <span class="text-dark font-weight-bold">{{ form.telephone }}</span>
                  </div>
                  <div class="contact-info-item mb-3 d-flex align-items-start premium-hover" v-if="form.bill">
                      <div class="icon-box-sm mr-3 shadow-sm min-w-36 mt-1">
                        <CIcon name="cil-location-pin" />
                      </div>
                      <div>
                        <small class="text-muted text-uppercase font-weight-bold d-block mb-1">{{ $i18n.locale === 'en' ? 'Billing Address' : 'ที่อยู่ออกใบเสร็จ' }}</small>
                        <span class="text-dark small d-block" style="line-height: 1.4;">{{ form.bill }}</span>
                      </div>
                  </div>
                  <div class="contact-info-item mb-3 d-flex align-items-start premium-hover" v-if="form.shipping">
                      <div class="icon-box-sm mr-3 shadow-sm min-w-36 mt-1">
                        <CIcon name="cil-truck" />
                      </div>
                      <div>
                        <small class="text-muted text-uppercase font-weight-bold d-block mb-1">{{ $i18n.locale === 'en' ? 'Shipping Address' : 'ที่อยู่จัดส่ง' }}</small>
                        <span class="text-dark small d-block" style="line-height: 1.4;">{{ form.shipping }}</span>
                      </div>
                  </div>
              </div>
              <CButton color="dark" shape="pill" class="btn-premium w-100 mt-4 shadow-sm hover-lift" @click="isEditing = true">
                <CIcon name="cil-pencil" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Edit Profile' : 'แก้ไขโปรไฟล์' }}
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Right Column: Quick Stats & Recent Activity -->
        <CCol lg="8">

           <CRow>
               <CCol sm="6" class="mb-4">
                   <CCard class="stat-card border-0 shadow-sm rounded-xl h-100 premium-card-hover">
                       <CCardBody class="p-4 d-flex align-items-center">
                           <div class="stat-icon-box bg-gold-gradient text-white mr-4 shadow-sm">
                               <CIcon name="cil-cart" size="xl" />
                           </div>
                           <div>
                               <h6 class="text-muted mb-1 text-uppercase font-weight-bold small tracking-wide">{{ $i18n.locale === 'en' ? 'Total Orders' : 'คำสั่งซื้อทั้งหมด' }}</h6>
                               <h3 class="mb-0 font-weight-bold text-dark">{{ orders.length }}</h3>
                           </div>
                       </CCardBody>
                   </CCard>
               </CCol>
               <CCol sm="6" class="mb-4">
                   <CCard class="stat-card border-0 shadow-sm rounded-xl h-100 premium-card-hover">
                       <CCardBody class="p-4 d-flex align-items-center">
                           <div class="stat-icon-box bg-red-gradient text-white mr-4 shadow-sm">
                               <CIcon name="cil-calendar" size="xl" />
                           </div>
                           <div>
                               <h6 class="text-muted mb-1 text-uppercase font-weight-bold small tracking-wide">{{ $i18n.locale === 'en' ? 'Member Since' : 'เป็นสมาชิกตั้งแต่' }}</h6>
                               <h3 class="mb-0 font-weight-bold text-dark">{{ memberSinceDate }}</h3>
                           </div>
                       </CCardBody>
                   </CCard>
               </CCol>
           </CRow>
           
           <!-- Recent Orders Teaser -->
           <CCard class="border-0 shadow-premium rounded-xl mt-2 overflow-hidden">
                <CCardHeader class="bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="font-weight-bold text-dark mb-0"><CIcon name="cil-history" class="mr-2 text-primary" /> {{ $i18n.locale === 'en' ? 'Recent Orders' : 'คำสั่งซื้อล่าสุด' }}</h5>
                    <CButton variant="ghost" class="text-primary font-weight-bold btn-sm hover-lift" @click="$router.push('/user/order')">
                        {{ $i18n.locale === 'en' ? 'View All' : 'ดูทั้งหมด' }} <CIcon name="cil-arrow-right" class="ml-1" />
                    </CButton>
                </CCardHeader>
                <CCardBody class="p-0">
                    <div v-if="orders && orders.length > 0" class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="border-0 px-4 py-3 small text-muted text-uppercase">{{ $i18n.locale === 'en' ? 'Artwork' : 'ผลงานศิลปะ' }}</th>
                                    <th class="border-0 px-4 py-3 small text-muted text-uppercase text-center">{{ $i18n.locale === 'en' ? 'Date' : 'วันที่' }}</th>
                                    <th class="border-0 px-4 py-3 small text-muted text-uppercase text-center">{{ $i18n.locale === 'en' ? 'Amount' : 'ยอดสุทธิ' }}</th>
                                    <th class="border-0 px-4 py-3 small text-muted text-uppercase text-center">{{ $i18n.locale === 'en' ? 'Status' : 'สถานะ' }}</th>
                                    <th class="border-0 px-4 py-3 small text-muted text-uppercase text-center">{{ $i18n.locale === 'en' ? 'Action' : 'สถานะดำเนินการ' }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in orders.slice(0, 5)" :key="order._id" class="cursor-pointer">
                                    <td class="px-4 py-3 align-middle">
                                        <div class="d-flex align-items-center">
                                            <div class="artwork-thumb mr-3 shadow-sm rounded overflow-hidden" style="width: 50px; height: 50px; background-color: #f0f0f0;">
                                                <img v-if="order.artwork && order.artwork[0] && order.artwork[0].image" 
                                                     :src="order.artwork[0].image" 
                                                     class="w-100 h-100" 
                                                     style="object-fit: cover;" />
                                                <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                                    <CIcon name="cil-image" />
                                                </div>
                                            </div>
                                            <div>
                                                <div class="font-weight-bold text-dark text-truncate" style="max-width: 150px;">
                                                    {{ order.artwork && order.artwork[0] ? getName($i18n.locale, order.artwork[0]) : ($i18n.locale === 'en' ? 'No Artwork' : 'ไม่มีผลงาน') }}
                                                </div>
                                                <small class="text-muted">
                                                    {{ $i18n.locale === 'en' ? 'by' : 'โดย' }} {{ order.artwork && order.artwork[0] && order.artwork[0].artist ? getName($i18n.locale, order.artwork[0].artist) : ($i18n.locale === 'en' ? 'Artist' : 'ศิลปิน') }}
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 align-middle text-muted small text-center">{{ order.date }}</td>
                                    <td class="px-4 py-3 align-middle font-weight-bold text-success text-center">฿{{ order.total.toLocaleString() }}</td>
                                    <td class="px-4 py-3 align-middle text-center">
                                        <div :class="['status-badge', getStatusBadge(order.statusName).class, 'mx-auto']">
                                            <CIcon :name="getStatusBadge(order.statusName).icon" size="sm" class="status-icon" /> 
                                            {{ order.statusName }}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 align-middle text-center">
                                        <CButton 
                                            size="sm" 
                                            variant="outline" 
                                            color="primary" 
                                            class="rounded-pill px-3 shadow-sm hover-lift"
                                            @click="viewOrder(order)"
                                        >
                                            {{ $i18n.locale === 'en' ? 'View' : 'ดู' }}
                                        </CButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center py-5 text-muted bg-light-empty">
                         <CIcon name="cil-inbox" size="3xl" class="mb-3 opacity-25" />
                         <p class="mb-0 font-weight-bold">{{ $i18n.locale === 'en' ? 'No recent orders found.' : 'ไม่พบคำสั่งซื้อล่าสุด' }}</p>
                    </div>
                </CCardBody>
           </CCard>
        </CCol>
      </CRow>
    </CContainer>

    <!-- Order Details Modal -->
    <OrderModal 
      :show.sync="showOrderModal" 
      :order="selectedOrder" 
    />

    <!-- Edit Profile Modal -->
    <ProfileModal 
      :show.sync="isEditing" 
      :form="form" 
      @save="handleSave" 
      @cancel="cancelEdit" 
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import OrderModal from './components/modal/OrderModal.vue';
import ProfileModal from './components/modal/ProfileModal.vue';

export default {
  name: 'UserProfile',
  components: {
    OrderModal,
    ProfileModal
  },
  mixins: [statusBadgeMixin],
  data() {
    return {
      isEditing: false,
      form: {
        _id: '',
        nameTh: '',
        nameEn: '',
        personalEmail: '',
        telephone: '',
        bill: '',
        shipping: '',
        image: ''
      },
      selectedFile: null,
      showOrderModal: false,
      selectedOrder: null,
      now: Date.now(),
      timer: null
    }
  },
  computed: {
    ...mapGetters({
      userId: 'auth/userId',
      users: 'user/user',
      allOrders: 'order/orders'
    }),
    user() {
      if (!this.users) return null;
      return this.users.find(u => u._id === this.userId);
    },
    orders() {
      if (!this.allOrders) return [];
      return this.allOrders
        .filter(order => order.user === this.userId || (order.user && order.user._id === this.userId))
        .map(order => ({
          ...order,
          orderId: order._id.substring(order._id.length - 8).toUpperCase(),
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
          })()
        }));
    },
    pendingPaymentOrders() {
      return this.orders.filter(order => {
        const statusLabel = this.getName('en', order.status);
        const s = statusLabel ? statusLabel.toLowerCase() : '';
        
        const isCompletedOrCancelled = s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success') || s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('fail');
        const hasSlip = !!order.image;
        
        return !isCompletedOrCancelled && !hasSlip;
      }).map(order => {
        const createdAt = new Date(order.createdAt).getTime();
        const deadline = createdAt + (24 * 60 * 60 * 1000);
        const diff = deadline - this.now;
        
        let timeLeftDisplay = '';
        let isExpired = false;
        if (diff <= 0) {
          timeLeftDisplay = this.$i18n.locale === 'en' ? 'Expired' : 'หมดเวลา';
          isExpired = true;
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          timeLeftDisplay = `${hours}h ${minutes}m ${seconds}s`;
        }
        
        return {
          ...order,
          timeLeftDisplay,
          isExpired
        };
      });
    },
    nameEn() {
      return this.form ? this.form.nameEn : '';
    },
    fullName() {
      if (this.$i18n.locale === 'en') {
        return this.form.nameEn || this.form.nameTh || 'User Name';
      }
      return this.form.nameTh || this.form.nameEn || 'ชื่อผู้ใช้';
    },
    initials() {
      if (!this.form.nameTh) return 'US';
      const parts = this.form.nameTh.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    },
    memberSinceDate() {
      if (this.user && this.user.createdAt) {
        return new Date(this.user.createdAt).toLocaleDateString(this.$i18n.locale === 'en' ? 'en-GB' : 'th-TH', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return 'N/A';
    }
  },
  async created() {
    await this.fetchProfile();
    await this.$store.dispatch('order/get', {});
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
    console.log('DEBUG: allOrders', this.allOrders);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    viewOrder(order) {
      this.selectedOrder = order;
      this.showOrderModal = true;
    },
    async fetchProfile() {
      try {
        const users = await this.$store.dispatch('user/get', {});
        const currentUser = users ? users.find(u => u._id === this.userId) : null;
        
        if (currentUser) {
          const getName = (lang) => {
            if (Array.isArray(currentUser.name)) {
              const obj = currentUser.name.find(n => n.key === lang);
              return obj ? obj.value : '';
            }
            return '';
          };
          
          this.form = {
            _id: currentUser._id,
            image: currentUser.image || '',
            nameTh: getName('th'),
            nameEn: getName('en'),
            personalEmail: currentUser.contact ? currentUser.contact.personalEmail : '',
            telephone: currentUser.contact ? currentUser.contact.telephone : '',
            bill: currentUser.address ? currentUser.address.bill : '',
            shipping: currentUser.address ? currentUser.address.shipping : ''
          };
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },
    async cancelEdit() {
      this.isEditing = false;
      this.selectedFile = null;
      await this.fetchProfile();
    },
    async handleSave(updatedForm) {
      if (updatedForm) {
        this.form = { ...updatedForm };
      }
      try {
        const payload = {
          _id: this.form._id,
          name: [
            { key: 'th', value: this.form.nameTh },
            { key: 'en', value: this.form.nameEn }
          ],
          contact: {
            personalEmail: this.form.personalEmail,
            telephone: this.form.telephone
          },
          address: {
            bill: this.form.bill,
            shipping: this.form.shipping
          }
        };

        if (this.form.image && !this.selectedFile) {
          payload.image = this.form.image;
        }

        await this.$store.dispatch('user/update', payload);

        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('_id', this.userId);
          formData.append('image', this.selectedFile);

          await this.$store.dispatch('user/upload', formData);
          this.selectedFile = null;
        }

        this.isEditing = false;
        await this.fetchProfile();
      } catch (err) {
        console.error('Error updating profile:', err);
      }
    },

    async onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.image = URL.createObjectURL(file);
        this.selectedFile = file;
        this.$refs.fileInput.value = '';

        // Auto-save the image when uploaded directly from the card
        try {
          const formData = new FormData();
          formData.append('_id', this.userId);
          formData.append('image', this.selectedFile);

          await this.$store.dispatch('user/upload', formData);
          this.selectedFile = null;
          await this.fetchProfile();
          
          if (this.$store.commit) {
            this.$store.commit('dialog/showToast', { title: 'Success', message: 'Profile photo updated successfully!', variant: 'success' });
          }
        } catch (err) {
          console.error('Error uploading photo:', err);
        }
      }
    },
    triggerUpload() {
      this.$refs.fileInput.click();
    }
  }
}
</script>

<style scoped>
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

.z-index-2 {
    z-index: 2;
}

/* Avatar Styles */
.badge-info, .status-badge.badge-info {
    background-color: rgba(52, 152, 219, 0.1) !important;
    color: #2980b9 !important;
    border: 1px solid #2980b9 !important;
}

.avatar-upload-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    position: relative;
    padding: 5px;
    background: linear-gradient(135deg, #d4af37, #612721);
}

.avatar-preview {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 3px solid white;
}

.avatar-initials {
    font-size: 2.5rem;
    font-weight: 800;
    color: #612721;
}

.avatar-upload-wrapper:hover .avatar-overlay {
    opacity: 1 !important;
}

.card-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #612721, #d4af37);
    z-index: 3;
}

.badge-premium {
    background: rgba(212, 175, 55, 0.15);
    color: #b5952f;
    border: 1px solid rgba(212, 175, 55, 0.3);
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.icon-box-sm {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 10px;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #612721;
    transition: all 0.3s ease;
}

.premium-hover {
    padding: 8px 10px;
    border-radius: 12px;
    margin-left: -10px;
    transition: all 0.3s ease;
}

.premium-hover:hover {
    background-color: rgba(212, 175, 55, 0.05);
    transform: translateX(5px);
}

.premium-hover:hover .icon-box-sm {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    color: white;
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

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-3px);
}

/* Stats Cards */
.premium-card-hover {
    transition: all 0.3s ease;
}
.premium-card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08) !important;
}

.stat-icon-box {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-gold-gradient {
    background: linear-gradient(135deg, #d4af37 0%, #b5952f 100%);
}

.bg-red-gradient {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
}

.tracking-wide {
    letter-spacing: 1px;
}

.bg-light-empty {
    background-color: #f8f9fa;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

/* Forms */
.form-label-custom {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.custom-input-premium ::v-deep .form-control {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    background-color: #f8fafc;
    transition: all 0.3s ease;
    color: #2d3748;
    height: auto;
}

.custom-input-premium ::v-deep .form-control:focus {
    background-color: #ffffff;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

.bg-danger-premium {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    box-shadow: 0 10px 25px rgba(97, 39, 33, 0.2) !important;
}

.alert-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.animate-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.7;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
