<template>
  <div class="artist-profile-page" v-if="form">
    <ArtistProfileHeader :user="user" @edit="isEditing = true" />

    <!-- Tabs Container -->
    <CCard class="profile-tabs-card mx-3 mt-2 mb-5 border-0 shadow-sm rounded-xl overflow-hidden">
      <CTabs variant="tabs" :active-tab="0" class="custom-profile-tabs pt-3 px-3">
        <CTab title="Artworks" active class="py-4">
          <ArtworkCard :artworks="artistArtworks" />
        </CTab>
        <CTab title="Submissions" class="py-4">
          <SubmissionTable 
            :filters="{ search: '', quickRange: 'All Time' }" 
            @view="handleViewSubmission"
            @edit="handleEditSubmission"
            @delete="handleDeleteSubmission"
          />
        </CTab>
      </CTabs>
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
        <CButton @click="cancelEdit" color="secondary" variant="outline" shape="pill">Cancel</CButton>
        <CButton @click="handleSave" color="primary" shape="pill" class="btn-save font-weight-bold px-4">
          <CIcon name="cil-save" class="mr-2" /> Save Changes
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import ArtistProfileHeader from './components/ArtistProfileHeader.vue'
import ArtworkCard from '../User/components/card/CardArtworks.vue'
import SubmissionTable from '../Admin/components/table/SubmissionTable.vue'
import { mapGetters } from 'vuex';

export default {
  name: 'ArtistProfile',
  components: {
    ArtistProfileHeader,
    ArtworkCard,
    SubmissionTable
  },
  data() {
    return {
      form: null,
      loading: false,
      isEditing: false,
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
    }
  }
}
</script>

<style scoped>
.artist-profile-page {
  padding-bottom: 5rem;
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

.btn-save {
  background-color: #321fdb !important;
  border: none !important;
  color: white !important;
  padding: 1rem 3.5rem !important;
  font-size: 1rem !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -10px rgba(50, 31, 219, 0.4) !important;
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

/* Tabs Adjustments */
.profile-tabs-card {
  z-index: 2;
  position: relative;
}

.custom-profile-tabs ::v-deep .nav-tabs {
  border-bottom: 2px solid #f1f5f9;
}

.custom-profile-tabs ::v-deep .nav-link {
  color: #64748b;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 1rem 1.5rem;
  margin-bottom: -2px;
  background: transparent;
}

.custom-profile-tabs ::v-deep .nav-link:hover {
  color: #321fdb;
}

.custom-profile-tabs ::v-deep .nav-link.active {
  color: #321fdb;
  border-bottom: 2px solid #321fdb;
}

/* Override SubmissionTable inner card */
.custom-profile-tabs ::v-deep .submission-table-card {
  border: none;
  box-shadow: none;
  margin-top: 0;
}
</style>
