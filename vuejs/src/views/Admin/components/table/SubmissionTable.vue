<template>
    <CCard class="submission-table-card mb-4">
        <div>
            <CDataTable :items="items" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ item.title }}</td>
                </template>

                <template #totalStudent="{ item }">
                    <td class="text-muted">{{ item.totalStudent }}</td>
                </template>

                <template #subAssignment="{ item }">
                    <td>
                        <CBadge color="info" class="p-2">{{ item.subAssignment }}</CBadge>
                    </td>
                </template>

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
            <div class="text-muted text-sm">Showing {{ items.length }} of {{ items.length }} submissions</div>
            <div class="pagination-buttons">
                <CButton color="light" class="btn-pagination mr-2" disabled>Previous</CButton>
                <CButton color="light" class="btn-pagination">Next</CButton>
            </div>
        </CCardFooter>
    </CCard>
</template>

<script>
export default {
    name: 'SubmissionTable',
    data() {
        return {
            fields: [
                { key: 'title', label: 'SUBMISSION TITLE', _classes: 'border-top-0 border-bottom' },
                { key: 'totalStudent', label: 'TOTAL STUDENT', _classes: 'border-top-0 border-bottom' },
                { key: 'subAssignment', label: 'SUBASSIGNMENT', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            items: [
                { id: 1, title: 'Midterm Art Project', totalStudent: 45, subAssignment: 3 },
                { id: 2, title: 'Final Sculpture Exhibition', totalStudent: 30, subAssignment: 1 },
                { id: 3, title: 'Weekly Sketchbook - Week 1', totalStudent: 50, subAssignment: 0 },
                { id: 4, title: 'Color Theory Assignment', totalStudent: 48, subAssignment: 2 },
                { id: 5, title: 'Digital Art Portfolio', totalStudent: 25, subAssignment: 4 }
            ]
        }
    }
}
</script>

<style scoped>
.submission-table-card {
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
