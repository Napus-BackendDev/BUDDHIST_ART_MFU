<template>
  <div v-if="form" class="profile-view-bg min-vh-100 py-4">
    <CContainer class="profile-container-wide">
    <ArtistProfileHeader 
      :user="user" 
      :isPublic="isPublic" 
      @edit="isEditing = true" 
      @navigate="handleNavigate"
    />
 
      <transition name="fade" mode="out-in">
        
        <div v-if="activeView === 'portfolio'" key="portfolio">
          <!-- Artwork Portfolio Section -->
          <CCard class="profile-portfolio-card mt-4 border-0 shadow-premium rounded-xl overflow-hidden">
            <CCardHeader class="portfolio-header bg-white border-0 pt-5 px-4 px-md-5 d-flex justify-content-between align-items-end flex-wrap">
              <div class="header-title-group mb-3 mb-md-0">
                <h3 class="mb-1 font-weight-bold text-dark portfolio-title">My Artwork Portfolio</h3>
                <p class="text-muted mb-0 portfolio-subtitle">Explore and manage your collection of digital and physical art pieces.</p>
              </div>
              <div v-if="!isPublic" class="header-actions-group">
                <CButton color="primary" shape="pill" class="px-4 py-2 font-weight-bold shadow-sm btn-add-artwork" @click="handleAddNewArtwork">
                  <CIcon name="cil-plus" class="mr-2" /> Add New Artwork
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
      
          <!-- Submissions Section (Preview - Only for own profile) -->
          <CCard v-if="!isPublic" class="profile-portfolio-card mt-5 border-0 shadow-premium rounded-xl overflow-hidden">
            <CCardHeader class="portfolio-header bg-white border-0 pt-5 px-4 px-md-5 d-flex justify-content-between align-items-end flex-wrap">
              <div class="header-title-group mb-3 mb-md-0">
                <h3 class="mb-1 font-weight-bold text-dark portfolio-title">Recent Submissions</h3>
                <p class="text-muted mb-0 portfolio-subtitle">A quick overview of your latest certification tasks.</p>
              </div>
              <CButton color="dark" variant="outline" shape="pill" class="btn-sm px-3 font-weight-bold" @click="activeView = 'submissions'">
                View All Submissions
              </CButton>
            </CCardHeader>
            
            <CCardBody class="p-4 p-md-5 pt-0">
              <SubmissionTable 
                @view="handleViewSubmission" 
                @edit="handleEditSubmission" 
                @delete="handleDeleteSubmission" 
              />
            </CCardBody>
          </CCard>
        </div>

        <div v-else-if="activeView === 'submissions'" key="submissions" class="mt-4">
          <ArtistSubmissions @view-detail="handleViewDetail" />
        </div>

        <div v-else-if="activeView === 'submission-detail'" key="submission-detail" class="mt-4">
          <div class="mb-4 d-flex align-items-center">
            <CButton 
              variant="ghost" 
              class="btn-back-subtle d-flex align-items-center" 
              @click="activeView = 'submissions'"
            >
              <CIcon name="cil-arrow-left" class="mr-2" />
              <span class="font-weight-bold">Back to All Submissions</span>
            </CButton>
          </div>
          <ArtistSubmissionsDetail 
            :id="selectedSubmissionId" 
            :hideHeader="true" 
          />
        </div>

        <div v-else-if="activeView === 'orders'" key="orders" class="mt-4">
          <CCard class="border-0 shadow-premium rounded-xl overflow-hidden">
            <CCardHeader class="bg-white border-0 pt-5 px-4 px-md-5 d-flex justify-content-between align-items-center flex-wrap">
              <div class="header-title-group mb-3 mb-md-0">
                <h3 class="mb-1 font-weight-bold text-dark portfolio-title">My Order History</h3>
                <p class="text-muted mb-0 portfolio-subtitle">Track your past purchases and collection expansion.</p>
              </div>
              <div class="search-box" style="min-width: 300px;">
                <CInput 
                  v-model="orderSearch"
                  placeholder="Search orders..." 
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
                  { key: 'orderIdDisplay', label: 'Order ID' },
                  { key: 'dateDisplay', label: 'Date' },
                  { key: 'totalAmount', label: 'Total' },
                  { key: 'statusName', label: 'Status' },
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
                      <div class="artwork-thumb mr-3 shadow-sm rounded overflow-hidden" style="width: 45px; height: 45px; background-color: #f8fafc;">
                        <img v-if="item.artwork && item.artwork[0]" :src="item.artwork[0].image" class="w-100 h-100 object-fit-cover" />
                        <CIcon v-else name="cil-image" class="text-muted m-2" />
                      </div>
                      <span class="font-weight-bold text-dark">#{{ item.orderIdDisplay }}</span>
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
                    <div :class="['status-badge-inline', item.statusName.toLowerCase()]">
                      {{ item.statusName }}
                    </div>
                  </td>
                </template>
                <template #action="{item}">
                  <td class="align-middle text-right px-4">
                    <button class="action-btn icon-view" @click="viewOrderDetails(item)">
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

    <CModal
      title="Edit Artist Profile"
      :show.sync="isEditing"
      size="xl"
      :centered="true"
    >
      <div class="modal-bg-wrapper">
        <CRow>
        <!-- Left Column: Avatar & Bio -->
        <CCol lg="4" class="mb-4 mb-lg-0">
          <CCard class="border-0 shadow-sm rounded-xl h-100 mb-0">
            <CCardBody class="text-center p-4 p-md-5">
            <div class="avatar-upload-wrapper mb-4">
              <div 
                class="avatar-preview shadow-lg"
                :style="{ backgroundColor: getAvatarColor(nameEn) }"
              >
                <img v-if="form.image" :src="form.image" class="avatar-img" />
                <span v-else class="avatar-initials">{{ initials }}</span>
              </div>
              <CButton variant="outline" shape="pill" class="btn-sm btn-upload mt-3 shadow-sm" @click="triggerUpload">
                <CIcon name="cil-camera" class="mr-2" /> Change Photo
              </CButton>
              <input type="file" ref="fileInput" class="d-none" @change="onFileChange" accept="image/*" />
            </div>

            <h4 class="font-weight-bold mb-1">{{ nameEn }}</h4>
            <p class="text-muted small mb-4">{{ studentId }}</p>
            
            <div class="text-left mt-4 border-top pt-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="section-label mb-0">Biography</label>
                <small class="text-muted">{{ form.bio ? form.bio.length : 0 }} / 200</small>
              </div>
              <CTextarea 
                v-model="form.bio"
                placeholder="Tell us about yourself and your artistic style..."
                class="bio-textarea"
                rows="4"
                maxlength="200"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Right Column: Personal Information -->
      <CCol lg="8">
        <CCard class="border-0 shadow-sm rounded-xl h-100 mb-0">
          <CCardHeader class="bg-white border-bottom py-3 px-4 px-md-5">
            <h5 class="mb-0 font-weight-bold text-dark">Personal Information</h5>
          </CCardHeader>
          <CCardBody class="p-4 p-md-5">
            <CRow>
              <!-- Name Fields -->
              <CCol md="6" class="mb-4">
                <label class="form-label">Full Name (Thai)</label>
                <CInput v-model="form.nameTh" placeholder="ชื่อ-นามสกุล" class="custom-input shadow-none" />
              </CCol>
              <CCol md="6" class="mb-4">
                <label class="form-label">Full Name (English)</label>
                <CInput v-model="form.nameEn" placeholder="Full Name" class="custom-input shadow-none" />
              </CCol>

              <!-- Email Fields -->
              <CCol md="6" class="mb-4">
                <label class="form-label">University Email</label>
                <CInput v-model="form.email" placeholder="student@lamduan.mfu.ac.th" disabled class="custom-input shadow-none bg-light" />
                <small class="text-muted">Cannot be changed</small>
              </CCol>
              <CCol md="6" class="mb-4">
                <label class="form-label">Personal Email</label>
                <CInput v-model="form.personalEmail" placeholder="example@gmail.com" class="custom-input shadow-none" />
              </CCol>

              <!-- Phone & ID -->
              <CCol md="6" class="mb-4">
                <label class="form-label">Telephone</label>
                <CInput v-model="form.telephone" placeholder="08x-xxx-xxxx" class="custom-input shadow-none" />
              </CCol>
              <CCol md="6" class="mb-4">
                <label class="form-label">Artist ID / Student ID</label>
                <CInput v-model="form.studentId" placeholder="64xxxxxxx" disabled class="custom-input shadow-none bg-light" />
              </CCol>
            </CRow>

          </CCardBody>
        </CCard>
      </CCol>
      </CRow>
      </div>

      <template #footer>
        <div class="d-flex w-100 justify-content-end p-2">
          <CButton @click="cancelEdit" variant="outline" shape="pill" class="btn-modal-action mr-3">
            Cancel
          </CButton>
          <CButton @click="handleSave" shape="pill" class="btn-modal-action btn-save-action font-weight-bold">
            <CIcon name="cil-save" class="mr-2" /> Save Changes
          </CButton>
        </div>
      </template>
    </CModal>
    
    <ArtworkCreateModal 
      :show="showArtworkModal" 
      :initialArtistId="userId"
      :loading="loading"
      @update:show="showArtworkModal = $event"
      @save="handleArtworkSave"
    />

    <ArtworkEditModal
      :show="showEditModal"
      :artwork="selectedArtwork"
      @update:show="showEditModal = $event"
      @save="handleArtworkUpdate"
    />
  </div>
</template>

<script>
import ArtistProfileHeader from './components/ArtistProfileHeader.vue'
import ArtworkCard from './components/card/CardArtworks.vue'
import SubmissionTable from './components/table/SubmissionTable.vue'
import ArtistSubmissions from './Submissions.vue'
import ArtistSubmissionsDetail from './SubmissionsDetail.vue'
import OrderModal from '../User/components/modal/OrderModal.vue'
import ArtworkCreateModal from './components/modal/ArtworkCreateModal.vue'
import ArtworkEditModal from './components/modal/ArtworkEditModal.vue'
import { mapGetters } from 'vuex';

export default {
  name: 'ArtistProfile',
  components: {
    ArtistProfileHeader,
    ArtworkCard,
    SubmissionTable,
    ArtistSubmissions,
    ArtistSubmissionsDetail,
    OrderModal,
    ArtworkCreateModal,
    ArtworkEditModal
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
      itemsPerPage: 8
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
    isPublic() {
      return this.$route.params.id && this.$route.params.id !== this.userId;
    },
    user() {
      // Find the user identified by profileUserId from the list
      if (!this.users) return null;
      return this.users.find(u => u._id === this.profileUserId);
    },
    artistArtworks() {
      if (!this.allArtworks || !Array.isArray(this.allArtworks)) return [];
      
      // 1. Filter by artist ID
      let filtered = this.allArtworks.filter(art => {
        if (!art.artist) return false;
        const id = typeof art.artist === 'object' ? art.artist._id : art.artist;
        return id === this.profileUserId;
      });

      // 2. If public, filter by Approved status
      if (this.isPublic) {
        filtered = filtered.filter(art => {
          if (!art.status || !art.status.approval) return false;
          const status = this.getName('en', art.status.approval);
          return ['Approved', 'Success'].includes(status);
        });
      }

      // 3. Sort by Priority and Date
      return filtered.sort((a, b) => {
        // Priority Score: Approved = 1, Others = 2, Pending = 3
        const getPriority = (art) => {
          const statusEn = art.status && art.status.approval 
              ? this.getName('en', art.status.approval).toLowerCase() 
              : (typeof art.status === 'string' ? art.status.toLowerCase() : '');
          
          if (statusEn.includes('approve') || statusEn.includes('accept')) return 1;
          if (statusEn.includes('pending')) return 3;
          return 2;
        };

        const priorityA = getPriority(a);
        const priorityB = getPriority(b);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Within same priority group, sort by updatedAt desc (newest first)
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
    },
    nameEn() {
      return this.form ? this.form.nameEn : '';
    },
    studentId() {
      return this.form ? this.form.studentId : '';
    },
    initials() {
      if (!this.nameEn) return 'A';
      return this.nameEn.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    totalArtworksPages() {
      if (!this.artistArtworks) return 0;
      return Math.ceil(this.artistArtworks.length / this.itemsPerPage);
    },
    paginatedArtworks() {
      if (!this.artistArtworks) return [];
      const start = (this.activePage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.artistArtworks.slice(start, end);
    },
    processedOrders() {
      if (!this.allOrders) return [];
      return this.allOrders
        .filter(order => order.user === this.profileUserId || (order.user && order.user._id === this.profileUserId))
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
            if (s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success')) return 'Approved';
            if (s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('fail')) return 'Rejected';
            return 'Pending';
          })()
        }));
    },
    filteredOrders() {
      if (!this.orderSearch) return this.processedOrders;
      const q = this.orderSearch.toLowerCase();
      return this.processedOrders.filter(o => 
        o.orderIdDisplay.toLowerCase().includes(q) ||
        o.statusName.toLowerCase().includes(q) ||
        o.dateDisplay.toLowerCase().includes(q)
      );
    }
  },
  async created() {
    this.$store.dispatch('artwork/get');
    this.$store.dispatch('submission/get', { artist: this.profileUserId });
    this.$store.dispatch('order/get', {});
  },
  methods: {
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
      this.artworkToDelete = art;
      
      // Reset dialog state
      this.$store.commit('dialog/isCode', null);
      
      // Show confirmation dialog
      this.$store.commit('dialog/dialog', {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${this.getName('en', art)}"? This action cannot be undone.`,
        number: '001',
        code: 'DELETE_ARTWORK',
        status: true,
        button: [
          {
            label: 'CANCEL',
            icon: 'cil-ban',
            color: 'secondary',
            code: 'cancel'
          },
          {
            label: 'DELETE',
            icon: 'cil-trash',
            color: 'danger',
            code: 'confirm_delete'
          }
        ]
      });
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
        // Force refresh user list, or fetch specific user
        const users = await this.$store.dispatch('user/get', {});
        // Find the user directly from the fetched array
        const currentUser = users ? users.find(u => u._id === this.profileUserId) : null;
        
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
            studentId: currentUser.studentId,
            image: currentUser.image,
            nameTh: getName('th'),
            nameEn: getName('en'),
            email: currentUser.contact ? currentUser.contact.studentEmail : '',
            personalEmail: currentUser.contact ? currentUser.contact.personalEmail : '',
            telephone: currentUser.contact ? currentUser.contact.telephone : '',
            bio: currentUser.bio || ''
          };
        } else {
          console.error("Profile Error: User not found in database matching ID:", this.profileUserId);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },
    getAvatarColor(name) {
      const colors = ['#321fdb', '#f97316', '#10b981', '#ef4444', '#8b5cf6'];
      if (!name) return colors[0];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
    triggerUpload() {
      this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        // Provide instant local preview
        this.form.image = URL.createObjectURL(file);
        
        // Save the file for actual upload later when Save Changes is clicked
        this.selectedFile = file;

        // Reset file input so same file can be selected again
        this.$refs.fileInput.value = '';
      }
    },
    async cancelEdit() {
      this.isEditing = false;
      this.selectedFile = null;
      await this.fetchProfile(); // Reset the data to current database state
    },
    async handleSave() {
      try {
        const payload = {
          _id: this.form._id,
          name: [
            { key: 'th', value: this.form.nameTh },
            { key: 'en', value: this.form.nameEn }
          ],
          contact: {
            studentEmail: this.form.email,
            personalEmail: this.form.personalEmail,
            telephone: this.form.telephone
          },
          bio: this.form.bio
        };

        if (this.form.image && !this.selectedFile) {
          payload.image = this.form.image;
        }

        // 1. Update text data first
        await this.$store.dispatch('user/update', payload);

        // 2. Upload image if a new photo was selected
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('_id', this.userId);
          formData.append('image', this.selectedFile);

          await this.$store.dispatch('user/upload', formData);
          this.selectedFile = null;
        }
        
        alert('Profile updated successfully!');
        
        await this.fetchProfile();
        this.isEditing = false;
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
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
          price: payload.price,
          status: payload.status
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
          price: payload.price,
          status: payload.status
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
    dialogCode(val) {
      if (val === 'confirm_delete' && this.artworkToDelete) {
        const artId = this.artworkToDelete._id;
        
        // Execute delete
        this.$store.dispatch('artwork/delete', { _id: artId })
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
          })
          .finally(() => {
            this.artworkToDelete = null;
            this.$store.commit('dialog/isCode', null);
          });
      }
    },
    profileUserId: {
      handler: 'fetchProfile',
      immediate: true
    }
  }
}
</script>

<style scoped>
.profile-view-bg {
  margin-top: -2rem !important;
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

.avatar-preview {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -2px;
}

.btn-upload {
  color: #8c1515 !important;
  border-color: #8c1515 !important;
  background-color: transparent !important;
  font-weight: 600 !important;
}

.btn-upload:hover {
  background-color: #fff1f1 !important;
  color: #701111 !important;
  border-color: #701111 !important;
}

/* Form Styles */
.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.custom-input ::v-deep .form-control {
  padding: 0.85rem 1.25rem;
  height: auto;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  color: #1e293b;
}

.custom-input ::v-deep .form-control:focus {
  border-color: #321fdb33;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(50, 31, 219, 0.05);
}

.bio-textarea ::v-deep .form-control {
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  background-color: #f8fafc;
  padding: 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: none;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
}

.btn-modal-action {
  padding: 0.75rem 2.5rem !important;
  font-size: 0.95rem !important;
  min-width: 180px;
  transition: all 0.3s ease;
  border-width: 2px !important;
}

.btn-modal-action:not(.btn-save-action) {
  color: #8c1515 !important;
  border-color: #8c1515 !important;
  background-color: transparent !important;
}

.btn-modal-action:not(.btn-save-action):hover {
  background-color: #fff1f1 !important;
  transform: translateY(-2px);
}

.btn-save-action {
  background-color: #8c1515 !important;
  border: 2px solid #8c1515 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(140, 21, 21, 0.2) !important;
}

.btn-save-action:hover {
  background-color: #701111 !important;
  border-color: #701111 !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(140, 21, 21, 0.3) !important;
}

/* Modal Specific Adjustments */
::v-deep .modal-body {
  padding: 0 !important;
}

.modal-bg-wrapper {
  background-color: #f8fafc;
  padding: 2rem;
}

@media (max-width: 992px) {
  .modal-bg-wrapper {
    padding: 1rem;
  }
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
