<template>
  <div class="artist-profile-page" v-if="form">
    <ArtistProfileHeader :user="user" @edit="isEditing = true" />

    <!-- Artwork Portfolio Section -->
    <CCard class="profile-portfolio-card mx-3 mt-4 mb-5 border-0 shadow-premium rounded-xl overflow-hidden">
      <CCardHeader class="portfolio-header bg-white border-0 pt-5 px-4 px-md-5 d-flex justify-content-between align-items-end flex-wrap">
        <div class="header-title-group mb-3 mb-md-0">
          <h3 class="mb-1 font-weight-bold text-dark portfolio-title">My Artwork Portfolio</h3>
          <p class="text-muted mb-0 portfolio-subtitle">Explore and manage your collection of digital and physical art pieces.</p>
        </div>
        <div class="header-actions-group">
          <CButton color="primary" shape="pill" class="px-4 py-2 font-weight-bold shadow-sm btn-add-artwork" @click="handleAddNewArtwork">
            <CIcon name="cil-plus" class="mr-2" /> Add New Artwork
          </CButton>
        </div>
      </CCardHeader>
      
      <CCardBody class="p-4 p-md-5">
        <div class="portfolio-grid-container">
          <ArtworkCard :artworks="artistArtworks" />
        </div>
      </CCardBody>
    </CCard>

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
              <CButton color="primary" variant="outline" shape="pill" class="btn-sm btn-upload mt-3 shadow-sm" @click="triggerUpload">
                <CIcon name="cil-camera" class="mr-2" /> Change Photo
              </CButton>
              <input type="file" ref="fileInput" class="d-none" @change="onFileChange" accept="image/*" />
            </div>

            <h4 class="font-weight-bold mb-1">{{ nameEn }}</h4>
            <p class="text-muted small mb-4">{{ studentId }}</p>
            
            <div class="text-left mt-4 border-top pt-4">
              <label class="section-label mb-2">Biography</label>
              <CTextarea 
                v-model="form.bio"
                placeholder="Tell us about yourself and your artistic style..."
                class="bio-textarea"
                rows="4"
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
    
    <!-- Artwork Creation Modal -->
    <ArtworkCreateModal 
      :show="showArtworkModal" 
      :initialArtistId="userId"
      @update:show="showArtworkModal = $event"
      @save="handleArtworkSave"
    />
  </div>
</template>

<script>
import ArtistProfileHeader from './components/ArtistProfileHeader.vue'
import ArtworkCard from './components/card/CardArtworks.vue'
import SubmissionTable from '../Admin/components/table/SubmissionTable.vue'
import ArtworkCreateModal from './components/modal/ArtworkCreateModal.vue'
import { mapGetters } from 'vuex';

export default {
  name: 'ArtistProfile',
  components: {
    ArtistProfileHeader,
    ArtworkCard,
    SubmissionTable,
    ArtworkCreateModal
  },
  data() {
    return {
      form: null,
      loading: false,
      isEditing: false,
      showArtworkModal: false,
      selectedFile: null
    }
  },
  computed: {
    ...mapGetters({
      userId: 'auth/userId',
      users: 'user/user',
      allArtworks: 'artwork/artworks'
    }),
    user() {
      // Find current user from the list
      if (!this.users) return null;
      return this.users.find(u => u._id === this.userId);
    },
    artistArtworks() {
      if (!this.allArtworks) return [];
      return this.allArtworks.filter(art => {
        console.log(art);
        if (!art.artist) return false;
        const id = typeof art.artist === 'object' ? art.artist._id : art.artist;
        return id === this.userId;
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
    }
  },
  async created() {
    await this.fetchProfile();
    this.$store.dispatch('artwork/get');
    this.$store.dispatch('submission/get', {});
  },
  methods: {
    handleViewSubmission(item) {
      if(item && item._id) this.$router.push({ name: 'SubmissionsDetail', params: { id: item._id } });
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
    async fetchProfile() {
      try {
        await this.$store.dispatch('user/get', { _id: this.userId });
        if (this.user) {
          const getName = (lang) => {
            if (Array.isArray(this.user.name)) {
              const obj = this.user.name.find(n => n.key === lang);
              return obj ? obj.value : '';
            }
            return '';
          };
          
          this.form = {
            _id: this.user._id,
            studentId: this.user.studentId,
            image: this.user.image,
            nameTh: getName('th'),
            nameEn: getName('en'),
            email: this.user.contact ? this.user.contact.studentEmail : '',
            personalEmail: this.user.contact ? this.user.contact.personalEmail : '',
            telephone: this.user.contact ? this.user.contact.telephone : '',
            bio: this.user.bio || ''
          };
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
        
        // Prepare FormData for multi-part upload
        const formData = new FormData();
        formData.append('title', JSON.stringify(payload.title));
        formData.append('description', JSON.stringify(payload.description));
        formData.append('technique', JSON.stringify(payload.technique));
        formData.append('artist', payload.artist);
        formData.append('category', payload.category);
        formData.append('price', payload.price);
        formData.append('status', JSON.stringify(payload.status));
        
        if (payload._image) {
          formData.append('image', payload._image);
        }

        // Call artwork/upload action
        await this.$store.dispatch('artwork/upload', formData);
        
        this.$store.commit('dialog/showToast', {
          title: 'Success',
          message: 'Artwork added to your portfolio successfully!',
          variant: 'success'
        });
        
        this.showArtworkModal = false;
        
        // Refresh artwork list
        await this.$store.dispatch('artwork/get');
        
      } catch (error) {
        console.error('Error creating artwork:', error);
        this.$store.commit('dialog/showToast', {
          title: 'Error',
          message: 'Failed to add artwork. Please try again.',
          variant: 'danger'
        });
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
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
  border-radius: 12px;
  border: 1px solid #f1f5f9;
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
  background-color: #2c1bbd;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(50, 31, 219, 0.2) !important;
}

.portfolio-grid-container {
  min-height: 400px;
}

/* Override ArtworkCard default margins if needed */
::v-deep .artwork-card {
  margin-bottom: 2rem;
}
</style>
