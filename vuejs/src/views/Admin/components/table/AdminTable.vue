<template>
    <CRow>
            <CCol md="12">
    <CCard class="artwork-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">
                <template #thumbnail="{ item }">
                    <td>
                        <div class="thumbnail-wrapper">
                            <img :src="`https://via.placeholder.com/40/${item.imgBg}/${item.imgColor}?text=${item.thumbnail}`"
                                :alt="item.title" class="thumbnail-img">
                        </div>
                    </td>
                </template>
                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ item.title }}</td>
                </template>
                <template #artist="{ item }">
                    <td class="text-muted">{{ item.artist }}</td>
                </template>
                <template #createdAt="{ item }">
                    <td class="text-muted text-sm">{{ item.createdAt }}</td>
                </template>
                <template #category="{ item }">
                    <td>
                        <span class="category-pill">{{ item.category }}</span>
                    </td>
                </template>
                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', item.statusClass]">
                            <CIcon :name="item.statusIcon" size="sm" class="status-icon" /> {{ item.status }}
                        </div>
                    </td>
                </template>
                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="item.status === 'Pending' || item.status === 'Update'" class="d-inline-flex align-items-center">
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
                            >
                                <CIcon name="cil-check" size="lg" />
                            </button>
                            <button 
                                class="action-btn icon-danger" 
                                v-c-tooltip="'ปฏิเสธ'"
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
                <CButton color="light" class="btn-pagination mr-2" disabled>Previous</CButton>
                <CButton color="light" class="btn-pagination">Next</CButton>
            </div>
        </CCardFooter>
    </CCard>
    </CCol>
        </CRow>
</template>

<script>
import moment from 'moment';
import * as XLSX from 'xlsx';

export default {
    name: 'AdminTable',
    props: {
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
            fields: [
                { key: 'thumbnail', label: 'THUMBNAIL', _classes: 'border-top-0 border-bottom' },
                { key: 'title', label: 'ARTWORK TITLE', _classes: 'border-top-0 border-bottom' },
                { key: 'artist', label: 'ARTIST', _classes: 'border-top-0 border-bottom' },
                { key: 'createdAt', label: 'DATE CREATED', _classes: 'border-top-0 border-bottom' },
                { key: 'category', label: 'CATEGORY', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            items: [
                { thumbnail: 'S', imgBg: 'e2e8f0', imgColor: '808080', title: 'Sunset Blues', artist: 'Jane Doe', createdAt: 'Oct 24, 2023', category: 'Painting', status: 'Pending', statusIcon: 'cil-clock', statusClass: 'badge-pending' },
                { thumbnail: 'A', imgBg: 'cbd5e0', imgColor: '808080', title: 'Abstract #44', artist: 'Mike Smith', createdAt: 'Oct 23, 2023', category: 'Digital', status: 'Pending', statusIcon: 'cil-clock', statusClass: 'badge-pending' },
                { thumbnail: 'U', imgBg: 'a0aec0', imgColor: 'ffffff', title: 'Urban Chaos', artist: 'Sarah Lee', createdAt: 'Oct 22, 2023', category: 'Photography', status: 'Completed', statusIcon: 'cil-check', statusClass: 'badge-completed' },
                { thumbnail: 'R', imgBg: 'e2e8f0', imgColor: '3b82f6', title: 'Riverside Walk', artist: 'Alex J.', createdAt: 'Oct 21, 2023', category: 'Painting', status: 'Update', statusIcon: 'cil-sync', statusClass: 'badge-update' },
                { thumbnail: 'M', imgBg: '2d3748', imgColor: 'ffffff', title: 'Mountain Mist', artist: 'John Art', createdAt: 'Oct 21, 2023', category: 'Painting', status: 'Cancelled', statusIcon: 'cil-x', statusClass: 'badge-cancelled' },
                { thumbnail: 'G', imgBg: 'edf2f7', imgColor: '808080', title: 'Golden Hour', artist: 'Emily Rose', createdAt: 'Oct 20, 2023', category: 'Sculpture', status: 'Pending', statusIcon: 'cil-clock', statusClass: 'badge-pending' }
            ]
        }
    },
    computed: {
        filteredItems() {
            return this.items.filter(item => {
                // Search Filter
                const searchMatch = !this.filters.search || 
                    item.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                    item.artist.toLowerCase().includes(this.filters.search.toLowerCase());

                // Category Filter
                const categoryMatch = this.filters.category === 'All Categories' || item.category === this.filters.category;

                // Status Filter
                const statusMatch = this.filters.status === 'All Status' || item.status === this.filters.status;

                // Date Filter
                let dateMatch = true;
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = moment(item.createdAt, 'MMM DD, YYYY');
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
        onEdit(item) {
            this.$emit('edit', item);
        },
        onDelete(item) {
            if (confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
                this.items = this.items.filter(i => i !== item);
                // In a real app, this would be an API call
                this.$store.commit('dialog/showToast', {
                    title: 'Deleted',
                    message: `"${item.title}" has been removed.`,
                    variant: 'info'
                });
            }
        },
        exportExcel() {
            const dataToExport = this.filteredItems.map(item => ({
                'ID': item.id,
                'Title': item.title,
                'Artist': item.artist,
                'Category': item.category,
                'Price': item.price,
                'Status': item.status,
                'Created At': item.createdAt
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

.btn-pagination {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    color: #4a5568;
    font-weight: 600;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
    background-color: #f7fafc;
    color: #1a202c;
}

.btn-pagination:disabled {
    opacity: 0.6;
    background-color: #ffffff;
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
