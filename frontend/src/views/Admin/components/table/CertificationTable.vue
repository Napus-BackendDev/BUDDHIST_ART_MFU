<template>
    <CCard class="certification-table-card mb-4">
        <div>
            <CDataTable :items="sortedItems" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="itemsPerPage" :active-page="activePage" @page-change="pageChange">

                <!-- Certificate Name -->
                <template #certificate_name="{ item }">
                    <td class="font-weight-bold" style="color: #2c3e50;">{{ item.certificate_name }}</td>
                </template>

                <!-- Created Date -->
                <template #created_date="{ item }">
                    <td class="text-muted">{{ item.created_date }}</td>
                </template>

                <!-- Last Modified -->
                <template #last_modified="{ item }">
                    <td class="text-muted">{{ item.last_modified }}</td>
                </template>

                <!-- Times Used -->
                <template #times_used="{ item }">
                    <td class="font-weight-bold" style="color: #495057;">{{ item.times_used }}</td>
                </template>

                <!-- Status -->
                <template #status="{ item }">
                    <td>
                        <span :class="getStatusBadge(item.status)" class="badge-custom">
                            {{ item.status === 'Active' ? ($i18n.locale === 'en' ? 'Active' : 'ใช้งานอยู่') : ($i18n.locale === 'en' ? 'Inactive' : 'ไม่ได้ใช้งาน') }}
                        </span>
                    </td>
                </template>

                <!-- Actions -->
                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" :title="$i18n.locale === 'en' ? 'View' : 'ดู'" @click="$emit('view', item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit mx-2" :title="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="$emit('edit', item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" :title="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" @click="$emit('delete', item)">
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <TablePaginationFooter :total="items.length" :active-page.sync="activePage" :items-per-page.sync="itemsPerPage" noun-en="certificates" noun-th="ใบรับรอง" />
    </CCard>
</template>

<script>
import TablePaginationFooter from './TablePaginationFooter.vue'
export default {
    name: 'CertificationTable',
    components: { TablePaginationFooter },
    data() {
        return {
            items: [
                {
                    id: 1,
                    certificate_name: 'Introduction to Acrylics',
                    created_date: 'Sep 10, 2023',
                    last_modified: 'Oct 05, 2023',
                    times_used: 124,
                    status: 'Active'
                },
                {
                    id: 2,
                    certificate_name: 'Advanced Watercolor Techniques',
                    created_date: 'Aug 22, 2023',
                    last_modified: 'Sep 15, 2023',
                    times_used: 89,
                    status: 'Active'
                },
                {
                    id: 3,
                    certificate_name: 'Digital Art Fundamentals',
                    created_date: 'Jul 04, 2023',
                    last_modified: 'Jul 10, 2023',
                    times_used: 350,
                    status: 'Inactive'
                },
                {
                    id: 4,
                    certificate_name: 'Portrait Drawing Masterclass',
                    created_date: 'Oct 01, 2023',
                    last_modified: 'Oct 20, 2023',
                    times_used: 12,
                    status: 'Active'
                },
                {
                    id: 5,
                    certificate_name: 'Sculpture & Pottery 101',
                    created_date: 'Jan 15, 2023',
                    last_modified: 'Feb 28, 2023',
                    times_used: 0,
                    status: 'Inactive'
                }
            ],
            activePage: 1,
            itemsPerPage: 10
        }
    },
    computed: {
        fields() {
            return [
                { key: 'certificate_name', label: this.$i18n.locale === 'en' ? 'CERTIFICATE NAME' : 'ชื่อใบรับรอง', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'created_date', label: this.$i18n.locale === 'en' ? 'CREATED DATE' : 'วันที่สร้าง', _classes: 'border-top-0 border-bottom' },
                { key: 'last_modified', label: this.$i18n.locale === 'en' ? 'LAST MODIFIED' : 'แก้ไขล่าสุด', _classes: 'border-top-0 border-bottom' },
                { key: 'times_used', label: this.$i18n.locale === 'en' ? 'TIMES USED' : 'จำนวนครั้งที่ใช้', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },
        sortedItems() {
            const moment = require('moment');
            return [...this.items].sort((a, b) => {
                const dateA = moment(a.created_date, 'MMM DD, YYYY');
                const dateB = moment(b.created_date, 'MMM DD, YYYY');
                return dateB - dateA;
            });
        }
    },
    methods: {
        getStatusBadge(status) {
            if (status === 'Active') return 'badge-success-soft';
            return 'badge-secondary-soft'; // Inactive
        },
        pageChange(val) {
            this.activePage = val;
        }
    }
}
</script>

<style scoped>
.certification-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
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

/* Badges */
.badge-custom {
    padding: 0.4em 0.8em;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge-success-soft {
    background-color: #e6f6ed;
    color: #27a768;
}

.badge-warning-soft {
    background-color: #fff8e6;
    color: #e6a23c;
}

.badge-secondary-soft {
    background-color: #f1f3f5;
    color: #6c757d;
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

</style>
