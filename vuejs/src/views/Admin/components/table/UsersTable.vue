<template>
    <CCard class="database-table-card mb-4">
        <div>
            <!-- Main Data Table -->
            <CDataTable :items="users" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">

                <!-- User Name / Student ID Column -->
                <template #name_student_id="{ item }">
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle mr-3 display-5 font-weight-bold d-flex justify-content-center align-items-center"
                                :style="{ backgroundColor: getAvatarColor(item.name) }">
                                {{ getInitials(item.name) }}
                            </div>
                            <div>
                                <div class="font-weight-bold" style="color: #2c3e50;">{{ item.name }}</div>
                                <div class="small text-muted">{{ item.student_id ? `ID: ${item.student_id}` : 'NoStudent ID' }}</div>
                            </div>
                        </div>
                    </td>
                </template>

                <!-- Email Office / Personal Column -->
                <template #email_details="{ item }">
                    <td>
                        <div style="color: #2c3e50;">{{ item.email_office || '-' }}</div>
                        <div class="small text-muted">{{ item.email_personal || '-' }}</div>
                    </td>
                </template>

                <!-- Tel / Role Column -->
                <template #tel_role="{ item }">
                    <td>
                        <div class="font-weight-bold" style="color: #2c3e50;">{{ item.tel || '-' }}</div>
                        <div class="small text-muted">{{ item.role }}</div>
                    </td>
                </template>

                <!-- Status Column -->
                <template #status="{ item }">
                    <td>
                        <span :class="getStatusBadgeClass(item.status)" class="badge-custom">
                            {{ item.status }}
                        </span>
                    </td>
                </template>

                <!-- Actions Column -->
                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center action-wrapper">
                            <button class="action-btn icon-view" title="View" @click="handleView(item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit mx-2" title="Edit" @click="handleEdit(item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" title="Delete" @click="handleDelete(item)">
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>

            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm">Showing {{ users.length }} users</div>
            <div class="pagination-buttons">
                <CButton color="light" class="btn-pagination mr-2" disabled>Previous</CButton>
                <CButton color="light" class="btn-pagination">Next</CButton>
            </div>
        </CCardFooter>

        <!-- Internal Modals for Actions -->
        <CModal :show.sync="showViewModal" title="View User Detail" color="info">
            <pre v-if="selectedItem" class="bg-light p-3 rounded" style="white-space: pre-wrap;">{{ JSON.stringify(selectedItem,
                null, 2) }}</pre>
            <template #footer>
                <CButton color="secondary" @click="showViewModal = false">Close</CButton>
            </template>
        </CModal>

        <CModal :show.sync="showEditModal" title="Edit User" color="primary">
            <div v-if="selectedItem">
                <CForm>
                    <CInput label="Full Name" :value="selectedItem.name" />
                    <CInput label="Email Address" type="email" :value="selectedItem.email" />
                    <CSelect label="Role" :value="selectedItem.role"
                        :options="['Admin', 'Developer', 'Evaluator', 'Customer']" />
                    <CSelect label="Status" :value="selectedItem.status"
                        :options="['Active', 'Inactive', 'Suspended']" />
                </CForm>
            </div>
            <template #footer>
                <CButton color="secondary" @click="showEditModal = false">Cancel</CButton>
                <CButton color="primary" @click="saveEdit">Save Changes</CButton>
            </template>
        </CModal>

    </CCard>
</template>

<script>
export default {
    name: 'UsersTable',
    data() {
        return {
            showViewModal: false,
            showEditModal: false,
            selectedItem: null,

            // Fields Definition
            fields: [
                { key: 'id', label: 'USER ID', _classes: 'border-top-0 border-bottom w-10' },
                { key: 'name_student_id', label: 'NAME / STUDENT ID', _classes: 'border-top-0 border-bottom w-30' },
                { key: 'email_details', label: 'EMAIL OFFICE / PERSONAL', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'tel_role', label: 'TEL / ROLE', _classes: 'border-top-0 border-bottom w-20' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom w-10' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right w-5' }
            ],

            // Mock Data
            users: [
                { id: 'USR-001', name: 'Albus Dumbledore', student_id: '6450001', email_office: 'office@hogwarts.edu', email_personal: 'albus@gmail.com', tel: '081-234-5678', role: 'Admin', status: 'Active' },
                { id: 'USR-002', name: 'Harry Potter', student_id: '6450002', email_office: 'harry.p@student.edu', email_personal: 'harry@gmail.com', tel: '089-876-5432', role: 'Customer', status: 'Inactive' },
                { id: 'USR-003', name: 'Hermione Granger', student_id: '6450003', email_office: 'h.granger@dev.org', email_personal: 'hermione@gmail.com', tel: '090-111-2222', role: 'Developer', status: 'Active' },
                { id: 'USR-004', name: 'Severus Snape', student_id: '6450004', email_office: 'snape@evaluators.net', email_personal: 'severus@yahoo.com', tel: '061-555-4444', role: 'Evaluator', status: 'Suspended' }
            ]
        }
    },
    methods: {
        getInitials(name) {
            if (!name) return 'U';
            return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        },
        getAvatarColor(name) {
            const colors = ['#e06e64', '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#a0aec0'];
            if (!name) return colors[0];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        },
        getStatusBadgeClass(status) {
            const successStatus = ['Active'];
            const warningStatus = ['Inactive'];
            const dangerStatus = ['Suspended'];

            if (successStatus.includes(status)) return 'badge-success-soft';
            if (warningStatus.includes(status)) return 'badge-warning-soft';
            if (dangerStatus.includes(status)) return 'badge-danger-soft';
            return 'badge-secondary-soft';
        },
        handleView(item) {
            this.selectedItem = item;
            this.showViewModal = true;
        },
        handleEdit(item) {
            this.selectedItem = Object.assign({}, item); // copy
            this.showEditModal = true;
        },
        handleDelete(item) {
            if (confirm(`Are you sure you want to delete user ${item.name}?`)) {
                alert(`Deleted user: ${item.name}`);
            }
        },
        saveEdit() {
            alert(`Saved changes for user: ${this.selectedItem.name}`);
            this.showEditModal = false;
        }
    }
}
</script>

<style scoped>
.database-table-card {
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

/* Avatar */
.avatar-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 1rem;
    flex-shrink: 0;
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

.badge-danger-soft {
    background-color: #fff5f5;
    color: #e53e3e;
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
}

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
