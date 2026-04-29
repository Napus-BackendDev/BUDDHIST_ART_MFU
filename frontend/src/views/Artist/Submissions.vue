<template>
  <div class="artist-submissions-list mt-2">
    <div v-if="submissions && submissions.length > 0">
      <div 
        v-for="(item, index) in submissions" 
        :key="item._id" 
        class="submission-bar-item mb-3 animate-up"
        :style="{ animationDelay: (index * 0.05) + 's' }"
        @click="handleView(item)"
      >
        <div class="submission-bar-content shadow-premium-sm rounded-xl bg-white border-0 overflow-hidden d-flex align-items-center">
          <!-- Left accent strip -->
          <div class="status-accent" :class="getStatusClass(item)"></div>
          
          <div class="p-3 px-md-4 w-100 d-flex align-items-center justify-content-between flex-wrap">
            <!-- Left Info Side -->
            <div class="d-flex align-items-center flex-grow-1 mr-4 py-2" style="min-width: 250px;">
              <div class="icon-container-minimal mr-3 d-none d-sm-flex" :class="getStatusClass(item)">
                <CIcon :name="getStatusIcon(item)" size="lg" />
              </div>
              <div class="title-details">
                <h5 class="mb-1 font-weight-bold text-dark-premium text-truncate">{{ getName($i18n.locale, item) }}</h5>
                <div class="d-flex align-items-center flex-wrap">
                  <div class="meta-item-minimal mr-3">
                    <CIcon name="cil-calendar" class="mr-1 opacity-6" size="sm" />
                    <span>{{ $i18n.locale === 'en' ? 'Due' : 'กำหนดส่ง' }}: {{ formatDate(item.create.endAt) }}</span>
                  </div>
                  <div class="meta-item-minimal">
                    <CIcon name="cil-description" class="mr-1 opacity-6" size="sm" />
                    <span class="font-weight-bold">{{ getAssignmentCount(item) }}</span>
                    <span class="ml-1">{{ $i18n.locale === 'en' ? 'Assignments' : 'งานที่มอบหมาย' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Status/Progress Side -->
            <div class="d-flex align-items-center py-2 flex-wrap ml-auto">
              <!-- Progress Indicator -->
              <div class="progress-wrapper-minimal mr-md-5 mr-3 d-none d-lg-block" style="width: 140px;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="text-muted-xs font-weight-bold uppercase">{{ $i18n.locale === 'en' ? 'Progress' : 'ความคืบหน้า' }}</span>
                  <span class="font-weight-bold text-dark-premium small">{{ calculateProgress(item) }}%</span>
                </div>
                <CProgress 
                  :value="calculateProgress(item)" 
                  :color="getProgressColor(calculateProgress(item))" 
                  height="5px" 
                  class="progress-minimal-bar" 
                />
              </div>

              <!-- Status Pill -->
              <div class="status-container-minimal mr-md-4 mr-2">
                <div :class="['status-pill-flat', getStatusClass(item)]">
                  <div class="status-dot mr-2"></div>
                  {{ getStatusLabel(item, $i18n.locale) }}
                </div>
              </div>

              <!-- Action Link -->
              <div class="action-container-minimal ml-md-2">
                <div class="btn-circle-action shadow-sm">
                  <CIcon name="cil-chevron-right" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state-list-modern text-center py-5 rounded-xl">
      <div class="empty-art mb-4">
        <div class="empty-icon-ring">
          <CIcon name="cil-list" size="2xl" class="text-muted-light" />
        </div>
      </div>
      <h5 class="font-weight-bold text-dark-premium mb-2">{{ $i18n.locale === 'en' ? 'No Submissions Found' : 'ไม่พบรายการมอบหมายงาน' }}</h5>
      <p class="text-muted small mx-auto" style="max-width: 250px;">
        {{ $i18n.locale === 'en' ? "You don't have any artwork submissions assigned to you yet." : "คุณยังไม่มีรายการส่งผลงานศิลปะที่ได้รับมอบหมาย" }}
      </p>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
    name: 'ArtistSubmissions',
    computed: {
        ...mapGetters({
            submissions: 'submission/submissions'
        })
    },
    created() {
        this.fetchSubmissions();
    },
    methods: {
        fetchSubmissions() {
            const userId = this.$store.getters['auth/userId'];
            this.$store.dispatch('submission/get', { artist: userId });
        },
        handleView(item) {
            this.$emit('view-detail', item._id);
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY')
        },
        getProgressColor(progress) {
            if (progress === 100) return 'success'
            if (progress > 70) return 'info'
            if (progress > 30) return 'warning'
            return 'danger'
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
        getAssignmentCount(item) {
            return item.assignments ? item.assignments.length : 0;
        },
        calculateProgress(item) {
            if (!item.assignments || item.assignments.length === 0 || !item.artist || item.artist.length === 0) return 0;
            const totalPossible = item.assignments.length * item.artist.length;
            let totalSubmitted = 0;
            item.assignments.forEach(assign => {
                totalSubmitted += assign.artworks ? assign.artworks.length : 0;
            });
            return Math.round((totalSubmitted / totalPossible) * 100);
        },
        getStatusLabel(item, lang = 'en') {
            if (!item.create || !item.create.startAt || !item.create.endAt) return lang === 'en' ? 'N/A' : 'ไม่มีข้อมูล';
            const now = moment();
            const start = moment(item.create.startAt);
            const end = moment(item.create.endAt);

            if (now.isBefore(start)) return lang === 'en' ? 'Upcoming' : 'เร็วๆนี้';
            if (now.isBetween(start, end)) return lang === 'en' ? 'Open' : 'เปิดรับ';
            return lang === 'en' ? 'Closed' : 'ปิดแล้ว';
        },
        getStatusClass(item) {
            const status = this.getStatusLabel(item, 'en').toLowerCase().replace('/', '');
            return `status-${status}`;
        },
        getStatusIcon(item) {
            const status = this.getStatusLabel(item, 'en');
            if (status === 'Open') return 'cilLockUnlocked';
            if (status === 'Closed') return 'cilLockLocked';
            return 'cilHistory';
        }
    }
}
</script>

<style scoped>
.artist-submissions-list {
    perspective: 1000px;
}

.submission-bar-item {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submission-bar-item:hover {
    transform: translateX(8px);
}

.submission-bar-content {
    position: relative;
    border: 1px solid #f1f5f9;
    min-height: 80px;
}

.submission-bar-item:hover .submission-bar-content {
    border-color: #e2e8f0;
    box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.08) !important;
}

.status-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: #e2e8f0;
}

.status-accent.status-open { background: #10b981; }
.status-accent.status-closed { background: #ef4444; }
.status-accent.status-upcoming { background: #f59e0b; }

.icon-container-minimal {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #94a3b8;
    transition: all 0.3s ease;
}

.icon-container-minimal.status-open { background: #ecfdf5; color: #10b981; }
.icon-container-minimal.status-closed { background: #fef2f2; color: #ef4444; }
.icon-container-minimal.status-upcoming { background: #fffbeb; color: #f59e0b; }

.text-dark-premium { color: #1e293b; }

.meta-item-minimal {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
}

.opacity-6 { opacity: 0.6; }

.text-muted-xs {
    font-size: 0.65rem;
    color: #94a3b8;
    letter-spacing: 0.05em;
}

.progress-minimal-bar {
    border-radius: 4px;
    background-color: #f1f5f9;
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

.btn-circle-action {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    transition: all 0.3s ease;
}

.submission-bar-item:hover .btn-circle-action {
    background: #8b5cf6;
    color: white;
    transform: scale(1.1);
}

.empty-state-list-modern {
    background: #fcfcfc;
    border: 2px dashed #f1f5f9;
}

.empty-icon-ring {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 4px solid #f8fafc;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.animate-up {
    animation: fadeInUp 0.4s ease-out both;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}

.shadow-premium-sm {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
}

.uppercase { text-transform: uppercase; }

.rounded-xl {
    border-radius: 20px !important;
}
</style>
