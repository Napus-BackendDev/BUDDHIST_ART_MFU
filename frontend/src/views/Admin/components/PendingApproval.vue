<template>
    <CCard class="pending-card mb-4 mt-2">
        <CCardHeader class="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h4 class="card-title mb-0">Pending Approval</h4>
            <a href="#" class="view-all-link">View All</a>
        </CCardHeader>
        <CCardBody>
            <div class="scrollable-list" v-if="stats.latestPending && stats.latestPending.length > 0">
                <div v-for="(item, index) in stats.latestPending" :key="index" class="pending-item">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="image-wrapper">
                            <img v-if="item.image" :src="item.image" class="item-img" alt="Artwork">
                            <div v-else class="image-placeholder"></div>
                        </div>
                        <div class="ml-3">
                            <div class="item-title">{{ getName('en', item.title) }}</div>
                            <div class="item-subtitle">{{ item.artist ? getName('en', item.artist.name) : 'Unknown' }} &bull; {{ formatTimeAgo(item.createdAt) }}</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <CButton color="transparent" class="btn-icon p-1 text-success" @click="onApprove(item)">
                            <CIcon name="cil-check-circle" size="lg" />
                        </CButton>
                        <CButton color="transparent" class="btn-icon p-1 text-danger ml-2" @click="onReject(item)">
                            <CIcon name="cil-x-circle" size="lg" />
                        </CButton>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-muted">
                No pending approvals
            </div>
        </CCardBody>
    </CCard>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

export default {
    name: 'PendingApproval',
    computed: {
        ...mapState('dashboard', ['stats', 'loading'])
    },
    methods: {
        formatTimeAgo(date) {
            return moment(date).fromNow();
        },
        getName(lang, obj) {
            if (Array.isArray(obj)) {
                return obj.find(i => i.key === lang)?.value || obj[0]?.value || 'N/A';
            }
            return obj || 'N/A';
        },
        async onApprove(item) {
            if (confirm(`Are you sure you want to approve "${this.getName('en', item.title)}"?`)) {
                try {
                    await this.$store.dispatch('dashboard/approveArtwork', item);
                    alert('Artwork approved successfully!');
                } catch (err) {
                    console.error('Approval Error:', err);
                    alert('Failed to approve artwork.');
                }
            }
        },
        onReject(item) {
            // Navigate to the related submission page
            this.$router.push({
                name: 'SubmissionsDetail',
                params: { id: item.submissionId },
                query: { highlight: item._id }
            });
        }
    }
}
</script>

<style scoped>
.pending-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    height: 100%;
    margin-bottom: 1rem;
}

.card-title {
    font-weight: 700;
    color: #172b4d;
    font-size: 1.35rem;
}

.view-all-link {
    color: #eb6161;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
}

.view-all-link:hover {
    text-decoration: underline;
}


/* Using simple text arrows for scroll arrows, but styling track is enough usually */

.pending-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: #f8f9fa;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.pending-item:last-child {
    margin-bottom: 0;
}

.pending-item:hover {
    background-color: #f1f3f5;
}

.image-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
}

.item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    background-color: #e2e4e8;
}

.item-title {
    font-weight: 700;
    color: #172b4d;
    font-size: 1.05rem;
    margin-bottom: 0.15rem;
}

.item-subtitle {
    color: #8c98a9;
    font-size: 0.85rem;
    font-weight: 500;
}

.action-buttons {
    display: flex;
    align-items: center;
}

.btn-icon {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.text-success {
    color: #2e8b57 !important;
    /* using a slightly deeper green */
}

.text-danger {
    color: #dc3545 !important;
}
</style>
