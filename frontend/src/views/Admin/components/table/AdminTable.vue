<template>
    <CRow>
            <CCol md="12">
    <CCard class="artwork-table-card mb-4">
        <div>
            <CDataTable 
                :items="filteredItems" 
                :fields="fields" 
                class="custom-table mb-0" 
                hover 
                :border="false"
                :striped="false"
                :items-per-page="10"
                :active-page="activePage"
                @page-change="pageChange"
            >
                <template #thumbnail="{ item }">
                    <td>
                        <div class="thumbnail-wrapper clickable" @click="zoomImg(item.image)">
                            <img :src="item.image || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName($i18n.locale, item).charAt(0)}`"
                                :alt="getName($i18n.locale, item)" class="thumbnail-img">
                             <div class="zoom-overlay">
                                <CIcon name="cil-search" />
                             </div>
                        </div>
                    </td>
                </template>
                <template #title="{ item }">
                    <td>
                        <div class="font-weight-bold text-dark mb-1">{{ getName($i18n.locale, item) || getName('en', item) }}</div>
                        <div class="text-muted small description-truncate" v-if="item.description">
                            {{ getName($i18n.locale, item.description) || getName('en', item.description) }}
                        </div>
                    </td>
                </template>
                <template #artist="{ item }">
                    <td class="text-muted">
                        <div class="artist-name">{{ item.artist ? getName($i18n.locale, item.artist) || getName('en', item.artist) : 'N/A' }}</div>
                        <div v-if="item.artist && item.artist.studentId" class="artist-id mt-1">ID: {{ item.artist.studentId }}</div>
                    </td>
                </template>
                <template #updatedAt="{ item }">
                    <td class="text-muted text-sm">{{ formatDate(item.updatedAt) }}</td>
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
                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="getStatusBadge(item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending').label === 'Pending' || getStatusBadge(item.status && item.status.approval ? getName('en', item.status.approval) : 'Pending').label === 'Revised'" class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                v-c-tooltip="'ดูรายละเอียด'"
                                @click="onView(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-edit ml-2" 
                                v-c-tooltip="'แก้ไข'"
                                @click="onEdit(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-success mx-2" 
                                v-c-tooltip="'อนุมัติ'"
                                @click="onApprove(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon v-if="loadingItems.includes(item._id)" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-check" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-danger" 
                                v-c-tooltip="'ปฏิเสธ'"
                                @click="onReject(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon v-if="loadingItems.includes(item._id)" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-x" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                v-c-tooltip="'ลบ'"
                                @click="onDelete(item)"
                                :disabled="loadingItems.includes(item._id)"
                            >
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                        <div v-else class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                v-c-tooltip="'ดูรายละเอียด'"
                                @click="onView(item)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                v-c-tooltip="'ลบ'"
                                @click="onDelete(item)"
                            >
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="filteredItems.length > 0">
                Showing {{ (activePage - 1) * 10 + 1 }} to {{ Math.min(activePage * 10, filteredItems.length) }} of {{ filteredItems.length }} artworks
            </div>
            <div class="text-muted text-sm" v-else>
                Showing 0 artworks
            </div>
            <CPagination
                :active-page.sync="activePage"
                :pages="Math.max(1, Math.ceil(filteredItems.length / 10))"
                size="sm"
                align="end"
                class="mb-0 pill-pagination"
            />
        </CCardFooter>
    </CCard>

        <!-- Image Zoom Modal -->
        <CModal 
            :show.sync="showZoomModal"
            centered 
            size="xl" 
            class="zoom-modal"
            hide-footer
            @update:show="showZoomModal = $event"
        >
            <template #header>
                <div class="w-100 d-flex justify-content-between align-items-center">
                    <h5 class="modal-title py-0">{{ $i18n.locale === 'en' ? 'Zoom Artwork Image' : 'ดูรูปผลงานศิลปะขนาดใหญ่' }}</h5>
                    <CButton close @click="showZoomModal = false" />
                </div>
            </template>
            <div class="zoom-content position-relative">
                <div class="text-center">
                    <img :src="zoomImageUrl" class="zoomed-image shadow-lg" alt="Full Preview">
                </div>
            </div>
        </CModal>
        </CCol>
    </CRow>
</template>

<script>
import moment from 'moment';
import * as XLSX from 'xlsx';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
    name: 'AdminTable',
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
        }
    },
    data() {
        return {
            showZoomModal: false,
            zoomImageUrl: '',
            activePage: 1
        }
    },
    watch: {
        filters: {
            handler() {
                this.activePage = 1;
            },
            deep: true
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
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },
        filteredItems() {
            return this.items.filter(item => {
                const title = this.getName('en', item).toLowerCase();
                const artist = (item.artist ? this.getName('en', item.artist) : '').toLowerCase();
                
                // Search Filter
                const searchMatch = !this.filters.search || 
                    title.includes(this.filters.search.toLowerCase()) ||
                    artist.includes(this.filters.search.toLowerCase());

                // Category Filter
                const categoryName = item.category ? this.getName('en', item.category) : 'N/A';
                const categoryMatch = this.filters.category === 'All Categories' || categoryName === this.filters.category;

                // Status Filter
                const statusInfo = this.getStatusBadge(item.status && item.status.approval ? this.getName('en', item.status.approval) : 'Pending');
                const statusMatch = this.filters.status === 'All Status' || statusInfo.label === this.filters.status;

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
        }
    },
    methods: {
        onView(item) {
            this.$emit('view', item);
        },
        zoomImg(url) {
            if (!url) return;
            this.zoomImageUrl = url;
            this.showZoomModal = true;
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
            if (confirm(`Are you sure you want to delete "${this.getName('en', item)}"? This action cannot be undone.`)) {
                this.$emit('delete', item);
            }
        },
        pageChange(val) {
            this.activePage = val;
        },
        exportExcel() {
            const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;

            const headers = [
                'Artwork Image', 'Title (TH)', 'Title (EN)', 
                'Artist Name', 'Artist ID', 'Category', 
                'Technique (TH)', 'Technique (EN)', 
                'Size (TH)', 'Size (EN)', 'Price', 
                'Approval Status', 'Sale Status', 'Created At'
            ];

            const data = this.filteredItems.map(item => {
                const artworkUrl = item.image ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`) : null;
                
                // Status Helpers
                const approvalStatus = this.getStatusBadge(item.status && item.status.approval ? this.getName('en', item.status.approval) : 'Pending').label;
                const saleStatus = item.status && item.status.sale ? this.getName('en', item.status.sale) : 'N/A';

                return [
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
                    this.formatDate(item.createdAt)
                ];
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Artworks');
            XLSX.writeFile(wb, `Artworks_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        }
    }
}
</script>

<style scoped>
/* Custom Modal Tweaks for Zoom */
.zoom-modal >>> .modal-content {
    background-color: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.zoom-modal >>> .modal-body {
    padding: 1.5rem; /* Give some nice breathing room */
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

.zoom-content {
    background: transparent;
    padding: 0;
    overflow: hidden;
    border-radius: 12px;
}

.zoomed-image {
    width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 12px;
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
