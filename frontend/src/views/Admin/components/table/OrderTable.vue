<template>
    <CCard class="order-table-card mb-4">
        <div>
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
                                <img :src="item.artwork[0].image || `https://via.placeholder.com/40/e2e8f0/808080?text=${getName('en', item.artwork[0]).charAt(0)}`"
                                    :alt="getName('en', item.artwork[0])" class="thumbnail-img">
                            </div>
                            <span class="font-weight-bold text-dark">{{ getName('en', item.artwork[0]) }}</span>
                        </div>
                        <div v-else class="text-muted small italic">No Artwork Associated</div>
                    </td>
                </template>

                <template #artist="{ item }">
                    <td class="text-muted">
                        {{ item.artwork && item.artwork[0] && item.artwork[0].artist ? getName('en', item.artwork[0].artist) : 'N/A' }}
                    </td>
                </template>

                <template #amount="{ item }">
                    <td class="font-weight-bold text-dark">
                        ฿ {{ item.artwork && item.artwork[0] ? formatPrice(item.artwork[0].price) : '0.00' }}
                    </td>
                </template>

                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', getStatusBadge(item.status ? getName('en', item.status) : 'Pending').class]">
                            <CIcon :name="getStatusBadge(item.status ? getName('en', item.status) : 'Pending').icon" size="sm" class="status-icon" /> 
                            {{ getStatusBadge(item.status ? getName('en', item.status) : 'Pending').label }}
                        </div>
                    </td>
                </template>

                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="(item.status ? getName('en', item.status) : 'Pending') === 'Pending'" class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" v-c-tooltip="'View Details'" @click="$emit('view-order', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit ml-2" v-c-tooltip="'Edit'" @click="$emit('edit-order', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-success mx-2" v-c-tooltip="'Approve'" @click="$emit('approve', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon v-if="loadingItems.includes(item._id)" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-check" size="lg" />
                            </button>
                            <button class="action-btn icon-danger mr-2" v-c-tooltip="'Reject'" @click="$emit('reject', item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon v-if="loadingItems.includes(item._id)" name="cil-reload" size="lg" class="spinner-animation" />
                                <CIcon v-else name="cil-x" size="lg" />
                            </button>
                            <button class="action-btn icon-download" v-c-tooltip="'Download Invoice'" @click="downloadInvoice(item)" :disabled="loadingItems.includes(item._id)">
                                <CIcon name="cil-file" size="lg" />
                            </button>
                        </div>
                        <div v-else class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view mr-2" v-c-tooltip="'View Details'" @click="$emit('view-order', item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-download" v-c-tooltip="'Download Invoice'" @click="downloadInvoice(item)">
                                <CIcon name="cil-file" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="filteredItems.length > 0">
                Showing {{ (activePage - 1) * 10 + 1 }} to {{ Math.min(activePage * 10, filteredItems.length) }} of {{ filteredItems.length }} orders
            </div>
            <div class="text-muted text-sm" v-else>
                Showing 0 orders
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
import moment from 'moment';
import * as XLSX from 'xlsx';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
    name: 'OrderTable',
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
                status: 'All Status',
                startDate: null,
                endDate: null
            })
        },
        loadingItems: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fields: [
                { key: 'id', label: 'ORDER ID', _classes: 'border-top-0 border-bottom' },
                { key: 'datetime', label: 'DATE & TIME', _classes: 'border-top-0 border-bottom' },
                { key: 'customer', label: 'CUSTOMER', _classes: 'border-top-0 border-bottom' },
                { key: 'artwork', label: 'ARTWORK / ITEM', _classes: 'border-top-0 border-bottom' },
                { key: 'artist', label: 'ARTIST', _classes: 'border-top-0 border-bottom' },
                { key: 'amount', label: 'AMOUNT', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            activePage: 1
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
        filteredItems() {
            return (this.items || []).filter(item => {
                const customer = (item.contact ? item.contact.name : '').toLowerCase();
                const artwork = (item.artwork && item.artwork[0] ? this.getName('en', item.artwork[0]) : '').toLowerCase();
                const orderId = (item._id || '').toLowerCase();

                // Search Filter
                const searchMatch = !this.filters.search || 
                    orderId.includes(this.filters.search.toLowerCase()) ||
                    customer.includes(this.filters.search.toLowerCase()) ||
                    artwork.includes(this.filters.search.toLowerCase());

                // Status Filter
                const statusInfo = this.getStatusBadge(item.status ? this.getName('en', item.status) : 'Pending');
                const statusMatch = this.filters.status === 'All Status' || statusInfo.label === this.filters.status;

                // Date Filter
                let dateMatch = true;
                if (this.filters.startDate && this.filters.endDate) {
                    const itemDate = moment(item.createdAt);
                    const start = moment(this.filters.startDate).startOf('day');
                    const end = moment(this.filters.endDate).endOf('day');
                    dateMatch = itemDate.isBetween(start, end, null, '[]');
                }

                return searchMatch && statusMatch && dateMatch;
            });
        }
    },
    methods: {
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        exportExcel() {
            const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;

            const headers = [
                'Order Number', 'Date & Time', 'Customer', 'Artwork', 'Artist', 
                'Amount', 'Status', 'Artwork Image', 'Receipt (Slip)', 
                'Invoice File', 'Certificate File'
            ];

            const data = this.filteredItems.map(item => {
                const buyerName = this.sanitizeForPath(item.contact?.name || (item.user && item.user.name) || "Customer");
                const buyerId = item.user?._id || item.user || "Guest";
                const orderIdentifier = item.orderNumber ? item.orderNumber.replace(/-/g, '_') : item._id;

                const invoiceUrl = item.invoiceFile 
                    ? `${baseUrl}/account/User/${buyerId}_${buyerName}/Invoice/${item.invoiceFile}` 
                    : null;
                const certificateUrl = `${baseUrl}/account/User/${buyerId}_${buyerName}/Certificate/Certificate_${orderIdentifier}.pdf`;
                const slipUrl = item.image ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`) : null;
                const artworkUrl = item.artwork && item.artwork[0] ? (item.artwork[0].image.startsWith('http') ? item.artwork[0].image : `${baseUrl}${item.artwork[0].image}`) : null;

                const statusInfo = this.getStatusBadge(item.status ? this.getName('en', item.status) : 'Pending');

                return [
                    item.orderNumber || item._id,
                    this.formatDate(item.createdAt),
                    item.contact ? item.contact.name : 'N/A',
                    item.artwork && item.artwork[0] ? this.getName('en', item.artwork[0]) : 'N/A',
                    item.artwork && item.artwork[0] && item.artwork[0].artist ? this.getName('en', item.artwork[0].artist) : 'N/A',
                    item.artwork && item.artwork[0] ? item.artwork[0].price : 0,
                    statusInfo.label,
                    // Link columns using SheetJS cell objects
                    artworkUrl ? { t: 's', v: 'View Artwork', l: { Target: artworkUrl } } : 'N/A',
                    slipUrl ? { t: 's', v: 'View Slip', l: { Target: slipUrl } } : 'No slip',
                    invoiceUrl ? { t: 's', v: 'Download Invoice', l: { Target: invoiceUrl } } : 'Not Generated',
                    statusInfo.label === 'Approved' ? { t: 's', v: 'Download Certificate', l: { Target: certificateUrl } } : 'N/A'
                ];
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
        async downloadInvoice(item) {
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
                    title: 'Error',
                    message: 'Could not download invoice.',
                    variant: 'danger'
                });
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
