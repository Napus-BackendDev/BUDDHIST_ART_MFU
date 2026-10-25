<template>
    <CCard class="order-table-card mb-4">
        <CCardHeader v-if="title" class="bg-white border-0 pt-4 pb-0">
            <h5 class="mb-0 font-weight-bold" style="color: #2c3e50;">{{ title }}</h5>
        </CCardHeader>
        <div :class="{ 'pt-3': !title }">
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="10" :active-page="activePage" @page-change="pageChange">

                <template #id="{ item }">
                    <td class="text-muted text-sm">{{ item.orderNumber || item._id.substring(item._id.length - 8).toUpperCase() }}</td>
                </template>

                <template #datetime="{ item }">
                    <td class="text-muted text-sm">{{ formatDate(item.createdAt) }}</td>
                </template>

                <template #customer="{ item }">
                    <td class="font-weight-bold text-dark">
                        {{ item.contact ? item.contact.name : 'N/A' }}
                        <div class="small text-muted">{{ item.contact ? item.contact.email : '' }}</div>
                    </td>
                </template>

                <template #artwork="{ item }">
                    <td>
                        <div class="d-flex align-items-center" v-if="item.artwork && item.artwork.length > 0">
                            <div class="thumbnail-wrapper mr-3">
                                <img :src="item.artwork[0].image || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName($i18n.locale, item.artwork[0]).charAt(0)}`"
                                    :alt="getName($i18n.locale, item.artwork[0])" class="thumbnail-img">
                            </div>
                            <div>
                                <div class="font-weight-bold text-dark">{{ getName($i18n.locale, item.artwork[0]) }}</div>
                                <div v-if="item.artwork.length > 1" class="small text-info font-weight-bold">
                                    +{{ item.artwork.length - 1 }} {{ $i18n.locale === 'en' ? 'more item(s)' : 'รายการเพิ่มเติม' }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-muted small italic">{{ $i18n.locale === 'en' ? 'No Artwork Associated' : 'ไม่มีผลงานศิลปะที่เชื่อมโยง' }}</div>
                    </td>
                </template>

                <template #artist="{ item }">
                    <td class="text-muted font-weight-bold">
                        {{ getOrderArtists(item) }}
                    </td>
                </template>

                <template #amount="{ item }">
                    <td class="font-weight-bold text-dark">
                        ฿ {{ formatPrice(getOrderTotal(item)) }}
                    </td>
                </template>

                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', getStatusBadge(item.status ? getName('en', item.status) : 'Pending').class]">
                            <CIcon :name="getStatusBadge(item.status ? getName('en', item.status) : 'Pending').icon" size="sm" class="status-icon" /> 
                            {{ getTranslatedStatusLabel(item.status) }}
                        </div>
                    </td>
                </template>

                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="['Pending', 'Reserved', 'Pending Payment'].includes(item.status ? getName('en', item.status) : 'Pending')" class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" :aria-label="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" @click="$emit('view-order', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit ml-2" :aria-label="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="$emit('edit-order', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button v-if="item.image" class="action-btn icon-success mx-2" :aria-label="$i18n.locale === 'en' ? 'Approve' : 'อนุมัติ'" v-c-tooltip="$i18n.locale === 'en' ? 'Approve' : 'อนุมัติ'" @click="$emit('approve', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon v-if="loadingActions[item._id] === 'Approved'" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-check" size="lg" />
                            </button>
                            <button class="action-btn icon-danger mr-2" :aria-label="$i18n.locale === 'en' ? 'Reject' : 'ปฏิเสธ'" v-c-tooltip="$i18n.locale === 'en' ? 'Reject' : 'ปฏิเสธ'" @click="$emit('reject', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon v-if="loadingActions[item._id] === 'Rejected'" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-x" size="lg" />
                            </button>
                            <button class="action-btn icon-download" :aria-label="$i18n.locale === 'en' ? 'Download Invoice' : 'ดาวน์โหลดใบแจ้งหนี้'" v-c-tooltip="$i18n.locale === 'en' ? 'Download Invoice' : 'ดาวน์โหลดใบแจ้งหนี้'" @click="downloadInvoice(item)" :disabled="loadingItems.includes(item._id) || downloadingItems.includes(item._id)">
                                <CSpinner v-if="downloadingItems.includes(item._id)" size="sm" />
                                <CIcon v-else name="cil-file" size="lg" />
                            </button>
                        </div>
                        <div v-else class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view mr-2" :aria-label="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" v-c-tooltip="$i18n.locale === 'en' ? 'View Details' : 'ดูรายละเอียด'" @click="$emit('view-order', item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button v-if="getName('en', item.status) === 'Approved'" class="action-btn icon-edit mr-2" :aria-label="$i18n.locale === 'en' ? 'Edit delivery information' : 'แก้ไขข้อมูลจัดส่ง'" @click="$emit('edit-order', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-download" :aria-label="$i18n.locale === 'en' ? 'Download Invoice' : 'ดาวน์โหลดใบแจ้งหนี้'" v-c-tooltip="$i18n.locale === 'en' ? 'Download Invoice' : 'ดาวน์โหลดใบแจ้งหนี้'" @click="downloadInvoice(item)" :disabled="downloadingItems.includes(item._id)">
                                <CSpinner v-if="downloadingItems.includes(item._id)" size="sm" />
                                <CIcon v-else name="cil-file" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="filteredItems.length > 0">
                {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} {{ (activePage - 1) * 10 + 1 }} {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} {{ Math.min(activePage * 10, filteredItems.length) }} {{ $i18n.locale === 'en' ? 'of' : 'จาก' }} {{ filteredItems.length }} {{ $i18n.locale === 'en' ? 'orders' : 'รายการคำสั่งซื้อ' }}
            </div>
            <div class="text-muted text-sm" v-else>
                {{ $i18n.locale === 'en' ? 'Showing 0 orders' : 'แสดง 0 รายการ' }}
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
</template>

<script>
import { orderAmounts, orderLinePrice } from '@/utils/orderAmounts'
import { orderDocumentUrl } from '@/utils/orderDocuments'
import moment from 'moment';
import * as XLSX from 'xlsx';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
    name: 'OrderTable',
    mixins: [statusBadgeMixin],
    props: {
        title: {
            type: String,
            default: ''
        },
        items: {
            type: Array,
            default: () => []
        },
        filters: {
            type: Object,
            default: () => ({
                search: '',
                status: 'All Status',
                startDate: null,
                endDate: null
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
            activePage: 1,
            downloadingItems: []
        }
    },
    watch: {
        'filters': {
            handler() {
                this.activePage = 1;
            },
            deep: true
        }
    },
    computed: {
        fields() {
            return [
                { key: 'id', label: this.$i18n.locale === 'en' ? 'ORDER ID' : 'รหัสคำสั่งซื้อ', _classes: 'border-top-0 border-bottom' },
                { key: 'datetime', label: this.$i18n.locale === 'en' ? 'DATE & TIME' : 'วันที่และเวลา', _classes: 'border-top-0 border-bottom' },
                { key: 'customer', label: this.$i18n.locale === 'en' ? 'CUSTOMER' : 'ลูกค้า', _classes: 'border-top-0 border-bottom' },
                { key: 'artwork', label: this.$i18n.locale === 'en' ? 'ARTWORK / ITEM' : 'ผลงานศิลปะ / สินค้า', _classes: 'border-top-0 border-bottom' },
                { key: 'artist', label: this.$i18n.locale === 'en' ? 'ARTIST' : 'ศิลปิน', _classes: 'border-top-0 border-bottom' },
                { key: 'amount', label: this.$i18n.locale === 'en' ? 'AMOUNT' : 'ยอดรวม', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },
        filteredItems() {
            const list = (this.items || []).filter(item => {
                const customer = String(item.contact && item.contact.name || '').toLowerCase();
                const orderId = String(item.orderNumber || item._id || '').toLowerCase();
                const searchKeyword = String(this.filters.search || '').toLowerCase();

                // Search Filter: check order ID, customer name, and any associated artwork or artist name
                const artworkNamesMatch = item.artwork ? item.artwork.some(art => 
                    this.getName('en', art).toLowerCase().includes(searchKeyword) || 
                    this.getName('th', art).toLowerCase().includes(searchKeyword) ||
                    (art.artist && (
                        this.getName('en', art.artist).toLowerCase().includes(searchKeyword) ||
                        this.getName('th', art.artist).toLowerCase().includes(searchKeyword)
                    ))
                ) : false;

                const searchMatch = !this.filters.search || 
                    orderId.includes(searchKeyword) ||
                    customer.includes(searchKeyword) ||
                    artworkNamesMatch;

                // Status Filter
                const statusGroup = this.getStatusGroup(item);
                const statusMatch = this.filters.status === 'All Status' || statusGroup === this.filters.status;

                // Date Filter
                let dateMatch = true;
                if (this.filters.startDate || this.filters.endDate) {
                    const itemDate = moment(item.createdAt);
                    if (this.filters.startDate) dateMatch = itemDate.isSameOrAfter(moment(this.filters.startDate).startOf('day'));
                    if (dateMatch && this.filters.endDate) dateMatch = itemDate.isSameOrBefore(moment(this.filters.endDate).endOf('day'));
                }

                return searchMatch && statusMatch && dateMatch;
            });
            return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
    },
    methods: {
        getStatusGroup(item) {
            if (!item || !item.status) return 'Pending';
            let status = '';
            if (typeof item.status === 'string') {
                status = item.status;
            } else if (item.status.title) {
                const enStatus = item.status.title.find(t => t.key === 'en');
                status = enStatus ? enStatus.value : '';
            }
            switch (String(status).toLowerCase()) {
                case 'completed':
                case 'success':
                case 'approved':
                    return 'Completed';
                case 'cancelled':
                case 'rejected':
                    return 'Cancelled';
                default:
                    return 'Pending';
            }
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        getOrderTotal(item) {
            return orderAmounts(item).total;
        },
        getOrderArtists(item) {
            if (!item.artwork || !Array.isArray(item.artwork)) return 'N/A';
            const names = item.artwork
                .map(art => art.artist ? this.getName(this.$i18n.locale, art.artist) : '')
                .filter(Boolean);
            const uniqueNames = [...new Set(names)];
            return uniqueNames.length > 0 ? uniqueNames.join(', ') : 'N/A';
        },
        exportExcel() {
            const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;

            const headers = [
                'Order Number', 'Date & Time', 'Customer', 'Artwork', 'Artist', 
                'Amount', 'Status', 'Artwork Image', 'Receipt (Slip)', 
                'Invoice File', 'Certificate File'
            ];

            const data = [];

            this.filteredItems.forEach(item => {
                const invoiceUrl = orderDocumentUrl(item, 'invoice');
                const certificateUrl = orderDocumentUrl(item, 'certificate');
                const slipUrl = item.image ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`) : null;
                const statusInfo = this.getStatusBadge(item.status ? this.getName('en', item.status) : 'Pending');

                const artworks = item.artwork && item.artwork.length > 0 ? item.artwork : [null];

                artworks.forEach(art => {
                    const artworkTitle = art ? this.getName(this.$i18n.locale, art) : 'N/A';
                    const artistName = art && art.artist ? this.getName(this.$i18n.locale, art.artist) : 'N/A';
                    const artworkUrl = art && art.image ? (art.image.startsWith('http') ? art.image : `${baseUrl}${art.image}`) : null;
                    const artworkAmount = art ? orderLinePrice(item, art) : 0;

                    data.push([
                        item.orderNumber || item._id,
                        this.formatDate(item.createdAt),
                        item.contact ? item.contact.name : 'N/A',
                        artworkTitle,
                        artistName,
                        artworkAmount,
                        statusInfo.label,
                        // Link columns using SheetJS cell objects
                        artworkUrl ? { t: 's', v: 'View Artwork', l: { Target: artworkUrl } } : 'N/A',
                        slipUrl ? { t: 's', v: 'View Slip', l: { Target: slipUrl } } : 'No slip',
                        invoiceUrl ? { t: 's', v: 'Open Invoice', l: { Target: invoiceUrl } } : 'Not Generated',
                        (statusInfo.label === 'Approved' || statusInfo.label === 'อนุมัติแล้ว' || statusInfo.label === 'อนุมัติ' || (item.status && this.getName('en', item.status).toLowerCase().includes('approved'))) ? { t: 's', v: 'Open Certificate', l: { Target: certificateUrl } } : 'N/A'
                    ]);
                });
            });

            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Orders');
            XLSX.writeFile(wb, `Orders_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        },
        sanitizeForPath(text) {
            if (!text) return "";
            if (Array.isArray(text)) {
                const enVal = text.find(t => t.key === 'en')?.value;
                const thVal = text.find(t => t.key === 'th')?.value;
                return String(enVal || thVal || text[0]?.value || "").trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
            }
            return String(text).trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
        },
        getTranslatedStatusLabel(status) {
            if (!status) return this.$i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ';
            const statusEn = this.getName('en', status);
            // Some status items might be simple strings instead of translation objects
            if (statusEn === 'N/A' && typeof status === 'string') {
                const map = {
                    'Pending': this.$i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ',
                    'Approved': this.$i18n.locale === 'en' ? 'Approved' : 'อนุมัติแล้ว',
                    'Rejected': this.$i18n.locale === 'en' ? 'Rejected' : 'ปฏิเสธแล้ว',
                    'Reserved': this.$i18n.locale === 'en' ? 'Reserved' : 'จองแล้ว',
                    'Shipped': this.$i18n.locale === 'en' ? 'Shipped' : 'จัดส่งแล้ว',
                    'Delivered': this.$i18n.locale === 'en' ? 'Delivered' : 'จัดส่งสำเร็จ'
                };
                return map[status] || status;
            }
            return this.getName(this.$i18n.locale, status);
        },
        async downloadInvoice(item) {
            if (!item || !item._id || this.downloadingItems.includes(item._id)) return;
            this.downloadingItems.push(item._id);
            try {
                const response = await this.$store.dispatch('order/getInvoice', item._id);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                const orderIdShort = item._id.substring(item._id.length - 8).toUpperCase();
                link.href = url;
                link.setAttribute('download', `Invoice_${orderIdShort}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Download failed:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: this.$i18n.locale === 'en' ? 'Could not download invoice.' : 'ไม่สามารถดาวน์โหลดใบเสร็จได้',
                    variant: 'danger'
                });
            } finally {
                this.downloadingItems = this.downloadingItems.filter(id => id !== item._id);
            }
        },
        pageChange(val) {
            this.activePage = val;
        }
    }
}
</script>

<style scoped>
/* ... existing styles ... */
.action-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: none;
    transition: all 0.2s ease;
}

.icon-view { background-color: #f0f7ff; color: #007bff; }
.icon-view:hover { background-color: #007bff; color: white; }

.icon-download { background-color: #f1f5f9; color: #475569; }
.icon-download:hover { background-color: #8c1515; color: white; }

.icon-edit { background-color: #fff9db; color: #f59f00; }
.icon-edit:hover { background-color: #f59f00; color: white; }

.icon-success { background-color: #ebfbee; color: #40c057; }
.icon-success:hover { background-color: #40c057; color: white; }

.icon-danger { background-color: #fff5f5; color: #fa5252; }
.icon-danger:hover { background-color: #fa5252; color: white; }

.order-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-top: 1rem;
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

.rounded-bottom {
    border-bottom-left-radius: 12px !important;
    border-bottom-right-radius: 12px !important;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
