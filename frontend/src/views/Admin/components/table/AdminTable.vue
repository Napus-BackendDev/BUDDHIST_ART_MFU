<template>
    <CRow>
            <CCol md="12">
    <CCard class="artwork-table-card mb-4">
        <div>
            <CDataTable 
                :items="filteredItems" 
                :fields="fields" 
                :no-items-view="{ noItems: $i18n.locale === 'en' ? 'No artworks found' : 'ไม่พบผลงานศิลปะ', noResults: $i18n.locale === 'en' ? 'No matching artworks' : 'ไม่พบผลงานที่ตรงกับการค้นหา' }"
                class="custom-table mb-0" 
                hover 
                :border="false"
                :striped="false"
                :items-per-page="itemsPerPage"
                :active-page="activePage"
                @page-change="pageChange"
            >
                <template #thumbnail="{ item }">
                    <td>
                        <div
                            class="thumbnail-wrapper clickable"
                            role="button"
                            tabindex="0"
                            :aria-label="$i18n.locale === 'en' ? `View ${getName($i18n.locale, item)} image` : `ดูภาพ ${getName($i18n.locale, item)}`"
                            @click="zoomImg(item)"
                            @keydown.enter="zoomImg(item)"
                            @keydown.space.prevent="zoomImg(item)"
                        >
                            <img :src="artworkImageUrl(item) || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName($i18n.locale, item).charAt(0)}`"
                                :alt="getName($i18n.locale, item)" class="thumbnail-img">
                             <div class="zoom-overlay">
                                <CIcon name="cil-search" />
                             </div>
                        </div>
                    </td>
                </template>
                <template #title="{ item }">
                    <td>
                        <div class="font-weight-bold text-dark">{{ getName($i18n.locale, item) || getName('en', item) }}</div>
                        <div class="text-muted small mt-1" v-if="item.artworkCode">{{ item.artworkCode }}</div>
                    </td>
                </template>
                <template #artist="{ item }">
                    <td class="text-muted">
                        <div class="artist-name">{{ item.artist ? getName($i18n.locale, item.artist) || getName('en', item.artist) : 'N/A' }}</div>
                        <div v-if="item.artist && item.artist.studentId" class="artist-id mt-1">ID: {{ item.artist.studentId }}</div>
                    </td>
                </template>
                <template #updatedAt="{ item }">
                    <td class="text-muted text-sm">
                        <div>{{ formatDate(item.updatedAt) }}</div>
                        <div class="small mt-1">{{ formatTime(item.updatedAt) }}</div>
                    </td>
                </template>
                <template #category="{ item }">
                    <td>
                        <span class="category-pill">{{ item.category ? getName($i18n.locale, item.category) || getName('en', item.category) : 'N/A' }}</span>
                    </td>
                </template>
                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', getStatusBadge(item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending').class]">
                            <CIcon :name="getStatusBadge(item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending').icon" size="sm" class="status-icon" /> 
                            {{ getStatusBadge(item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending').label }}
                        </div>
                    </td>
                </template>
                <template #storage="{ item }">
                    <td>
                        <div class="storage-cell">
                            <div class="storage-main-row">
                                <span class="storage-name">{{ item.storage ? (getName($i18n.locale, item.storage) || getName('en', item.storage)) : '-' }}</span>
                                <span v-if="isUniversityStorage(item.storage) && !item.storageDetail" class="storage-warning" v-c-tooltip="$i18n.locale === 'en' ? 'Exact location required' : 'กรุณาระบุตำแหน่งจัดเก็บจริง'">!</span>
                                <button v-if="isUniversityStorage(item.storage)" type="button" class="storage-edit-btn" @click="onEdit(item)" :aria-label="$i18n.locale === 'en' ? 'Edit exact location' : 'แก้ไขตำแหน่งจัดเก็บจริง'" v-c-tooltip="$i18n.locale === 'en' ? 'Edit exact location' : 'แก้ไขตำแหน่งจัดเก็บจริง'">
                                    <CIcon name="cil-pencil" size="sm" />
                                </button>
                            </div>
                            <small v-if="item.storageDetail" class="storage-detail">{{ item.storageDetail }}</small>
                        </div>
                    </td>
                </template>
                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="(item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending') === 'Pending' || (item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending') === 'Revised'" class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                :aria-label="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'"
                                @click="onView(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-edit ml-2" 
                                :aria-label="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'"
                                @click="onEdit(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-success mx-2" 
                                :disabled="loadingItems.includes(item._id)"
                                :aria-label="loadingItems.includes(item._id) ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังประมวลผล...') : ($i18n.locale === 'en' ? 'Approve' : 'อนุมัติ')" v-c-tooltip="loadingItems.includes(item._id) ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังประมวลผล...') : ($i18n.locale === 'en' ? 'Approve' : 'อนุมัติ')"
                                @click="onApprove(item)"
                            >
                                <CIcon v-if="loadingActions[item._id] === 'Approved'" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-check" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-danger" 
                                :disabled="loadingItems.includes(item._id)"
                                :aria-label="loadingItems.includes(item._id) ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังประมวลผล...') : ($i18n.locale === 'en' ? 'Reject' : 'ปฏิเสธ')" v-c-tooltip="loadingItems.includes(item._id) ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังประมวลผล...') : ($i18n.locale === 'en' ? 'Reject' : 'ปฏิเสธ')"
                                @click="onReject(item)"
                            >
                                <CIcon v-if="loadingActions[item._id] === 'Rejected'" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-x" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                :aria-label="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" v-c-tooltip="$i18n.locale === 'en' ? 'Delete' : 'ลบ'"
                                @click="onDelete(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                        <div v-else class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                :aria-label="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'"
                                @click="onView(item)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button v-if="approvalStatus(item) === 'Approved'" class="action-btn icon-edit ml-2" :aria-label="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="onEdit(item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                :aria-label="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" v-c-tooltip="$i18n.locale === 'en' ? 'Delete' : 'ลบ'"
                                @click="onDelete(item)"
                            >
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <TablePaginationFooter :total="filteredItems.length" :active-page.sync="activePage" :items-per-page.sync="itemsPerPage" :show-page-size="false" noun-en="artworks" noun-th="ผลงาน" />
    </CCard>

        <!-- Artwork Image Viewer: same immersive style as public artwork detail -->
        <div
            v-if="showZoomModal"
            class="artwork-lightbox"
            role="dialog"
            aria-modal="true"
            :aria-label="$i18n.locale === 'en' ? 'Artwork image viewer' : 'ตัวดูภาพผลงานศิลปะ'"
            tabindex="-1"
            @click="closeZoom"
            @keydown.esc="closeZoom"
        >
            <div class="artwork-lightbox-content" @click.stop>
                <img
                    :src="zoomImageUrl"
                    class="artwork-lightbox-image"
                    :alt="zoomArtwork ? getName($i18n.locale, zoomArtwork) : ($i18n.locale === 'en' ? 'Artwork preview' : 'ตัวอย่างผลงานศิลปะ')"
                >
                <div v-if="zoomArtwork" class="artwork-lightbox-caption text-center">
                    <h4 class="artwork-lightbox-title">{{ getName($i18n.locale, zoomArtwork) || getName('en', zoomArtwork) }}</h4>
                    <p class="artwork-lightbox-artist">
                        {{ zoomArtwork.artist ? (getName($i18n.locale, zoomArtwork.artist) || getName('en', zoomArtwork.artist)) : ($i18n.locale === 'en' ? 'Artist' : 'ศิลปิน') }}
                    </p>
                </div>
                <button
                    ref="zoomCloseButton"
                    type="button"
                    class="artwork-lightbox-close"
                    :aria-label="$i18n.locale === 'en' ? 'Close artwork viewer' : 'ปิดตัวดูภาพผลงานศิลปะ'"
                    @click="closeZoom"
                >
                    <CIcon name="cilX" size="xl" aria-hidden="true" />
                </button>
            </div>
        </div>
        </CCol>
    </CRow>
</template>

<script>
import moment from 'moment';
import { artworkImageUrl } from '@/utils/submissionArtworkImport';
import * as XLSX from 'xlsx';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import TablePaginationFooter from './TablePaginationFooter.vue';

export default {
    name: 'AdminTable',
    components: { TablePaginationFooter },
    mixins: [statusBadgeMixin],
    props: {
        items: {
            type: Array,
            default: () => []
        },
        filters: {
            type: Object,
            default: () => ({
                search: '',
                category: 'All Categories',
                status: 'All Status'
            })
        },
        loadingItems: {
            type: Array,
            default: () => []
        },
        // id -> 'Approved' | 'Rejected': which action is running, so only that button spins.
        loadingActions: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            showZoomModal: false,
            zoomImageUrl: '',
            zoomArtwork: null,
            zoomTriggerElement: null,
            activePage: 1,
            itemsPerPage: 10
        }
    },
    watch: {
        filters: {
            handler() {
                this.activePage = 1;
            },
            deep: true
        },
        showZoomModal(isVisible) {
            this.setBodyScrollLock(isVisible);

            if (isVisible) {
                this.$nextTick(() => {
                    if (this.$refs.zoomCloseButton) this.$refs.zoomCloseButton.focus();
                });
            } else if (this.zoomTriggerElement && typeof this.zoomTriggerElement.focus === 'function') {
                this.zoomTriggerElement.focus();
                this.zoomTriggerElement = null;
            }
        }
    },
    computed: {
        fields() {
            return [
                { key: 'thumbnail', label: this.$i18n.locale === 'en' ? 'THUMBNAIL' : 'รูปภาพตัวอย่าง', _classes: 'border-top-0 border-bottom' },
                { key: 'title', label: this.$i18n.locale === 'en' ? 'ARTWORK TITLE' : 'ชื่อผลงานศิลปะ', _classes: 'border-top-0 border-bottom' },
                { key: 'artist', label: this.$i18n.locale === 'en' ? 'ARTIST' : 'ศิลปิน', _classes: 'border-top-0 border-bottom' },
                { key: 'updatedAt', label: this.$i18n.locale === 'en' ? 'LAST UPDATED' : 'อัปเดตล่าสุด', _classes: 'border-top-0 border-bottom' },
                { key: 'category', label: this.$i18n.locale === 'en' ? 'CATEGORY' : 'หมวดหมู่', _classes: 'border-top-0 border-bottom' },
                { key: 'storage', label: this.$i18n.locale === 'en' ? 'STORAGE' : 'สถานที่จัดเก็บ', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },
        filteredItems() {
            const list = this.items.filter(item => {
                const titleEn = this.getName('en', item).toLowerCase();
                const titleTh = this.getName('th', item).toLowerCase();
                const artistEn = (item.artist ? this.getName('en', item.artist) : '').toLowerCase();
                const artistTh = (item.artist ? this.getName('th', item.artist) : '').toLowerCase();
                
                // Search Filter
                const search = this.filters.search.toLowerCase();
                const searchMatch = !this.filters.search || 
                    titleEn.includes(search) ||
                    titleTh.includes(search) ||
                    artistEn.includes(search) ||
                    artistTh.includes(search);

                // Category Filter
                const categoryId = item.category && (item.category._id || item.category);
                const categoryMatch = this.filters.category === 'All Categories' || String(categoryId) === String(this.filters.category);

                // Status Filter
                const rawStatusEn = item.status && item.status.approval ? this.getName('en', item.status.approval) : 'Pending';
                const statusMatch = this.filters.status === 'All Status' || rawStatusEn === this.filters.status;

                // Date Filter
                let dateMatch = true;
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = moment(item.createdAt);
                    if (this.filters.startDate) {
                        dateMatch = dateMatch && itemDate.isSameOrAfter(moment(this.filters.startDate).startOf('day'));
                    }
                    if (this.filters.endDate) {
                        dateMatch = dateMatch && itemDate.isSameOrBefore(moment(this.filters.endDate).endOf('day'));
                    }
                }

                return searchMatch && categoryMatch && statusMatch && dateMatch;
            });
            return list.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
        }
    },
    methods: {
        artworkImageUrl,
        approvalStatus(item) {
            return item.status && item.status.approval ? this.getName('en', item.status.approval) : 'Pending';
        },
        isUniversityStorage(storage) {
            if (!storage) return false;
            const name = `${this.getName('en', storage)} ${this.getName('th', storage)}`.toLowerCase();
            return name.includes('university') || name.includes('mfu') || name.includes('มหาวิทยาลัย');
        },
        onView(item) {
            this.$emit('view', item);
        },
        zoomImg(item) {
            if (!item || !item.image) return;
            this.zoomTriggerElement = document.activeElement;
            this.zoomImageUrl = artworkImageUrl(item);
            this.zoomArtwork = item;
            this.showZoomModal = true;
        },
        closeZoom() {
            this.showZoomModal = false;
        },
        setBodyScrollLock(isLocked) {
            if (typeof document === 'undefined') return;
            document.body.style.overflow = isLocked ? 'hidden' : '';
        },
        onApprove(item) {
            this.$emit('approve', item);
        },
        onReject(item) {
            this.$emit('reject', item);
        },
        onEdit(item) {
            this.$emit('edit', item);
        },
        onDelete(item) {
            const title = this.getName(this.$i18n.locale, item) || this.getName('en', item);
            const confirmMsg = this.$i18n.locale === 'en' 
                ? `Are you sure you want to delete "${title}"? This action cannot be undone.`
                : `คุณแน่ใจหรือไม่ว่าต้องการลบ "${title}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`;
            if (confirm(confirmMsg)) {
                this.$emit('delete', item);
            }
        },
        pageChange(val) {
            this.activePage = val;
        },
        exportExcel() {
            const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;

            const headers = [
                'Artwork Code', 'Artwork Image', 'Title (TH)', 'Title (EN)', 
                'Artist Name', 'Artist ID', 'Category', 
                'Technique (TH)', 'Technique (EN)', 
                'Size (TH)', 'Size (EN)', 'Price', 
                'Approval Status', 'Sale Status', 'Storage Location', 'Created At'
            ];

            const data = this.filteredItems.map(item => {
                const artworkUrl = item.image ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`) : null;
                
                // Status Helpers
                const approvalStatus = this.getStatusBadge(item.status && item.status.approval ? this.getName('en', item.status.approval) : 'Pending').label;
                const saleStatus = item.status && item.status.sale ? this.getName(this.$i18n.locale, item.status.sale) : (this.$i18n.locale === 'en' ? 'N/A' : 'ไม่มี');

                return [
                    item.artworkCode || '-',
                    // Link column
                    artworkUrl ? { t: 's', v: 'View Image', l: { Target: artworkUrl } } : 'No Image',
                    this.getName('th', item),
                    this.getName('en', item),
                    item.artist ? this.getName('en', item.artist) : 'N/A',
                    item.artist ? (item.artist.studentId || 'N/A') : 'N/A',
                    item.category ? this.getName('en', item.category) : 'N/A',
                    item.technique ? this.getName('th', item.technique) : 'N/A',
                    item.technique ? this.getName('en', item.technique) : 'N/A',
                    item.size ? this.getName('th', item.size) : 'N/A',
                    item.size ? this.getName('en', item.size) : 'N/A',
                    item.price || 0,
                    approvalStatus,
                    saleStatus,
                    item.storage ? this.getName(this.$i18n.locale, item.storage) : '-',
                    this.formatDate(item.createdAt)
                ];
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Artworks');
            XLSX.writeFile(wb, `Artworks_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        }
    },
    beforeDestroy() {
        this.setBodyScrollLock(false);
    }
}
</script>

<style scoped>
/* Immersive artwork viewer */
.artwork-lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 4.5rem 1rem 4rem;
    background: rgba(0, 0, 0, 0.97);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: artworkLightboxFadeIn 0.3s ease;
}

@keyframes artworkLightboxFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.artwork-lightbox-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(94vw, 1500px);
    max-width: 100%;
}

.artwork-lightbox-image {
    display: block;
    width: auto;
    max-width: 94vw;
    max-height: 82vh;
    max-height: calc(100dvh - 10rem);
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

.artwork-lightbox-caption {
    width: min(92vw, 720px);
    margin-top: 1.25rem;
    color: #ffffff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.artwork-lightbox-title {
    margin: 0;
    color: #ffffff;
    font-size: clamp(1.25rem, 2vw, 1.65rem);
    font-weight: 700;
    line-height: 1.3;
}

.artwork-lightbox-artist {
    margin: 0.35rem 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 1rem;
    line-height: 1.5;
}

.artwork-lightbox-close {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.artwork-lightbox-close:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.16);
    transform: rotate(90deg) scale(1.05);
}

.artwork-lightbox-close:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.92);
    outline-offset: 3px;
}

@media (max-width: 767px) {
    .artwork-lightbox {
        padding: 4.5rem 0.75rem 5rem;
    }

    .artwork-lightbox-image {
        max-width: 96vw;
        max-height: 76vh;
        max-height: calc(100dvh - 11rem);
        border-radius: 6px;
    }

    .artwork-lightbox-close {
        top: 0.75rem;
        right: 0.75rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .artwork-lightbox,
    .artwork-lightbox-close,
    .thumbnail-img,
    .zoom-overlay {
        animation: none;
        transition: none;
    }
}

.thumbnail-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    background-color: #f8f9fa;
    border: 1px solid #eef0f3;
}

.thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.clickable {
    cursor: pointer;
    position: relative;
}

.clickable:focus-visible {
    outline: 3px solid rgba(74, 29, 24, 0.35);
    outline-offset: 3px;
}

.clickable:hover .thumbnail-img {
    transform: scale(1.1);
}

.zoom-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
}

.clickable:hover .zoom-overlay {
    opacity: 1;
}

.artist-name {
    color: #4a5568;
    font-weight: 600;
}

.artist-id {
    font-size: 0.75rem;
    color: #718096;
    letter-spacing: 0.2px;
}

.artwork-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-top: 1rem;
}
.storage-cell { display:flex; flex-direction:column; align-items:flex-start; gap:5px; min-width:150px; }
.storage-main-row { display:flex; align-items:center; flex-wrap:wrap; gap:7px; max-width:100%; }
.storage-name { min-width:0; color:#172b4d; font-weight:600; line-height:1.35; }
.storage-detail { display:block; color:#64748b; line-height:1.35; }
.storage-warning { width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:#fff; background:#dc2626; font-weight:800; }
.storage-edit-btn { flex:0 0 30px; width:30px; height:30px; border:1px solid #dfd6d1; border-radius:8px; color:#8f2419; background:#fff; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; }
.storage-edit-btn:hover { background:#f9efec; border-color:#8f2419; box-shadow:0 4px 10px rgba(143,36,25,0.12); }
.storage-edit-btn:focus-visible { outline:3px solid rgba(143,36,25,0.25); outline-offset:2px; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
