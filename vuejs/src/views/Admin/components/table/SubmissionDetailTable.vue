<template>
    <CCard class="submission-detail-table-card mb-4">
        <div>
            <CDataTable :items="items" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

                <template #assignmentTitle="{ item }">
                    <td class="font-weight-bold text-dark">{{ item.assignmentTitle }}</td>
                </template>

                <template #datetime="{ item }">
                    <td class="text-muted">{{ item.datetime }}</td>
                </template>

                <template #deadline="{ item }">
                    <td class="text-danger font-weight-bold">{{ item.deadline }}</td>
                </template>

                <template #submission="{ item }">
                    <td>
                        <div class="d-flex align-items-center">
                            <CProgress :value="(item.submitted / item.totalStudents) * 100" class="flex-grow-1 mr-2"
                                color="success" style="height: 6px;" />
                            <span class="text-muted font-weight-bold text-sm">
                                {{ item.submitted }} / {{ item.totalStudents }}
                            </span>
                        </div>
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
            <div class="text-muted text-sm">Showing {{ items.length }} of {{ items.length }} assignments</div>
            <div class="pagination-buttons">
                <CButton color="light" class="btn-pagination mr-2" disabled>Previous</CButton>
                <CButton color="light" class="btn-pagination">Next</CButton>
            </div>
        </CCardFooter>
    </CCard>
</template>

<script>
export default {
    name: 'SubmissionDetailTable',
    data() {
        return {
            fields: [
                { key: 'assignmentTitle', label: 'ASSIGNMENT TITLE', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'datetime', label: 'DATE & TIME', _classes: 'border-top-0 border-bottom' },
                { key: 'deadline', label: 'DEADLINE', _classes: 'border-top-0 border-bottom' },
                { key: 'submission', label: 'SUBMISSION', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            items: [
                { id: 1, assignmentTitle: 'Sketch 1: Basic Shapes', datetime: 'Oct 24, 2023 10:00 AM', deadline: 'Oct 31, 2023 11:59 PM', submitted: 40, totalStudents: 45 },
                { id: 2, assignmentTitle: 'Sketch 2: Perspective', datetime: 'Nov 02, 2023 09:30 AM', deadline: 'Nov 09, 2023 11:59 PM', submitted: 35, totalStudents: 45 },
                { id: 3, assignmentTitle: 'Midterm Draft Review', datetime: 'Nov 14, 2023 02:00 PM', deadline: 'Nov 20, 2023 11:59 PM', submitted: 45, totalStudents: 45 },
                { id: 4, assignmentTitle: 'Final Presentation', datetime: 'Dec 01, 2023 08:00 AM', deadline: 'Dec 15, 2023 11:59 PM', submitted: 10, totalStudents: 45 }
            ]
        }
    }
}
</script>

<style scoped>
.submission-detail-table-card {
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

.text-danger {
    color: #e53e3e !important;
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
