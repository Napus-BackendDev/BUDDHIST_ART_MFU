<template>
    <CRow>
            <CCol md="12">
    <CCard class="artwork-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">
                <template #thumbnail="{ item }">
                    <td>
                        <div class="thumbnail-wrapper clickable" @click="zoomImg(item.image)">
                            <img :src="item.image || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName('en', item).charAt(0)}`"
                                :alt="getName('en', item)" class="thumbnail-img">
                             <div class="zoom-overlay">
                                <CIcon name="cil-search" />
                             </div>
                        </div>
                    </td>
                </template>
                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ getName('en', item) }}</td>
                </template>
                <template #artist="{ item }">
                    <td class="text-muted">
                        <div class="artist-name">{{ item.artist ? getName('en', item.artist) : 'N/A' }}</div>
                        <div v-if="item.artist && item.artist.studentId" class="artist-id mt-1">ID: {{ item.artist.studentId }}</div>
                    </td>
                </template>
                <template #createdAt="{ item }">
                    <td class="text-muted text-sm">{{ formatDate(item.createdAt) }}</td>
                </template>
                <template #category="{ item }">
                    <td>
                        <span class="category-pill">{{ item.category ? getName('en', item.category) : 'N/A' }}</span>
                    </td>
                </template>
                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', getStatusInfo(item).class]">
                            <CIcon :name="getStatusInfo(item).icon" size="sm" class="status-icon" /> {{ getStatusInfo(item).label }}
                        </div>
                    </td>
                </template>
                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="getStatusInfo(item).label === 'Pending' || getStatusInfo(item).label === 'Revised'" class="d-inline-flex align-items-center">
                            <button 
                                class="action-btn icon-view" 
                                v-c-tooltip="'ดูรายละเอียด'"
                                @click="onView(item)"
                            >
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-edit ml-2" 
                                v-c-tooltip="'แก้ไข'"
                                @click="onEdit(item)"
                            >
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-success mx-2" 
                                v-c-tooltip="'อนุมัติ'"
                                @click="onApprove(item)"
                            >
                                <CIcon name="cil-check" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-danger" 
                                v-c-tooltip="'ปฏิเสธ'"
                                @click="onReject(item)"
                            >
                                <CIcon name="cil-x" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-trash ml-2" 
                                v-c-tooltip="'ลบ'"
                                @click="onDelete(item)"
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
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm">Showing {{ filteredItems.length }} of {{ items.length }} artworks</div>
            <div class="pagination-buttons">
                <CButton class="btn-pill-pagination mr-2" :disabled="true">
                    <CIcon name="cil-chevron-left" size="sm" class="mr-1" /> Previous
                </CButton>
                <CButton class="btn-pill-pagination">
                    Next <CIcon name="cil-chevron-right" size="sm" class="ml-1" />
                </CButton>
            </div>
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
                    <h5 class="modal-title py-0">Zoom Artwork Image</h5>
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

export default {
    name: 'AdminTable',
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
        }
    },
    data() {
        return {
            showZoomModal: false,
            zoomImageUrl: '',
            fields: [
                { key: 'thumbnail', label: 'THUMBNAIL', _classes: 'border-top-0 border-bottom' },
                { key: 'title', label: 'ARTWORK TITLE', _classes: 'border-top-0 border-bottom' },
                { key: 'artist', label: 'ARTIST', _classes: 'border-top-0 border-bottom' },
                { key: 'createdAt', label: 'DATE CREATED', _classes: 'border-top-0 border-bottom' },
                { key: 'category', label: 'CATEGORY', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ]
        }
    },
    computed: {
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
                const statusInfo = this.getStatusInfo(item);
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
        getName(lang, item) {
            if (!item) return 'N/A';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                const firstVal = titleField[0] ? titleField[0].value : 'N/A';
                return nameObj ? nameObj.value : firstVal;
            }
            return 'N/A';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY');
        },
        getStatusInfo(item) {
            // Approval status mapping
            const approval = item.status && item.status.approval ? this.getName('en', item.status.approval) : 'Pending';
            
            switch (approval) {
                case 'Approved':
                case 'Success':
                    return { label: 'Approved', class: 'badge-completed', icon: 'cil-check' };
                case 'Rejected':
                case 'Cancelled':
                    return { label: 'Rejected', class: 'badge-cancelled', icon: 'cil-x' };
                case 'Revised':
                    return { label: 'Revised', class: 'badge-update', icon: 'cil-sync' };
                case 'Pending':
                default:
                    return { label: 'Pending', class: 'badge-pending', icon: 'cil-clock' };
            }
        },
        exportExcel() {
            const dataToExport = this.filteredItems.map(item => ({
                'ID': item._id,
                'Title': this.getName('en', item),
                'Artist': item.artist ? this.getName('en', item.artist) : 'N/A',
                'Category': item.category ? this.getName('en', item.category) : 'N/A',
                'Price': item.price,
                'Status': this.getStatusInfo(item).label,
                'Created At': this.formatDate(item.createdAt)
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Artworks');
            XLSX.writeFile(wb, `Artworks_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        }
    }
}
</script>

<style scoped>
.artwork-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-top: 1rem;
}

.custom-table th {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 700;
    color: #7a8aa3;
    padding: 1.25rem 1.5rem;
    border-color: #f0f1f5;
    background-color: #ffffff;
}

.custom-table td {
    padding: 1.25rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid #f0f1f5;
    color: #172b4d;
}

.custom-table tr:last-child td {
    border-bottom: none;
}

.text-dark {
    color: #2c3e50 !important;
    font-size: 0.95rem;
}

.text-muted {
    color: #8c98a9 !important;
    font-size: 0.95rem;
}

.text-sm {
    font-size: 0.9rem;
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

/* Custom Modal Tweaks for Zoom */
.zoom-modal >>> .modal-content {
    background-color: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.zoom-modal >>> .modal-body {
    padding: 1.5rem; /* Give some nice breathing room */
}

.category-pill {
    background-color: #f0f3f5;
    color: #4a5568;
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    display: inline-block;
}

/* Status Badges */
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 1rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    white-space: nowrap;
}

.status-icon {
    width: 14px;
    height: 14px;
    margin-right: 6px;
}

.badge-completed {
    color: #38a169;
    background-color: #f0fff4;
    border: 1px solid rgba(56, 161, 105, 0.4);
}

.badge-pending {
    color: #d69e2e;
    background-color: #fffaf0;
    border: 1px solid rgba(214, 158, 46, 0.4);
}

.badge-cancelled {
    color: #e53e3e;
    background-color: #fff5f5;
    border: 1px solid rgba(229, 62, 62, 0.4);
}

.badge-update {
    color: #3182ce;
    border: 1px solid rgba(49, 130, 206, 0.4);
    background-color: #ebf8ff;
}

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
    padding-left: 0;
    padding-right: 0;
}

.btn-pill-pagination {
    background-color: #3b3dfa; /* Your reference image purple */
    border: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 0.85rem;
    border-radius: 50px; /* Full pill shape */
    padding: 0.6rem 1.4rem;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px rgba(59, 61, 250, 0.2);
}

.btn-pill-pagination:hover:not(:disabled) {
    background-color: #2d2fcc;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(59, 61, 250, 0.3);
    color: #ffffff;
}

.btn-pill-pagination:active:not(:disabled) {
    transform: translateY(0);
}

.btn-pill-pagination:disabled {
    opacity: 0.4;
    background-color: #a0aec0;
    box-shadow: none;
    cursor: not-allowed;
}

.rounded-bottom {
    border-bottom-left-radius: 12px !important;
    border-bottom-right-radius: 12px !important;
}

/* Action Buttons */
.action-btn {
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s, background-color 0.2s, opacity 0.2s;
    outline: none;
    opacity: 1; /* Always visible */
}

.action-btn:hover {
    transform: scale(1.15);
}

.icon-success {
    color: #48bb78;
}

.icon-success:hover {
    background-color: #f0fff4;
    /* Light green bg */
}

.icon-danger {
    color: #e53e3e;
}

.icon-danger:hover {
    background-color: #ffdddd;
    /* Light red bg */
}

.icon-trash {
    color: #ed8936; /* An orange/red for warning but not same as reject */
}

.icon-trash:hover {
    background-color: #fffaf0;
}

.icon-view {
    color: #a0aec0;
}

.icon-view:hover {
    background-color: #f1f9ff;
    /* Light gray bg */
}

.icon-edit {
    color: #4299e1;
    /* A nice blue color for edit */
}

.icon-edit:hover {
    background-color: #ebf8ff;
    /* Light blue bg */
}
</style>
