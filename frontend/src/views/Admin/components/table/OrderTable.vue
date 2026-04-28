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
                        <div :class="['status-badge', getStatusInfo(item).class]">
                            <CIcon :name="getStatusInfo(item).icon" size="sm" class="status-icon" /> {{ getStatusInfo(item).label }}
                        </div>
                    </td>
                </template>

                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="getStatusInfo(item).label === 'Pending'" class="d-inline-flex align-items-center">
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
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
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

export default {
    name: 'OrderTable',
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
                const statusInfo = this.getStatusInfo(item);
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
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            if (Array.isArray(item)) {
                const target = item.find(n => n.key === lang) || item[0];
                return target ? target.value : '';
            }
            const field = item.title || item.name || item.key;
            if (field) {
                if (typeof field === 'string') return field;
                if (Array.isArray(field)) {
                    const target = field.find(n => n.key === lang) || field[0];
                    return target ? target.value : '';
                }
            }
            return item.value || '';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY hh:mm A');
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        getStatusInfo(item) {
            if (!item || !item.status) return { label: 'Pending', class: 'badge-pending', icon: 'cil-clock' };
            const status = this.getName('en', item.status);
            switch (status) {
                case 'Completed':
                case 'Success':
                case 'Approved':
                    return { label: 'Completed', class: 'badge-completed', icon: 'cil-check' };
                case 'Cancelled':
                case 'Rejected':
                    return { label: 'Cancelled', class: 'badge-cancelled', icon: 'cil-x' };
                default:
                    return { label: status || 'Pending', class: 'badge-pending', icon: 'cil-clock' };
            }
        },
        exportExcel() {
            const dataToExport = this.filteredItems.map(item => ({
                'Order ID': item._id,
                'Date & Time': this.formatDate(item.createdAt),
                'Customer': item.contact ? item.contact.name : 'N/A',
                'Artwork': item.artwork && item.artwork[0] ? this.getName('en', item.artwork[0]) : 'N/A',
                'Amount': item.artwork && item.artwork[0] ? item.artwork[0].price : 0,
                'Status': this.getStatusInfo(item).label
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

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
    padding-left: 0;
    padding-right: 0;
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
    transition: transform 0.2s, background-color 0.2s;
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
}

.icon-danger {
    color: #e53e3e;
}

.icon-danger:hover {
    background-color: #ffdddd;
}

.icon-view {
    color: #a0aec0;
}

.icon-view:hover {
    background-color: #f1f9ff;
}

.icon-edit {
    color: #4299e1;
}

.icon-edit:hover {
    background-color: #ebf8ff;
}
</style>
