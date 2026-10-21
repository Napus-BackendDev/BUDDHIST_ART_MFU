<template>
    <CCard class="pending-card mb-4 mt-2">
        <CCardHeader class="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h4 class="card-title mb-0">{{ $i18n.locale === 'en' ? 'Pending Approval' : 'รอการอนุมัติ' }}</h4>
            <router-link to="/admin/artworks" class="view-all-link">{{ $i18n.locale === 'en' ? 'View All' : 'ดูทั้งหมด' }}</router-link>
        </CCardHeader>
        <CCardBody>
            <div v-if="actionError" class="alert alert-danger" role="alert">
                {{ actionError }}
                <button type="button" class="btn btn-link p-0 ml-2" @click="actionError = ''">{{ $i18n.locale === 'en' ? 'Dismiss' : 'ปิดข้อความ' }}</button>
            </div>
            <div class="scrollable-list">
                <div v-if="!pendingArtworks || pendingArtworks.length === 0" class="text-center text-muted mt-4">
                    {{ $i18n.locale === 'en' ? 'No pending artworks.' : 'ไม่มีผลงานที่รออนุมัติ' }}
                </div>
                <div v-for="item in pendingArtworks" :key="item._id" class="pending-item">
                    <div class="d-flex align-items-center flex-grow-1">
                        <img v-if="item.image" :src="item.image" class="image-placeholder" style="object-fit: cover;" alt="Artwork" />
                        <div v-else class="image-placeholder"></div>
                        <div class="ml-3">
                            <div class="item-title">{{ getName($i18n.locale, item.title) || ($i18n.locale === 'en' ? 'Untitled' : 'ไม่มีชื่อ') }}</div>
                            <div class="item-subtitle">{{ getName($i18n.locale, item.artist) || ($i18n.locale === 'en' ? 'Unknown Artist' : 'ไม่ระบุศิลปิน') }} &bull; {{ formatDate(item.createdAt) }}</div>
                        </div>
                    </div>
                    <div class="action-buttons d-flex align-items-center">
                        <CButton :aria-label="($i18n.locale === 'en' ? 'View artwork: ' : 'ดูผลงาน: ') + (getName($i18n.locale, item.title) || ($i18n.locale === 'en' ? 'Untitled' : 'ไม่มีชื่อ'))" @click="goToArtwork(item)" color="transparent" class="btn-icon p-1 text-info mr-1" v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'">
                            <CIcon name="cilMagnifyingGlass" size="lg" />
                        </CButton>
                        <CButton :aria-label="($i18n.locale === 'en' ? 'Approve artwork: ' : 'อนุมัติผลงาน: ') + (getName($i18n.locale, item.title) || ($i18n.locale === 'en' ? 'Untitled' : 'ไม่มีชื่อ'))" @click="handleApprove(item)" color="transparent" class="btn-icon p-1 text-success mr-1" v-c-tooltip="$i18n.locale === 'en' ? 'Approve' : 'อนุมัติ'">
                            <CIcon name="cil-check" size="lg" />
                        </CButton>
                        <CButton :aria-label="($i18n.locale === 'en' ? 'Reject artwork: ' : 'ปฏิเสธผลงาน: ') + (getName($i18n.locale, item.title) || ($i18n.locale === 'en' ? 'Untitled' : 'ไม่มีชื่อ'))" @click="handleReject(item)" color="transparent" class="btn-icon p-1 text-danger" v-c-tooltip="$i18n.locale === 'en' ? 'Reject' : 'ปฏิเสธ'">
                            <CIcon name="cil-x" size="lg" />
                        </CButton>
                    </div>
                </div>
            </div>
        </CCardBody>
    </CCard>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';

export default {
    name: 'PendingApproval',
    data() { return { actionError: '' }; },
    computed: {
        ...mapState('dashboard', ['stats']),
        pendingArtworks() {
            return this.stats && this.stats.pendingArtworks ? this.stats.pendingArtworks : [];
        }
    },
    methods: {
        getName(lang, obj) {
            if (!obj) return '';
            const title = obj.title || obj.name || obj;
            if (Array.isArray(title)) {
                const found = title.find(t => t.key === lang);
                return found ? found.value : (title[0] ? title[0].value : '');
            }
            return typeof title === 'string' ? title : '';
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            return moment(dateStr).fromNow();
        },
        goToArtwork(item) {
            const title = this.getName('en', item.title) || this.getName('th', item.title) || '';
            this.$router.push({ path: '/admin/artworks', query: { search: title } });
        },
        async handleApprove(artwork) {
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to approve "${this.getName('en', artwork.title) || this.getName('th', artwork.title)}"?`
                : `คุณแน่ใจหรือไม่ว่าต้องการอนุมัติผลงาน "${this.getName('th', artwork.title) || this.getName('en', artwork.title)}"?`;
            if (!confirm(confirmMsg)) return;
            this.actionError = '';

            try {
                this.$store.commit("dialog/loading", true);
                let statuses = this.$store.getters['setting/status/item'] || [];
                if (statuses.length === 0) {
                    await this.$store.dispatch('setting/status/get');
                    statuses = this.$store.getters['setting/status/item'] || [];
                }
                const approvedStatus = statuses.find(s => s.code === 'APPROVED') || statuses.find(s => {
                    const enVal = (s.title && s.title.find(t => t.key === 'en')?.value) || '';
                    return enVal.toLowerCase() === 'approved';
                });
                
                if (!approvedStatus) {
                    throw new Error("Approved status not found");
                }

                await this.$store.dispatch('artwork/update', {
                    _id: artwork._id,
                    status: {
                        ...artwork.status,
                        approval: approvedStatus._id
                    }
                });

                // Refresh dashboard stats
                await this.$store.dispatch('dashboard/getStats');
                
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'Artwork approved successfully.' : 'อนุมัติผลงานศิลปะเรียบร้อยแล้ว',
                    variant: 'success'
                });
            } catch (err) {
                this.actionError = this.getName(this.$i18n.locale, err && err.response && err.response.data && err.response.data.message) ||
                    (this.$i18n.locale === 'en' ? 'Unable to approve artwork. Please try again.' : 'ไม่สามารถอนุมัติผลงานได้ กรุณาลองใหม่');
            } finally {
                this.$store.commit("dialog/loading", false);
            }
        },
        async handleReject(artwork) {
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to reject "${this.getName('en', artwork.title) || this.getName('th', artwork.title)}"?`
                : `คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธผลงาน "${this.getName('th', artwork.title) || this.getName('en', artwork.title)}"?`;
            if (!confirm(confirmMsg)) return;
            this.actionError = '';

            try {
                this.$store.commit("dialog/loading", true);
                let statuses = this.$store.getters['setting/status/item'] || [];
                if (statuses.length === 0) {
                    await this.$store.dispatch('setting/status/get');
                    statuses = this.$store.getters['setting/status/item'] || [];
                }
                const rejectedStatus = statuses.find(s => s.code === 'REJECTED') || statuses.find(s => {
                    const enVal = (s.title && s.title.find(t => t.key === 'en')?.value) || '';
                    return enVal.toLowerCase() === 'rejected';
                });
                
                if (!rejectedStatus) {
                    throw new Error("Rejected status not found");
                }

                await this.$store.dispatch('artwork/update', {
                    _id: artwork._id,
                    status: {
                        ...artwork.status,
                        approval: rejectedStatus._id
                    }
                });

                // Refresh dashboard stats
                await this.$store.dispatch('dashboard/getStats');

                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'Artwork rejected successfully.' : 'ปฏิเสธผลงานศิลปะเรียบร้อยแล้ว',
                    variant: 'success'
                });
            } catch (err) {
                this.actionError = this.getName(this.$i18n.locale, err && err.response && err.response.data && err.response.data.message) ||
                    (this.$i18n.locale === 'en' ? 'Unable to reject artwork. Please try again.' : 'ไม่สามารถปฏิเสธผลงานได้ กรุณาลองใหม่');
            } finally {
                this.$store.commit("dialog/loading", false);
            }
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

.image-placeholder {
    width: 48px;
    height: 48px;
    background-color: #e2e4e8;
    border-radius: 10px;
    flex-shrink: 0;
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
