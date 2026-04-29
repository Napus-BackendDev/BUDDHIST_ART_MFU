<template>
    <CCard class="database-table-card mb-4">
        <div>
            <!-- Main Data Table -->
            <CDataTable 
                :items="filteredUsers" 
                :fields="fields" 
                class="custom-table mb-0" 
                hover 
                :border="false"
                :striped="false"
                :items-per-page="10"
                :active-page="activePage"
                @page-change="pageChange"
            >



                <!-- User Name / Student ID Column -->
                <template #name_student_id="{ item }">
                    <td class="py-3">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle mr-3"
                                :style="{ backgroundColor: getAvatarColor(getName('en', item) || getName('th', item)) }">
                                {{ getInitials(getName('en', item) || getName('th', item)) }}
                            </div>
                            <div>
                                <div class="font-weight-bold" style="color: #2c3e50; font-size: 0.95rem;">{{ getName('en', item) || getName('th', item) }}</div>
                                <div class="small text-muted font-weight-bold">{{ item.studentId ? `ID: ${item.studentId}` : 'No Student ID' }}</div>
                            </div>
                        </div>
                    </td>
                </template>

                <!-- Email Office / Personal Column -->
                <template #email_details="{ item }">
                    <td class="py-3">
                        <template v-if="getRoleName(item.role) === 'Customer'">
                            <div class="font-weight-bold" style="color: #4f5d73; font-size: 0.9rem;">{{ (item.contact && item.contact.personalEmail) || '-' }}</div>
                        </template>
                        <template v-else>
                            <div class="font-weight-bold" style="color: #4f5d73; font-size: 0.9rem;">{{ (item.contact && item.contact.studentEmail) || '-' }}</div>
                            <div class="small text-muted font-weight-bold text-truncate" style="max-width: 180px;">{{ (item.contact && item.contact.personalEmail) || '-' }}</div>
                        </template>
                    </td>
                </template>

                <!-- Tel / Role Column -->
                <template #tel_role="{ item }">
                    <td class="py-3">
                        <div class="font-weight-bold" style="color: #2c3e50; font-size: 0.95rem;">{{ (item.contact && item.contact.telephone) || '-' }}</div>
                        <div class="small text-muted font-weight-bold">{{ getRoleName(item.role) }}</div>
                    </td>
                </template>

                <!-- Status Column -->
                <template #status="{ item }">
                    <td class="py-3">
                        <div v-if="getRoleName(item.role) === 'Customer'" class="status-badge status-customer">
                            <CIcon name="cil-user" size="sm" class="status-icon" />
                            Customer
                        </div>
                        <div v-else-if="getRoleName(item.role) === 'Admin' || getStatusName(item.status) === 'Admin'" class="status-badge status-admin">
                            <CIcon name="cilShieldAlt" size="sm" class="status-icon" />
                            Admin
                        </div>
                        <div v-else :class="['status-badge', getStatusBadge(getStatusName(item.status)).class]">
                            <CIcon :name="getStatusBadge(getStatusName(item.status)).icon" size="sm" class="status-icon" />
                            {{ getStatusBadge(getStatusName(item.status)).label }}
                        </div>
                    </td>
                </template>

                <!-- Actions Column -->
                <template #actions="{ item }">
                    <td class="text-right py-3 pr-4">
                        <div class="d-inline-flex align-items-center action-wrapper">
                            <button class="action-btn icon-view" v-c-tooltip="'View'" @click="handleView(item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit mx-2" v-c-tooltip="'Edit'" @click="handleEdit(item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" v-c-tooltip="'Delete'" @click="handleDelete(item)">
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="filteredUsers.length > 0">
                Showing {{ (activePage - 1) * 10 + 1 }} to {{ Math.min(activePage * 10, filteredUsers.length) }} of {{ filteredUsers.length }} users
            </div>
            <div class="text-muted text-sm" v-else>
                Showing 0 users
            </div>
            <CPagination
                :active-page.sync="activePage"
                :pages="Math.max(1, Math.ceil(filteredUsers.length / 10))"
                size="sm"
                align="end"
                class="mb-0 pill-pagination"
            />
        </CCardFooter>

        <!-- Modals removed - events are now handled by parent -->
    </CCard>
</template>

<script>
import { mapGetters } from 'vuex';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';

export default {
    name: 'UsersTable',
    mixins: [statusBadgeMixin],
    props: {
        filters: {
            type: Object,
            default: () => ({
                search: '',
                role: 'All Roles',
                status: 'All Status'
            })
        }
    },
    data() {
        return {
            // Fields Definition
            fields: [

                { key: 'name_student_id', label: 'NAME / STUDENT ID', _classes: 'border-top-0 border-bottom w-30' },
                { key: 'email_details', label: 'EMAIL OFFICE / PERSONAL', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'tel_role', label: 'TEL / ROLE', _classes: 'border-top-0 border-bottom w-20' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom w-10' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right w-5' }
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
        ...mapGetters({
            users: 'user/user'
        }),
        filteredUsers() {
            if (!this.users) return [];
            return this.users.filter(user => {
                const name = (this.getName('en', user) || this.getName('th', user) || '').toLowerCase();
                const email = ((user.contact && user.contact.studentEmail) || '').toLowerCase();
                const studentId = (user.studentId || '').toLowerCase();
                const search = this.filters.search.toLowerCase();

                const searchMatch = !this.filters.search || 
                    name.includes(search) ||
                    studentId.includes(search) ||
                    email.includes(search);
                
                const roleMatch = this.filters.role === 'All Roles' || this.getRoleName(user.role) === this.filters.role;
                const statusMatch = this.filters.status === 'All Status' || this.getStatusName(user.status) === this.filters.status;

                return searchMatch && roleMatch && statusMatch;
            });
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
        handleView(item) {
            this.$emit('view', item);
        },
        handleEdit(item) {
            this.$emit('edit', item);
        },
        handleDelete(item) {
            if (confirm(`Are you sure you want to delete user ${this.getName('en', item) || this.getName('th', item)}?`)) {
                this.$emit('delete', item);
            }
        },
        getRoleName(role) {
            if (!role) return 'User';
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const titleEn = role.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (role.title[0] ? role.title[0].value : 'Unknown');
            }
            return 'User';
        },
        getStatusName(status) {
            if (!status) return 'Admin';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const titleEn = status.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (status.title[0] ? status.title[0].value : 'Unknown');
            }
            return 'Admin';
        },
        pageChange(val) {
            this.activePage = val;
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

/* Avatar */
.avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
}

.status-icon {
    margin-right: 0.4rem;
}

.status-customer {
    background-color: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
}

.status-admin {
    background-color: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
}
</style>
