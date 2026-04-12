<template>
    <CCard class="certification-table-card mb-4">
        <div>
            <CDataTable :items="items" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

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
                            {{ item.status }}
                        </span>
                    </td>
                </template>

                <!-- Actions -->
                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" title="View" @click="$emit('view', item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit mx-2" title="Edit" @click="$emit('edit', item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" title="Delete" @click="$emit('delete', item)">
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm">Showing {{ items.length }} of {{ items.length }} certificates</div>
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
</template>

<script>
export default {
    name: 'CertificationTable',
    data() {
        return {
            fields: [
                { key: 'certificate_name', label: 'CERTIFICATE NAME', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'created_date', label: 'CREATED DATE', _classes: 'border-top-0 border-bottom' },
                { key: 'last_modified', label: 'LAST MODIFIED', _classes: 'border-top-0 border-bottom' },
                { key: 'times_used', label: 'TIMES USED', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
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
            ]
        }
    },
    methods: {
        getStatusBadge(status) {
            if (status === 'Active') return 'badge-success-soft';
            return 'badge-secondary-soft'; // Inactive
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
    opacity: 0;
    /* Hidden by default */
}

/* Show action buttons when the table row is hovered */
::v-deep .custom-table tbody tr:hover .action-btn {
    opacity: 1;
}

::v-deep tr:hover td {
    background-color: #f8f9fa;
}

.action-btn:hover {
    transform: scale(1.15);
}

.icon-danger {
    color: #e53e3e;
}

.icon-danger:hover {
    background-color: #ffdddd;
    /* Light red bg */
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
}

.icon-edit:hover {
    background-color: #ebf8ff;
    /* Light blue bg */
}
</style>
