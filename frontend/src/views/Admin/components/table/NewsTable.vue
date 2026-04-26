<template>
    <CRow>
        <CCol md="12">
            <CCard class="news-table-card mb-4">
                <div>
                    <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                        :striped="false">
                        <template #thumbnail="{ item }">
                            <td>
                                <div class="thumbnail-wrapper clickable" @click="zoomImg(getFirstImage(item))">
                                    <img :src="getFirstImage(item) || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName('en', item.title).charAt(0)}`"
                                        :alt="getName('en', item.title)" class="thumbnail-img">
                                    <div class="zoom-overlay">
                                        <CIcon name="cil-search" />
                                    </div>
                                </div>
                            </td>
                        </template>
                        <template #title="{ item }">
                            <td>
                                <div class="font-weight-bold text-dark mb-1">{{ getName('en', item.title) }}</div>
                                <div class="text-muted small description-truncate">
                                    {{ getName('en', item.description || item.content) }}
                                </div>
                            </td>
                        </template>
                        <template #category="{ item }">
                            <td>
                                <div class="category-badge">
                                    <CIcon name="cil-tag" size="sm" class="category-icon" /> 
                                    {{ item.category ? getName('en', item.category.title) : 'Uncategorized' }}
                                </div>
                            </td>
                        </template>
                        <template #createdAt="{ item }">
                            <td class="text-muted text-sm">{{ formatDate(item.create ? item.create.datetime : null) }}</td>
                        </template>
                        <template #views="{ item }">
                            <td class="text-muted text-sm text-center">
                                <div class="simple-views">
                                    <CIcon name="cil-eye" size="sm" class="mr-1" />
                                    {{ item.views || 0 }}
                                </div>
                            </td>
                        </template>
                        <template #actions="{ item }">
                            <td class="text-right">
                                <div class="d-inline-flex align-items-center">
                                    <button class="action-btn icon-view" v-c-tooltip="'ดูรายละเอียด'" @click="onView(item)">
                                        <CIcon name="cilMagnifyingGlass" size="lg" />
                                    </button>
                                    <button class="action-btn icon-edit ml-2" v-c-tooltip="'แก้ไข'" @click="onEdit(item)">
                                        <CIcon name="cil-pencil" size="lg" />
                                    </button>
                                    <button class="action-btn icon-trash ml-2" v-c-tooltip="'ลบ'" @click="onDelete(item)">
                                        <CIcon name="cil-trash" size="lg" />
                                    </button>
                                </div>
                            </td>
                        </template>
                    </CDataTable>
                </div>

                <CCardFooter
                    class="d-flex justify-content-between align-items-center bg-white border-0 py-4 rounded-bottom pagination-footer">
                    <div class="text-muted text-sm">Showing {{ filteredItems.length }} of {{ items.length }} news articles</div>
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
            <CModal :show.sync="showZoomModal" centered size="xl" class="zoom-modal" hide-footer>
                <template #header>
                    <div class="w-100 d-flex justify-content-between align-items-center">
                        <h5 class="modal-title py-0">Zoom News Image</h5>
                        <CButton close @click="showZoomModal = false" />
                    </div>
                </template>
                <div class="zoom-content text-center">
                    <img :src="zoomImageUrl" class="zoomed-image shadow-lg" alt="Full Preview">
                </div>
            </CModal>
        </CCol>
    </CRow>
</template>

<script>
import moment from 'moment';
import * as XLSX from 'xlsx';

export default {
    name: 'NewsTable',
    props: {
        items: { type: Array, default: () => [] },
        filters: {
            type: Object,
            default: () => ({
                search: '',
                category: 'All Categories'
            })
        }
    },
    data() {
        return {
            showZoomModal: false,
            zoomImageUrl: '',
            fields: [
                { key: 'thumbnail', label: 'COVER', _classes: 'border-top-0 border-bottom' },
                { key: 'title', label: 'NEWS TITLE', _classes: 'border-top-0 border-bottom' },
                { key: 'category', label: 'CATEGORY', _classes: 'border-top-0 border-bottom' },
                { key: 'createdAt', label: 'DATE CREATED', _classes: 'border-top-0 border-bottom' },
                { key: 'views', label: 'VIEWS', _classes: 'border-top-0 border-bottom text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ]
        }
    },
    computed: {
        filteredItems() {
            return this.items.filter(item => {
                const title = this.getName('en', item.title).toLowerCase();
                const content = this.getName('en', item.content || item.description).toLowerCase();
                
                const searchMatch = !this.filters.search || 
                    title.includes(this.filters.search.toLowerCase()) ||
                    content.includes(this.filters.search.toLowerCase());

                const categoryMatch = this.filters.category === 'All Categories' || 
                                     (item.category && this.getName('en', item.category.title) === this.filters.category);

                let dateMatch = true;
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = moment(item.createdAt);
                    if (this.filters.startDate) dateMatch = dateMatch && itemDate.isSameOrAfter(moment(this.filters.startDate).startOf('day'));
                    if (this.filters.endDate) dateMatch = dateMatch && itemDate.isSameOrBefore(moment(this.filters.endDate).endOf('day'));
                }

                return searchMatch && categoryMatch && dateMatch;
            });
        }
    },
    methods: {
        onView(item) { this.$emit('view', item); },
        onEdit(item) { this.$emit('edit', item); },
        onDelete(item) {
            if (confirm(`Are you sure you want to delete this news article?`)) {
                this.$emit('delete', item);
            }
        },
        getFirstImage(item) {
            if (!item) return null;
            if (item.images && item.images.length > 0) return item.images[0];
            if (item.image) return item.image;
            return null;
        },
        zoomImg(url) {
            if (!url) return;
            this.zoomImageUrl = url;
            this.showZoomModal = true;
        },
        getName(lang, field) {
            if (!field) return 'N/A';
            if (typeof field === 'string') return field;
            if (Array.isArray(field)) {
                const obj = field.find(f => f.key === lang) || field[0];
                return obj ? obj.value : 'N/A';
            }
            return 'N/A';
        },
        formatDate(date) { return date ? moment(date).format('MMM DD, YYYY') : 'N/A'; },
        exportExcel() {
            const dataToExport = this.filteredItems.map(item => ({
                'ID': item._id,
                'Title': this.getName('en', item.title),
                'Category': item.category ? this.getName('en', item.category.title) : 'Uncategorized',
                'Created At': this.formatDate(item.createdAt)
            }));
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'News');
            XLSX.writeFile(wb, `News_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        }
    }
}
</script>

<style scoped>
/* Reuse styles from AdminTable */
.news-table-card { border-radius: 12px; border: 1px solid #eef0f3; box-shadow: 0 4px 12px rgba(0,0,0,0.02); margin-top: 1rem; }
.custom-table th { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: #7a8aa3; padding: 1.25rem 1.5rem; border-color: #f0f1f5; background-color: #ffffff; }
.custom-table td { padding: 1.25rem 1.5rem; vertical-align: middle; border-bottom: 1px solid #f0f1f5; color: #172b4d; }
.text-dark { color: #2c3e50 !important; font-size: 0.95rem; }
.text-muted { color: #8c98a9 !important; font-size: 0.95rem; }
.text-sm { font-size: 0.9rem; }
.thumbnail-wrapper { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; background-color: #f8f9fa; border: 1px solid #eef0f3; cursor: pointer; position: relative; }
.thumbnail-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.zoom-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.2s; }
.thumbnail-wrapper:hover .zoom-overlay { opacity: 1; }
.category-badge { display: inline-flex; align-items: center; padding: 0.35rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; color: #3b82f6; background-color: #f0f4ff; border: 1px solid rgba(59,130,246,0.3); }
.category-icon { width: 14px; height: 14px; margin-right: 6px; }
/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
    padding-left: 0;
    padding-right: 0;
}

.btn-pill-pagination {
    background-color: #3b3dfa;
    border: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 0.85rem;
    border-radius: 50px;
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

.btn-pill-pagination:disabled {
    opacity: 0.4;
    background-color: #a0aec0;
    box-shadow: none;
    cursor: not-allowed;
}

.action-btn { background: transparent; border: none; padding: 6px; cursor: pointer; border-radius: 50%; transition: all 0.2s; }
.action-btn:hover { transform: scale(1.15); }
.icon-view { color: #a0aec0; }
.icon-edit { color: #4299e1; }
.icon-trash { color: #ed8936; }
.zoomed-image { width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; }

.description-truncate {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    max-width: 400px;
}

.simple-views {
    display: inline-flex;
    align-items: center;
    color: #94a3b8;
    font-weight: 500;
}
</style>
