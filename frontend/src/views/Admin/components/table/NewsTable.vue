<template>
    <CRow>
        <CCol md="12">
            <CCard class="news-table-card mb-4">
                <div class="news-table-scroll" role="region" :aria-label="$i18n.locale === 'en' ? 'News table' : 'ตารางข่าวสาร'" tabindex="0">
                    <CDataTable :items="paginatedItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                        :striped="false">
                        <template #thumbnail="{ item }">
                            <td>
                                <div class="thumbnail-wrapper clickable" @click="zoomImg(getFirstImage(item))">
                                    <img :src="getFirstImage(item) || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName('en', item).charAt(0)}`"
                                        :alt="getName($i18n.locale, item) || getName('en', item)" class="thumbnail-img">
                                    <div class="zoom-overlay">
                                        <CIcon name="cil-search" />
                                    </div>
                                </div>
                            </td>
                        </template>
                        <template #title="{ item }">
                            <td>
                                <div class="font-weight-bold text-dark mb-1 title-truncate" :title="getName($i18n.locale, item) || getName('en', item)">
                                    {{ getName($i18n.locale, item) || getName('en', item) }}
                                </div>
                                <div class="text-muted small description-truncate" :title="item.description || item.content ? stripHtml(getName($i18n.locale, item.description || item.content) || getName('en', item.description || item.content)) : ''">
                                    {{ item.description || item.content ? stripHtml(getName($i18n.locale, item.description || item.content) || getName('en', item.description || item.content)) : 'N/A' }}
                                </div>
                            </td>
                        </template>
                        <template #createdAt="{ item }">
                            <td class="text-muted text-sm">
                                <div>{{ formatDate(item.create ? item.create.datetime : null) }}</div>
                                <div class="small mt-1">{{ formatTime(item.create ? item.create.datetime : null) }}</div>
                            </td>
                        </template>
                        <template #views="{ item }">
                            <td class="text-muted text-sm">
                                <div class="simple-views">
                                    <CIcon name="cil-eye" size="sm" class="mr-1" />
                                    {{ item.views || 0 }}
                                </div>
                            </td>
                        </template>
                        <template #actions="{ item }">
                            <td class="text-right">
                                <div class="d-inline-flex align-items-center">
                                    <button class="action-btn icon-view" v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" @click="onView(item)">
                                        <CIcon name="cilMagnifyingGlass" size="lg" />
                                    </button>
                                    <button class="action-btn icon-edit ml-2" v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="onEdit(item)">
                                        <CIcon name="cil-pencil" size="lg" />
                                    </button>
                                    <button class="action-btn icon-trash ml-2" v-c-tooltip="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" @click="onDelete(item)">
                                        <CIcon name="cil-trash" size="lg" />
                                    </button>
                                </div>
                            </td>
                        </template>
                    </CDataTable>
                </div>

                <TablePaginationFooter :total="filteredItems.length" :active-page.sync="currentPage" :items-per-page.sync="itemsPerPage" :show-page-size="false" noun-en="news articles" noun-th="ข่าวสาร" />
            </CCard>

            <!-- Image Zoom Modal -->
            <CModal :show.sync="showZoomModal" centered size="xl" class="zoom-modal admin-modal" hide-footer>
                <template #header>
                    <div class="w-100 d-flex justify-content-between align-items-center">
                        <h5 class="modal-title py-0">{{ $i18n.locale === 'en' ? 'Zoom News Image' : 'ดูรูปภาพข่าวขนาดใหญ่' }}</h5>
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
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import TablePaginationFooter from './TablePaginationFooter.vue';

export default {
    name: 'NewsTable',
    components: { TablePaginationFooter },
    mixins: [statusBadgeMixin],
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
            currentPage: 1,
            itemsPerPage: 10,
            showZoomModal: false,
            zoomImageUrl: ''
        }
    },
    computed: {
        fields() {
            return [
                { key: 'thumbnail', label: this.$i18n.locale === 'en' ? 'COVER' : 'รูปหน้าปก', _classes: 'border-top-0 border-bottom' },
                { key: 'title', label: this.$i18n.locale === 'en' ? 'NEWS TITLE' : 'หัวข้อข่าว', _classes: 'border-top-0 border-bottom' },
                { key: 'createdAt', label: this.$i18n.locale === 'en' ? 'DATE CREATED' : 'วันที่สร้าง', _classes: 'border-top-0 border-bottom' },
                { key: 'views', label: this.$i18n.locale === 'en' ? 'VIEWS' : 'ยอดเข้าชม', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },

        filteredItems() {
            const list = this.items.filter(item => {
                const title = this.getName('en', item).toLowerCase();
                const content = (item.content || item.description) ? this.getName('en', item.content || item.description).toLowerCase() : '';
                
                const searchMatch = !this.filters.search || 
                    title.includes(this.filters.search.toLowerCase()) ||
                    content.includes(this.filters.search.toLowerCase());

                let dateMatch = true;
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = moment(item.createdAt);
                    if (this.filters.startDate) dateMatch = dateMatch && itemDate.isSameOrAfter(moment(this.filters.startDate).startOf('day'));
                    if (this.filters.endDate) dateMatch = dateMatch && itemDate.isSameOrBefore(moment(this.filters.endDate).endOf('day'));
                }

                return searchMatch && dateMatch;
            });
            return list.sort((a, b) => {
                const dateA = a.create?.datetime ? new Date(a.create.datetime) : new Date(a.createdAt || 0);
                const dateB = b.create?.datetime ? new Date(b.create.datetime) : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
        },
        paginatedItems() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredItems.slice(start, start + this.itemsPerPage);
        },
        totalPages() {
            return Math.ceil(this.filteredItems.length / this.itemsPerPage) || 1;
        }
    },
    watch: {
        filteredItems() {
            this.currentPage = 1;
        }
    },
    methods: {
        stripHtml(val) {
            if (!val) return '';
            return val
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"');
        },
        onView(item) { this.$emit('view', item); },
        onEdit(item) { this.$emit('edit', item); },
        onDelete(item) {
            const title = this.getName(this.$i18n.locale, item) || this.getName('en', item);
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to delete "${title}"?`
                : `คุณแน่ใจหรือไม่ว่าต้องการลบ "${title}"?`;
            if (confirm(confirmMsg)) {
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
        exportExcel() {
            const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;
            const dataToExport = this.filteredItems.map(item => {
                const img = this.getFirstImage(item);
                let imgUrl = 'N/A';
                if (img) {
                    imgUrl = img.startsWith('http') ? img : `${baseUrl}${img}`;
                }

                const descTh = item.description || item.content ? this.stripHtml(this.getName('th', item.description || item.content)) : 'N/A';

                return {
                    'รูปภาพ': imgUrl,
                    'หัวข้อข่าว': this.getName('th', item.title),
                    'เนื้อหาข่าว': descTh,
                    'ยอดผู้เข้าชม': item.views || 0,
                    'วันที่สร้าง': this.formatDateTime(item.create ? item.create.datetime : item.createdAt)
                };
            });
            const ws = XLSX.utils.json_to_sheet(dataToExport);

            // Post-process to make image cells clickable formulas
            for (let i = 0; i < dataToExport.length; i++) {
                const cellRef = `A${i + 2}`;
                const url = dataToExport[i]['รูปภาพ'];
                if (url && url !== 'N/A') {
                    ws[cellRef] = {
                        t: 's',
                        v: 'View',
                        f: `HYPERLINK("${url}", "View")`
                    };
                }
            }

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
.news-table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.news-table-scroll ::v-deep table { min-width: 720px; }
.thumbnail-wrapper { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; background-color: #f8f9fa; border: 1px solid #eef0f3; cursor: pointer; position: relative; }
.thumbnail-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.zoom-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.2s; }
.thumbnail-wrapper:hover .zoom-overlay { opacity: 1; }
.category-badge { display: inline-flex; align-items: center; padding: 0.35rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; color: #3b82f6; background-color: #f0f4ff; border: 1px solid rgba(59,130,246,0.3); }
.category-icon { width: 14px; height: 14px; margin-right: 6px; }



.zoomed-image { width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; }

.simple-views {
    display: inline-flex;
    align-items: center;
    color: #94a3b8;
    font-weight: 500;
}

.title-truncate {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    max-width: 600px;
}

.description-truncate {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    max-width: 600px;
}

@media (max-width: 575.98px) {
    .news-table-card {
        border-radius: 10px;
    }

    .news-table-scroll ::v-deep th,
    .news-table-scroll ::v-deep td {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }
}
</style>
