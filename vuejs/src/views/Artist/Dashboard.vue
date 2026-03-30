<template>
  <div class="artist-dashboard">
    <HeaderHero 
      title="Artist Workspace" 
      description="Welcome back! Here you can manage your art collection, track submissions, and apply for new exhibitions." 
      icon="cil-brush" 
      :showCreateButton="true" 
      createButtonText="Submit New Art" 
      @create="addSubmission" 
    />
    
    <CRow>
      <CCol md="12">
        <CCard class="shadow-premium border-0 rounded-lg overflow-hidden">
          <CCardHeader class="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 font-weight-bold">Your Submissions</h5>
            <CBadge color="info" shape="pill" class="px-3 py-2">Ongoing: {{ filteredSubmissions.length }}</CBadge>
          </CCardHeader>
          <CCardBody class="p-0">
            <SubmissionTable 
              :filters="filters" 
              @view="handleView" 
              @edit="handleEdit" 
              @delete="handleDelete" 
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <SubmissionCreateModal :show.sync="showCreateModal" @save="handleSave" />
    <SubmissionEditModal :show.sync="showEditModal" :submissionData="selectedSubmission" @update="handleUpdate" />
  </div>
</template>

<script>
import SubmissionTable from '../Admin/components/table/SubmissionTable.vue'
import HeaderHero from '../Admin/components/HeaderHero.vue'
import SubmissionCreateModal from '../Admin/components/modal/submission/SubmissionCreateModal.vue'
import SubmissionEditModal from '../Admin/components/modal/submission/SubmissionEditModal.vue'
import { mapGetters } from 'vuex';

export default {
  name: 'ArtistDashboard',
  components: {
    SubmissionTable,
    HeaderHero,
    SubmissionCreateModal,
    SubmissionEditModal
  },
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      selectedSubmission: null,
      filters: {
        search: '',
        quickRange: 'All Time'
      }
    }
  },
  computed: {
    ...mapGetters({
      submissions: 'submission/submission',
      userId: 'auth/userId'
    }),
    filteredSubmissions() {
      if (!this.submissions) return [];
      // In a real system, we would filter by this.userId
      // For now, we'll just show the submissions to represent the view
      return this.submissions;
    }
  },
  created() {
    this.fetchSubmissions();
  },
  methods: {
    fetchSubmissions() {
      this.$store.dispatch('submission/get', {});
    },
    addSubmission() {
      this.showCreateModal = true;
    },
    handleSave(data) {
      this.$store.dispatch('submission/create', data)
        .then(() => {
          this.fetchSubmissions();
          this.showCreateModal = false;
        });
    },
    handleView(item) {
      this.$router.push({ name: 'SubmissionsDetail', params: { id: item._id } });
    },
    handleEdit(item) {
      this.selectedSubmission = item;
      this.showEditModal = true;
    },
    handleUpdate(data) {
      this.$store.dispatch('submission/update', data)
        .then(() => {
          this.fetchSubmissions();
          this.showEditModal = false;
        });
    },
    handleDelete(item) {
      if (confirm('Are you sure you want to delete this submission?')) {
        this.$store.dispatch('submission/delete', { _id: item._id })
          .then(() => {
            this.fetchSubmissions();
          });
      }
    }
  }
}
</script>

<style scoped>
.artist-dashboard {
  padding-bottom: 3rem;
}

.shadow-premium {
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05) !important;
}

.rounded-lg {
  border-radius: 1rem !important;
}
</style>
