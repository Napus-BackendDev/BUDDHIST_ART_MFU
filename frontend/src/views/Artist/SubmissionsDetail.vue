<template>
  <div class="submissions-detail-premium" v-if="submission">
    <!-- Header with Back Button -->
    <div class="detail-header-premium d-flex align-items-center mb-4 animate-in">
      <button class="btn-back-minimal mr-3 shadow-premium-sm" @click="$emit('back')">
        <CIcon name="cil-arrow-left" size="lg" />
      </button>
      <div>
        <h4 class="mb-0 font-weight-bold text-dark-premium">{{ getName($i18n.locale, submission) }}</h4>
        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Select an assignment below to submit your artwork or view your submissions.' : 'เลือกงานที่ได้รับมอบหมายด้านล่างเพื่อส่งผลงานหรือดูผลงานของคุณ' }}</p>
      </div>
    </div>

    <!-- Assignment List as Bars -->
    <div class="assignment-bars-list mt-2">
       <div 
         v-for="(assign, index) in submission.assignments" 
         :key="assign._id || index"
         class="assignment-bar-item mb-3 animate-up"
         :style="{ animationDelay: (index * 0.05) + 's' }"
         @click="handleBarClick(assign)"
       >
         <div class="assignment-bar-content shadow-premium-sm rounded-xl bg-white border-0 overflow-hidden d-flex align-items-center p-3 px-md-4">
            <div class="task-icon-circle mr-3 mr-md-4" :class="getAssignmentStatusClass(assign)">
              <CIcon :name="getAssignmentIcon(assign)" />
            </div>

            <div class="flex-grow-1 mr-3 mr-md-4 py-1">
              <h6 class="mb-1 font-weight-bold text-dark-premium text-truncate">{{ getName($i18n.locale, assign) }}</h6>
              <div class="d-flex align-items-center flex-wrap">
                <div class="meta-item-minimal mr-3">
                  <CIcon name="cil-clock" class="mr-1 opacity-6" size="sm" />
                  <span>{{ $i18n.locale === 'en' ? 'Deadline' : 'กำหนดส่ง' }}: {{ formatDateTime(assign.create.endAt) }}</span>
                </div>
                <div v-if="hasSubmitted(assign)" class="meta-item-minimal text-success">
                  <CIcon name="cil-check-circle" class="mr-1" size="sm" />
                  <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Submitted' : 'ส่งแล้ว' }}</span>
                </div>
              </div>
            </div>

            <div class="status-indicator-minimal mr-md-4 d-none d-sm-block">
               <div :class="['status-pill-flat', getAssignmentStatusClass(assign)]">
                 <div class="status-dot mr-2"></div>
                 {{ getAssignmentStatusLabel(assign, $i18n.locale) }}
               </div>
            </div>

            <div class="action-btn-minimal ml-auto">
              <template v-if="!isClosed(assign)">
                <CButton v-if="hasSubmitted(assign)" color="info" shape="pill" variant="outline" class="btn-sm px-3 font-weight-bold btn-resubmit" @click.stop="handleOpenSubmission(assign)">
                  {{ $i18n.locale === 'en' ? 'Resubmit' : 'ส่งงานใหม่' }}
                </CButton>
                <CButton v-else color="success" shape="pill" class="btn-sm px-4 font-weight-bold btn-submit-now" @click.stop="handleOpenSubmission(assign)">
                  {{ $i18n.locale === 'en' ? 'Submit Work' : 'ส่งงาน' }}
                </CButton>
              </template>
              <template v-else>
                <div class="text-muted small font-weight-bold text-uppercase opacity-6">{{ $i18n.locale === 'en' ? 'Submission Closed' : 'ปิดรับงานแล้ว' }}</div>
              </template>
            </div>
         </div>
       </div>
    </div>

    <!-- Modals -->
    <SubmissionModal 
      :show.sync="showSubmissionModal" 
      :assignmentTitle="selectedAssignmentTitle" 
      :loading="submitting" 
      @submit="handleWorkSubmit" 
    />
    
    <ArtworkViewModal 
      :show.sync="showViewModal" 
      :artwork="selectedArtwork" 
      @edit="handleEditArtworkFromView" 
    />
    
    <ArtworkEditModal 
      :show.sync="showEditModal" 
      :artwork="selectedArtworkForEdit" 
      @save="handleUpdateArtwork" 
    />
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import SubmissionModal from './components/modal/SubmissionModal.vue'
import ArtworkViewModal from '../Admin/components/modal/artwork/ArtworkViewModal.vue'
import ArtworkEditModal from '../Admin/components/modal/artwork/ArtworkEditModal.vue'
import HeaderHero from './components/HeaderHero.vue'

export default {
    name: 'SubmissionsDetail',
    components: {
        SubmissionModal,
        ArtworkViewModal,
        ArtworkEditModal
    },
    props: {
        id: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            showSubmissionModal: false,
            showViewModal: false,
            showEditModal: false,
            submitting: false,
            selectedAssignment: null,
            selectedArtwork: null,
            selectedArtworkForEdit: null
        }
    },
    created() {
        this.fetchSubmission();
    },
    computed: {
        ...mapGetters({
            userId: 'auth/userId'
        }),
        submission() {
            const submissionId = this.id || this.$route.params.id;
            return this.$store.getters['submission/submissions'].find(s => s._id === submissionId);
        },
        selectedAssignmentTitle() {
            return this.selectedAssignment ? this.getName('en', this.selectedAssignment) : '';
        }
    },
    methods: {
        fetchSubmission() {
            const submissionId = this.id || this.$route.params.id;
            if (submissionId) {
                this.$store.dispatch('submission/get', { _id: submissionId });
            }
        },
        handleBarClick(assign) {
            if (this.hasSubmitted(assign)) {
                this.handleViewWork(assign);
            } else if (!this.isClosed(assign)) {
                this.handleOpenSubmission(assign);
            }
        },
        handleOpenSubmission(assign) {
            this.selectedAssignment = assign;
            this.showSubmissionModal = true;
        },
        handleViewWork(assign) {
            const currentUserId = this.userId;
            const artwork = assign.artworks.find(art => {
                const ownerId = art.owner?._id || art.owner;
                return ownerId === currentUserId;
            });
            if (artwork) {
                this.selectedArtwork = artwork;
                this.showViewModal = true;
            }
        },
        handleWorkSubmit(artworkData) {
            this.submitting = true;
            const payload = {
                submissionId: this.submission._id,
                assignmentId: this.selectedAssignment._id,
                artwork: artworkData
            };
            this.$store.dispatch('submission/submitWork', payload)
                .then(() => {
                    this.showSubmissionModal = false;
                    this.fetchSubmission();
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
        handleEditArtworkFromView(artwork) {
            this.selectedArtworkForEdit = artwork;
            this.showViewModal = false;
            this.showEditModal = true;
        },
        handleUpdateArtwork(artworkData) {
            this.$store.dispatch('artwork/update', artworkData)
                .then(() => {
                    this.showEditModal = false;
                    this.fetchSubmission();
                });
        },
        formatDateTime(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY HH:mm')
        },
        getName(lang, item) {
            if (!item || !item.title) return 'N/A';
            if (typeof item.title === 'string') return item.title;
            if (Array.isArray(item.title)) {
                const nameObj = item.title.find(n => n.key === lang);
                return nameObj ? nameObj.value : (item.title[0] ? item.title[0].value : 'N/A');
            }
            return 'N/A';
        },
        isClosed(item) {
            return item.create && item.create.endAt && moment(item.create.endAt).isBefore(moment());
        },
        hasSubmitted(item) {
            if (!item.artworks || !Array.isArray(item.artworks)) return false;
            const currentUserId = this.userId;
            return item.artworks.some(art => {
                const ownerId = art.owner?._id || art.owner;
                return ownerId === currentUserId;
            });
        },
        getAssignmentStatusClass(item) {
            if (this.isClosed(item)) return 'status-closed';
            if (this.hasSubmitted(item)) return 'status-open'; // Use green for submitted too
            return 'status-upcoming';
        },
        getAssignmentStatusLabel(item, lang = 'en') {
            if (this.isClosed(item)) return lang === 'en' ? 'Closed' : 'ปิดแล้ว';
            if (this.hasSubmitted(item)) return lang === 'en' ? 'Submitted' : 'ส่งแล้ว';
            return lang === 'en' ? 'In Progress' : 'กำลังดำเนินการ';
        },
        getAssignmentIcon(item) {
            if (this.isClosed(item)) return 'cilLockLocked';
            if (this.hasSubmitted(item)) return 'cilCheckCircle';
            return 'cilDescription';
        }
    }
}
</script>

<style scoped>
.submissions-detail-premium {
    animation: fadeIn 0.5s ease-out;
}

.btn-back-minimal {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: none;
    background: white;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.btn-back-minimal:hover {
    background: #f1f5f9;
    color: #1e293b;
    transform: translateX(-3px);
}

.assignment-bar-item {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.assignment-bar-item:hover {
    transform: scale(1.01) translateY(-2px);
}

.assignment-bar-content {
    min-height: 85px;
    border: 1px solid #f1f5f9;
}

.assignment-bar-item:hover .assignment-bar-content {
    border-color: #e2e8f0;
    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08) !important;
}

.task-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #94a3b8;
}

.task-icon-circle.status-open { background: #ecfdf5; color: #10b981; }
.task-icon-circle.status-closed { background: #fef2f2; color: #ef4444; }
.task-icon-circle.status-upcoming { background: #fffbeb; color: #f59e0b; }

.text-dark-premium { color: #1e293b; }

.meta-item-minimal {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
}

.text-muted-xs {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 600;
}

.status-pill-flat {
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    background: #f8fafc;
    color: #64748b;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}

.status-pill-flat.status-open { background: #d1fae5; color: #065f46; }
.status-pill-flat.status-closed { background: #fee2e2; color: #991b1b; }
.status-pill-flat.status-upcoming { background: #fef3c7; color: #92400e; }

.btn-submit-now {
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
    transition: all 0.3s ease;
}

.btn-submit-now:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

.btn-resubmit {
    border-width: 2px;
}

.animate-in { animation: fadeIn 0.4s ease-out; }
.animate-up { animation: fadeInUp 0.4s ease-out both; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

.shadow-premium-sm {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
}

.rounded-xl { border-radius: 20px !important; }
.opacity-6 { opacity: 0.6; }
</style>
