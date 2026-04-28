<template>
    <CCard class="order-table-card mb-4">
        <div>
            <CDataTable :items="filteredItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="10" :active-page="activePage" @page-change="pageChange">

                <template #id="{ item }">
                    <td class="text-muted text-sm">{{ item._id.substring(item._id.length - 8).toUpperCase() }}</td>
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
                            <button class="action-btn icon-view" v-c-tooltip="'View Details'" @click="$emit('view-order', item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit ml-2" v-c-tooltip="'Edit'" @click="$emit('edit-order', item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-success mx-2" v-c-tooltip="'Approve'" @click="$emit('approve', item)">
                                <CIcon name="cil-check" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" v-c-tooltip="'Reject'" @click="$emit('reject', item)">
                                <CIcon name="cil-x" size="lg" />
                            </button>
                        </div>
                        <div v-else class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" v-c-tooltip="'View Details'" @click="$emit('view-order', item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
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
            const dataToExport = this.filteredItems.map(item => ({
                'Order ID': item._id,
                'Date & Time': this.formatDate(item.createdAt),
                'Customer': item.contact ? item.contact.name : 'N/A',
                'Artwork': item.artwork && item.artwork[0] ? this.getName('en', item.artwork[0]) : 'N/A',
                'Amount': item.artwork && item.artwork[0] ? item.artwork[0].price : 0,
                'Status': this.getStatusBadge(item.status ? this.getName('en', item.status) : 'Pending').label
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Orders');
            XLSX.writeFile(wb, `Orders_Export_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        },
        pageChange(val) {
            this.activePage = val;
        }
    }
}
</script>

<style scoped>
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
</style>
