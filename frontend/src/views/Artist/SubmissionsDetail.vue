<template>
  <div class="submissions-detail-premium">
    <div v-if="loadError" role="alert" class="alert alert-warning">
      <p>{{ loadMessage }}</p>
      <button type="button" class="btn btn-warning" :disabled="retryNow < retryAt" @click="fetchSubmission">{{ $i18n.locale === 'en' ? 'Try again' : 'ลองใหม่' }}</button>
    </div>
    <p v-if="loading && !submission" role="status">{{ $i18n.locale === 'en' ? 'Loading submission...' : 'กำลังโหลดรายการส่งงาน...' }}</p>
    <section v-else-if="!submission && !loadError" class="text-center py-5">
      <h2>{{ $i18n.locale === 'en' ? 'Submission not found' : 'ไม่พบรายการส่งงาน' }}</h2>
      <p>{{ $i18n.locale === 'en' ? 'This submission is unavailable or is not assigned to your account.' : 'รายการนี้ไม่มีอยู่ หรือไม่ได้มอบหมายให้บัญชีของคุณ' }}</p>
      <button type="button" class="btn btn-outline-dark" @click="handleBack">{{ $i18n.locale === 'en' ? 'Back to submissions' : 'กลับรายการส่งงาน' }}</button>
    </section>
    <template v-if="submission">
    <!-- Header with Back Button -->
    <div class="detail-header-premium d-flex align-items-center mb-4 animate-in">
      <button type="button" class="btn-back-minimal mr-3 shadow-premium-sm" :aria-label="$i18n.locale === 'en' ? 'Back to submissions' : 'กลับรายการส่งงาน'" @click="handleBack">
        <CIcon name="cil-arrow-left" size="lg" />
      </button>
      <div>
        <h4 class="mb-0 font-weight-bold text-dark-premium">{{ getName($i18n.locale, submission) }}</h4>
        <p v-if="submission.assignments && submission.assignments.length" class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Select an assignment below to submit your artwork or view your submissions.' : 'เลือกงานที่ได้รับมอบหมายด้านล่างเพื่อส่งผลงานหรือดูผลงานของคุณ' }}</p>
      </div>
    </div>

    <!-- Assignment List as Bars -->
    <p v-if="!isParticipant" class="alert alert-info" role="status">{{ $i18n.locale === 'en' ? 'You are not registered for this submission. Contact an administrator to register before submitting artwork.' : 'คุณยังไม่ได้ลงทะเบียนในรายการส่งงานนี้ กรุณาติดต่อผู้ดูแลเพื่อลงทะเบียนก่อนส่งผลงาน' }}</p>
    <p v-if="!submission.assignments || !submission.assignments.length" class="text-muted text-center py-4" role="status">{{ $i18n.locale === 'en' ? 'No assignments are available in this submission yet.' : 'ยังไม่มีงานที่มอบหมายในรายการส่งงานนี้' }}</p>
    <div class="assignment-bars-list mt-2">
       <div 
         v-for="(assign, index) in submission.assignments" 
         :key="assign._id || index"
         class="assignment-wrapper mb-3 animate-up"
         :style="{ animationDelay: (index * 0.05) + 's' }"
       >
         <div 
           class="assignment-bar-item"
           :class="{ 'is-expanded': expandedAssignmentId === assign._id }"
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
                  <CIcon name="cil-calendar" class="mr-1 opacity-6" size="sm" />
                  <span>
                    {{ $i18n.locale === 'en' ? 'Period: ' : 'เริ่มตั้งแต่ ' }}{{ formatDate(assign.create.startAt) }}{{ $i18n.locale === 'en' ? ' to ' : ' สิ้นสุดวันที่ ' }}{{ formatDate(assign.create.endAt) }}
                  </span>
                </div>
                <!-- Inline Submitted Status & Approval -->
                <div v-if="hasSubmitted(assign)" class="d-flex align-items-center flex-wrap">
                  <div class="meta-item-minimal text-success d-flex align-items-center mr-2">
                    <CIcon name="cil-check-circle" class="mr-1" size="sm" />
                    <span class="font-weight-bold">{{ $i18n.locale === 'en' ? 'Submitted' : 'ส่งแล้ว' }}</span>
                  </div>
                  <div v-if="getSubmittedArtwork(assign)" class="approval-tag" :class="getApprovalStatusClass(getSubmittedArtwork(assign))">
                    <span class="dot"></span>
                    {{ getApprovalStatusLabel(getSubmittedArtwork(assign), $i18n.locale) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Status Badge & Actions -->
            <div class="d-flex align-items-center ml-auto">
              <!-- Status Pill Badge -->
              <div class="status-indicator-minimal mr-3 d-none d-md-block">
                 <div :class="['status-pill-flat', getAssignmentStatusClass(assign)]">
                   <div class="status-dot mr-2"></div>
                   {{ getAssignmentStatusLabel(assign, $i18n.locale) }}
                 </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-btn-minimal d-flex align-items-center">
                <!-- If Has Artworks: Can always view -->
                <template v-if="assign.artworks && assign.artworks.length > 0">
                  <CButton 
                    color="primary" 
                    shape="pill" 
                    variant="outline" 
                    class="btn-sm px-3 font-weight-bold mr-2" 
                    @click.stop="handleViewWork(assign)"
                  >
                    {{ $i18n.locale === 'en' ? 'View Artworks' : 'ดูผลงานทั้งหมด' }}
                  </CButton>
                </template>

                <!-- Submit Button if not closed and is started -->
                <CButton 
                  v-if="canSubmitAssignment(assign) && !isClosed(assign) && !isNotStarted(assign)"
                  color="info" 
                  shape="pill" 
                  variant="outline" 
                  class="btn-sm px-3 font-weight-bold" 
                  @click.stop="handleOpenSubmission(assign)"
                >
                  {{ hasSubmitted(assign)
                    ? ($i18n.locale === 'en' ? 'Submit Again' : 'ส่งงานอีกครั้ง')
                    : ($i18n.locale === 'en' ? 'Submit' : 'ส่งงาน') }}
                </CButton>
                <span v-if="isParticipant && !canSubmitAssignment(assign)" class="text-muted small">
                  {{ $i18n.locale === 'en' ? 'This assignment is not assigned to your account.' : 'ใบงานนี้ไม่ได้มอบหมายให้บัญชีของคุณ' }}
                </span>

                <!-- If Not Open Yet: Show nothing or keep layout -->
                <template v-if="isNotStarted(assign)">
                  <!-- Button removed / Text removed per user request -->
                </template>

                <!-- If Closed and not submitted: Show text -->
                <template v-else-if="isClosed(assign) && !hasSubmitted(assign)">
                  <div class="text-muted small font-weight-bold text-uppercase opacity-6">
                    {{ $i18n.locale === 'en' ? 'Submission Closed' : 'ปิดการส่งงาน' }}
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Content for View Work -->
        <transition name="slide-fade-down">
          <div v-if="expandedAssignmentId === assign._id" class="expanded-artwork-panel shadow-premium-sm">
            <div class="p-4 bg-white rounded-bottom-xl border-top-light">
              <div v-if="assign.artworks && assign.artworks.length > 0">
                <section v-for="group in getArtworkGroups(assign)" :key="group.key" class="artwork-owner-group" :class="{ 'other-owner-group': group.key === 'others' }">
                  <h6 class="artwork-group-title mb-3">
                    <span class="artwork-group-icon">
                      <CIcon :name="group.key === 'mine' ? 'cil-user' : 'cil-people'" size="sm" />
                    </span>
                    {{ group.label }} ({{ group.items.length }})
                  </h6>
                  <div class="artwork-rows-container">
                    <div v-for="artwork in group.items" :key="artwork._id" class="artwork-horizontal-item shadow-premium-sm rounded-lg overflow-hidden border bg-white mb-3 d-flex align-items-center p-2">
                      <div class="artwork-row-thumb-wrap mr-3" @click="handleViewArtworkModal(artwork)">
                        <img :src="artwork.image" class="artwork-img-row" />
                        <div class="thumb-overlay-minimal">
                          <CIcon name="cil-fullscreen" class="text-white" size="sm" />
                        </div>
                      </div>
                      
                      <div class="flex-grow-1 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between pr-2">
                        <div class="mb-2 mb-md-0 overflow-hidden">
                          <h6 class="artwork-row-title mb-0 font-weight-bold text-truncate">{{ getName($i18n.locale, artwork) }}</h6>
                          <p class="text-muted-xs mb-0 opacity-7 font-weight-bold text-truncate">
                            {{ artwork.owner ? getArtistName(artwork.owner) : 'N/A' }}
                          </p>
                          <div v-if="getApprovalStatusClass(artwork) === 'status-closed' && artwork.rejectionReason" class="rejection-reason-box mt-1 text-danger small font-weight-bold">
                            {{ $i18n.locale === 'en' ? 'Reason for Rejection:' : 'เหตุผลที่ไม่ผ่าน:' }} {{ artwork.rejectionReason }}
                          </div>
                        </div>
                        
                        <div class="d-flex align-items-center ml-md-3 gap-3" style="gap: 12px;">
                          <!-- Resubmit Button for Rejected -->
                          <CButton 
                            v-if="canSubmitAssignment(assign) && isOwnArtwork(artwork) && getApprovalStatusClass(artwork) === 'status-closed' && !isClosed(assign) && !isNotStarted(assign)"
                            color="info" 
                            size="sm"
                            variant="outline"
                            class="px-3 font-weight-bold rounded-pill"
                            @click.stop="handleResubmit(assign, artwork)"
                          >
                            {{ $i18n.locale === 'en' ? 'Resubmit' : 'แก้ไขและส่งใหม่' }}
                          </CButton>

                          <div class="approval-tag-mini" :class="getApprovalStatusClass(artwork)">
                            {{ getApprovalStatusLabel(artwork, $i18n.locale) }}
                          </div>
                          
                          <CButton 
                            color="light" 
                            variant="ghost"
                            class="btn-sm btn-view-pill px-3 font-weight-bold" 
                            @click="handleViewArtworkModal(artwork)"
                          >
                            {{ $i18n.locale === 'en' ? 'View' : 'ดูรายละเอียด' }}
                          </CButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div v-else class="text-center py-5 text-muted bg-light-soft rounded-lg">
                <CIcon name="cil-image-broken" size="xl" class="mb-2 opacity-3" />
                <p class="mb-0 small font-weight-bold">{{ $i18n.locale === 'en' ? 'No artworks submitted in this round yet.' : 'ยังไม่มีการส่งผลงานในรอบนี้' }}</p>
              </div>
            </div>
          </div>
        </transition>
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
    
    <SubmissionEditModal 
      :show.sync="showEditModal" 
      :artwork="selectedArtworkForEdit" 
      :loading="submitting"
      @save="handleUpdateArtwork" 
    />
    </template>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import { retryAtFromHeaders } from '@/utils/rateLimit'
import SubmissionModal from './components/modal/SubmissionCreateModal.vue'
import ArtworkViewModal from './components/modal/ArtworkViewModal.vue'
import SubmissionEditModal from './components/modal/SubmissionEditModal.vue'

export default {
    name: 'SubmissionsDetail',
    components: {
        SubmissionModal,
        ArtworkViewModal,
        SubmissionEditModal
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
            selectedArtworkForEdit: null,
            expandedAssignmentId: null,
            refreshInterval: null,
            loading: false,
            loadError: '',
            retryAt: 0,
            retryNow: 0,
            retryTimer: null
        }
    },
    created() {
        this.fetchSubmission();
        // Set up real-time polling every 10 seconds
        this.refreshInterval = setInterval(() => {
            if (!this.loadError && !document.hidden) this.fetchSubmission();
        }, 10000);
    },
    beforeDestroy() {
        clearTimeout(this.retryTimer);
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },
    computed: {
        loadMessage() {
            if (this.loadError === 'rate') return this.$i18n.locale === 'en' ? 'Too many requests. Please wait before retrying.' : 'มีคำขอถี่เกินกำหนด กรุณารอก่อนลองใหม่';
            return this.$i18n.locale === 'en' ? 'Unable to load submissions. Please try again.' : 'โหลดรายการส่งงานไม่สำเร็จ กรุณาลองใหม่';
        },
        ...mapGetters({
            userId: 'auth/userId'
        }),
        submission() {
            const submissionId = this.id || this.$route.params.id;
            return (this.$store.getters['submission/submissions'] || []).find(s => s._id === submissionId);
        },
        isParticipant() {
            return !!this.userId && (this.submission?.artist || []).some(artist => String(artist?._id || artist) === String(this.userId));
        },
        selectedAssignmentTitle() {
            return this.selectedAssignment ? this.getName('en', this.selectedAssignment) : '';
        }
    },
    methods: {
        ownerId(artwork) {
            return artwork && artwork.owner ? (artwork.owner._id || artwork.owner) : null;
        },
        isOwnArtwork(artwork) {
            return String(this.ownerId(artwork) || '') === String(this.userId || '');
        },
        getArtworkGroups(assign) {
            const artworks = Array.isArray(assign.artworks) ? assign.artworks : [];
            const mine = artworks.filter(artwork => this.isOwnArtwork(artwork));
            const others = artworks.filter(artwork => !this.isOwnArtwork(artwork));
            return [
                {
                    key: 'mine',
                    label: this.$i18n.locale === 'en' ? 'My submitted artworks' : 'ผลงานที่ส่งเข้าร่วม',
                    items: mine
                },
                {
                    key: 'others',
                    label: this.$i18n.locale === 'en' ? 'Other participants’ artworks' : 'ผลงานของผู้เข้าร่วมคนอื่น',
                    items: others
                }
            ].filter(group => group.items.length > 0);
        },
        async fetchSubmission() {
            if (this.loading || Date.now() < this.retryAt) return;
            const submissionId = this.id || this.$route.params.id;
            if (!submissionId) return;
            this.loading = true;
            try {
                await this.$store.dispatch('submission/get', { _id: submissionId });
                this.loadError = '';
            } catch (error) {
                this.loadError = error.response?.status === 429 ? 'rate' : 'load';
                if (this.loadError === 'rate') {
                    this.retryAt = retryAtFromHeaders(error.response.headers);
                    this.retryNow = Date.now();
                    clearTimeout(this.retryTimer);
                    this.retryTimer = setTimeout(() => { this.retryNow = Date.now(); }, Math.max(0, this.retryAt - Date.now()));
                }
            } finally { this.loading = false; }
        },
        handleBack() {
            if (this.$route?.name === 'ArtistSubmissionsDetail') this.$router.push({ name: 'ArtistSubmissions' });
            else this.$emit('back');
        },
        handleBarClick(assign) {
            this.handleViewWork(assign);
        },
        canSubmitAssignment(assign) {
            return this.isParticipant && !!assign && assign.isAssigned === true;
        },
        handleOpenSubmission(assign) {
            if (!this.canSubmitAssignment(assign)) return;
            this.selectedAssignment = assign;
            this.showSubmissionModal = true;
        },
        handleViewWork(assign) {
            if (this.expandedAssignmentId === assign._id) {
                this.expandedAssignmentId = null;
            } else {
                this.expandedAssignmentId = assign._id;
            }
        },
        handleViewArtworkModal(artwork) {
            this.selectedArtwork = artwork;
            this.showViewModal = true;
        },
        handleWorkSubmit(artworkData) {
            if (!this.canSubmitAssignment(this.selectedAssignment)) return Promise.resolve();
            this.submitting = true;
            const payload = {
                submissionId: this.submission._id,
                assignmentId: this.selectedAssignment._id,
                artwork: artworkData
            };
            return this.$store.dispatch('submission/submitWork', payload)
                .then(() => {
                    this.showSubmissionModal = false;
                    this.fetchSubmission();
                })
                .catch(() => {
                    this.$store.commit('dialog/showToast', {
                        title: this.$i18n.locale === 'en' ? 'Could not submit artwork' : 'ส่งผลงานไม่สำเร็จ',
                        message: this.$i18n.locale === 'en' ? 'Refresh the page and try again.' : 'กรุณารีเฟรชหน้าแล้วลองใหม่',
                        variant: 'danger'
                    });
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
        handleEditArtworkFromView(artwork) {
            this.selectedArtworkForEdit = artwork;
            this.selectedAssignment = this.submission?.assignments?.find(round => round.artworks?.some(item => item._id === artwork._id)) || null;
            if (!this.canSubmitAssignment(this.selectedAssignment)) return;
            this.showViewModal = false;
            this.showEditModal = true;
        },
        handleResubmit(assign, artwork) {
            if (!this.canSubmitAssignment(assign)) return;
            this.selectedAssignment = assign;
            this.selectedArtworkForEdit = artwork;
            this.showEditModal = true;
        },
        async handleUpdateArtwork(artworkData) {
            this.submitting = true;
            try {
                const assignment = this.selectedAssignment || this.submission?.assignments?.find(round => round.artworks?.some(item => item._id === artworkData._id));
                if (!assignment) throw new Error('Submission assignment not found');
                if (!this.canSubmitAssignment(assignment)) return;
                await this.$store.dispatch('submission/submitWork', {
                    submissionId: this.submission._id,
                    assignmentId: assignment._id,
                    artwork: artworkData
                });
                this.showEditModal = false;
                await this.fetchSubmission();
            } catch (error) {
                console.error("Resubmit Error:", error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Could not update artwork' : 'แก้ไขผลงานไม่สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'Refresh the page and try again.' : 'กรุณารีเฟรชหน้าแล้วลองใหม่',
                    variant: 'danger'
                });
            } finally {
                this.submitting = false;
                this.selectedAssignment = null;
            }
        },
        formatDateTime(date) {
            if (!date) return 'N/A';
            return moment(date).format('DD/MM/YYYY HH:mm')
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('DD/MM/YYYY');
        },
        getName(lang, item) {
            if (!item) return 'N/A';
            
            // If item is already a string, just return it
            if (typeof item === 'string') return item;
            
            // Case 1: Item is the multilingual array itself
            if (Array.isArray(item)) {
                const nameObj = item.find(n => n.key === lang);
                return nameObj ? nameObj.value : (item[0] ? item[0].value : 'N/A');
            }
            
            // Case 2: Item is an object with a title property
            if (!item.title) return 'N/A';
            if (typeof item.title === 'string') return item.title;
            if (Array.isArray(item.title)) {
                const nameObj = item.title.find(n => n.key === lang);
                return nameObj ? nameObj.value : (item.title[0] ? item.title[0].value : 'N/A');
            }
            return 'N/A';
        },
        isClosed(item) {
            if (this.submission && this.submission.create && this.submission.create.endAt) {
                const parentEnd = moment(this.submission.create.endAt);
                if (parentEnd.isBefore(moment())) {
                    return true;
                }
            }
            return item.create && item.create.endAt && moment(item.create.endAt).isBefore(moment());
        },
        isNotStarted(item) {
            return item.create && item.create.startAt && moment().isBefore(moment(item.create.startAt));
        },
        hasSubmitted(item) {
            if (!item.artworks || !Array.isArray(item.artworks)) return false;
            const currentUserId = this.userId;
            return item.artworks.some(art => {
                const ownerId = art.owner?._id || art.owner;
                return String(ownerId || '') === String(currentUserId || '');
            });
        },
        getAssignmentStatusClass(item) {
            if (this.hasSubmitted(item)) return 'status-open'; // Submitted = Green
            if (this.isClosed(item)) return 'status-closed';  // Not submitted & Closed = Red
            if (this.isNotStarted(item)) return 'status-closed'; // Not started = Red
            return 'status-upcoming'; // In progress = Yellow
        },
        getAssignmentStatusLabel(item, lang = 'en') {
            if (this.hasSubmitted(item)) return lang === 'en' ? 'Submitted' : 'ส่งแล้ว';
            if (this.isClosed(item)) return lang === 'en' ? 'Closed' : 'ปิดแล้ว';
            if (this.isNotStarted(item)) return lang === 'en' ? 'Not Open' : 'ระบบยังไม่เปิด';
            return lang === 'en' ? 'In Progress' : 'กำลังดำเนินการ';
        },
        getAssignmentIcon(item) {
            if (this.isClosed(item)) return 'cilLockLocked';
            if (this.isNotStarted(item)) return 'cilLockLocked';
            if (this.hasSubmitted(item)) return 'cilCheckCircle';
            return 'cilDescription';
        },
        getSubmittedArtwork(assign) {
            if (!assign.artworks || !Array.isArray(assign.artworks)) return null;
            const currentUserId = this.userId;
            return assign.artworks.find(art => {
                const ownerId = art.owner?._id || art.owner;
                return ownerId === currentUserId;
            });
        },
        getApprovalStatusClass(artwork) {
            if (!artwork || !artwork.status) return 'status-upcoming';
            
            // In Submission model, it's artwork.status. In Artwork model, it's artwork.status.approval.
            // We handle both for robustness.
            const approval = (artwork.status && artwork.status.approval) ? artwork.status.approval : artwork.status;
            
            if (!approval) return 'status-upcoming';

            const nameEn = (typeof approval === 'string' ? approval : this.getName('en', approval)).toLowerCase();
            const nameTh = typeof approval === 'string' ? '' : this.getName('th', approval);
            
            // Rejected logic
            if (nameEn.includes('rejected') || nameEn.includes('ไม่อนุมัติ') || nameEn.includes('ไม่ผ่าน') || nameTh.includes('ไม่นุมัติ') || nameTh.includes('ไม่อนุมัติ') || nameTh.includes('ไม่ผ่าน')) {
                return 'status-closed';
            }
            if (nameEn.includes('approved') || nameTh.includes('อนุมัติ') || nameTh.includes('ผ่าน')) {
                return 'status-open';
            }
            // Default to Pending (upcoming/yellow)
            return 'status-upcoming';
        },
        getApprovalStatusLabel(artwork, lang = 'en') {
            if (!artwork || !artwork.status) {
                return lang === 'en' ? 'Pending' : 'รอตรวจสอบ';
            }

            const approval = (artwork.status && artwork.status.approval) ? artwork.status.approval : artwork.status;
            if (!approval) return lang === 'en' ? 'Pending' : 'รอตรวจสอบ';
            
            const label = this.getName(lang, approval);
            
            // If getName returned N/A or is missing translation, provide specific fallbacks
            if (label === 'N/A' || label === 'Pending') {
                return lang === 'en' ? 'Pending' : 'รอตรวจสอบ';
            }
            if (label === 'Approved') return lang === 'en' ? 'Approved' : 'อนุมัติ';
            if (label === 'Rejected') return lang === 'en' ? 'Rejected' : 'ไม่อนุมัติ';
            
            return label;
        },
        getArtistName(owner) {
            if (!owner) return 'N/A';
            if (owner.name) {
                if (typeof owner.name === 'string') return owner.name;
                if (Array.isArray(owner.name)) {
                    const nameObj = owner.name.find(n => n.key === this.$i18n.locale);
                    if (nameObj) return nameObj.value;
                    const fallbackObj = owner.name.find(n => n.key === 'en') || owner.name[0];
                    return fallbackObj ? fallbackObj.value : 'N/A';
                }
            }
            return owner.username || 'N/A';
        }
    }
}
</script>

<style scoped>
.submissions-detail-premium {
    font-family: var(--app-font-family);
    background-color: #f8fafc;
    min-height: 100vh;
}

/* Header & Navigation */
.btn-back-minimal {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-back-minimal:hover {
    background: #f8fafc;
    color: #0f172a;
    border-color: #cbd5e1;
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Assignment Card/Bar */
.assignment-wrapper {
    margin-bottom: 1.5rem;
}

.assignment-bar-item {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 10;
}

.assignment-bar-content {
    min-height: 90px;
    border: 1px solid #e2e8f0;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
}

.assignment-bar-item:hover .assignment-bar-content {
    border-color: #cbd5e1;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02) !important;
    transform: translateY(-2px);
}

.assignment-bar-item.is-expanded .assignment-bar-content {
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-color: #e2e8f0;
    background: #fdfdfd;
}

/* Icons & Labels */
.task-icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #64748b;
    transition: all 0.3s ease;
}

.task-icon-circle.status-open { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); color: #059669; }
.task-icon-circle.status-closed { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); color: #dc2626; }
.task-icon-circle.status-upcoming { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #d97706; }

.text-dark-premium {
    color: #0f172a;
    font-weight: 600;
    letter-spacing: -0.01em;
}

.meta-item-minimal {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
}

/* Status Badges */
.status-pill-flat {
    padding: 6px 16px;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
}

.status-pill-flat.status-open { background: #f0fdf4; color: #16a34a; }
.status-pill-flat.status-closed { background: #fef2f2; color: #dc2626; }
.status-pill-flat.status-upcoming { background: #fffbeb; color: #d97706; }

/* Approval Tags */
.approval-tag {
    display: flex;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 99px;
    letter-spacing: 0.025em;
}

.approval-tag.status-open { background: #dcfce7; color: #166534; }
.approval-tag.status-closed { background: #fee2e2; color: #991b1b; }
.approval-tag.status-upcoming { background: #fef3c7; color: #92400e; }

/* Expanded Panel & Horizontal List */
.artwork-owner-group + .artwork-owner-group {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid #e8e2de;
}

.artwork-group-title {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #622820;
    font-size: .82rem;
    font-weight: 800;
    letter-spacing: .02em;
}

.artwork-group-icon {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #8f2419;
    background: #f9efec;
}

.other-owner-group .artwork-group-title { color: #64748b; }
.other-owner-group .artwork-group-icon { color: #64748b; background: #f1f5f9; }

.expanded-artwork-panel {
    position: relative;
    z-index: 5;
    margin-top: -1px;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid #e2e8f0;
    border-top: none;
}

.artwork-horizontal-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    border-radius: 16px;
    padding: 12px;
    margin-bottom: 8px;
}

.artwork-horizontal-item:hover {
    background: white !important;
    border-color: #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: scale(1.005) translateX(4px);
}

.artwork-row-thumb-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 12px;
    overflow: hidden;
    background: #f1f5f9;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.artwork-img-row {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.artwork-row-thumb-wrap:hover .artwork-img-row {
    transform: scale(1.1);
}

.artwork-row-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 2px;
}

/* Action Buttons */
.btn-submit-now {
    border-radius: 12px;
    padding: 10px 24px;
    font-weight: 600;
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);
    transition: all 0.3s ease;
}

.btn-submit-now:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.3);
}

.btn-icon-minimal-circle {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-icon-minimal-circle:hover {
    background: white;
    color: #0f172a;
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.approval-tag-mini {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 0 14px;
    height: 32px; /* Fixed height to match btn-sm */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 99px;
    letter-spacing: 0.05em;
    white-space: nowrap;
}

.approval-tag-mini.status-open { background: #dcfce7; color: #166534; box-shadow: inset 0 0 0 1px rgba(22, 163, 74, 0.1); }
.approval-tag-mini.status-closed { background: #fee2e2; color: #991b1b; box-shadow: inset 0 0 0 1px rgba(220, 38, 38, 0.1); }
.approval-tag-mini.status-upcoming { background: #fef3c7; color: #92400e; box-shadow: inset 0 0 0 1px rgba(217, 119, 6, 0.1); }

.btn-view-pill {
    background: #f1f5f9;
    color: #475569;
    border-radius: 99px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.btn-view-pill:hover {
    background: #e2e8f0;
    color: #0f172a;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0,0,0,0.05);
}

/* Ensure buttons have same height */
.artwork-horizontal-item .btn-sm {
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Custom Scrollbar for expanded list */
.expanded-artwork-panel {
    max-height: 500px;
    overflow-y: auto;
}

.expanded-artwork-panel::-webkit-scrollbar {
    width: 6px;
}

.expanded-artwork-panel::-webkit-scrollbar-track {
    background: transparent;
}

.expanded-artwork-panel::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.expanded-artwork-panel::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* Animations */
.slide-fade-down-enter-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-down-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-down-enter, .slide-fade-down-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

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
