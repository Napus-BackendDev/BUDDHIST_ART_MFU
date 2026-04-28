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

                <!-- ID Column -->
                <template #id="{ item }">
                    <td class="py-3">
                        <span class="font-weight-bold" style="color: #4f5d73;">{{ item.studentId || 'N/A' }}</span>
                    </td>
                </template>

                <!-- User Name / Student ID Column -->
                <template #name_student_id="{ item }">
                    <td class="py-3">
                        <div class="d-flex align-items-center">
                            <div class="avatar-circle mr-3"
                                :style="{ backgroundColor: getAvatarColor(getName(item, 'en') || getName(item, 'th')) }">
                                {{ getInitials(getName(item, 'en') || getName(item, 'th')) }}
                            </div>
                            <div>
                                <div class="font-weight-bold" style="color: #2c3e50; font-size: 0.95rem;">{{ getName(item, 'en') || getName(item, 'th') }}</div>
                                <div class="small text-muted font-weight-bold">{{ item.studentId ? `ID: ${item.studentId}` : 'No Student ID' }}</div>
                            </div>
                        </div>
                    </td>
                </template>

                <!-- Email Office / Personal Column -->
                <template #email_details="{ item }">
                    <td class="py-3">
                        <div class="font-weight-bold" style="color: #4f5d73; font-size: 0.9rem;">{{ (item.contact && item.contact.studentEmail) || '-' }}</div>
                        <div class="small text-muted font-weight-bold text-truncate" style="max-width: 180px;">{{ (item.contact && item.contact.personalEmail) || '-' }}</div>
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
                        <div :class="['status-badge', getStatusBadge(item.status).class]">
                            <CIcon :name="getStatusBadge(item.status).icon" size="sm" class="status-icon" />
                            {{ getStatusName(item.status) }}
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
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
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

export default {
    name: 'UsersTable',
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
                { key: 'id', label: 'USER ID', _classes: 'border-top-0 border-bottom w-10' },
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
                const name = (this.getName(user, 'en') || this.getName(user, 'th') || '').toLowerCase();
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
        getStatusBadge(status) {
            const name = this.getStatusName(status);
            if (name === 'Admin') return { class: 'badge-admin', icon: 'cil-shield-check' };
            if (name === 'Active' || name === 'NewStudent') return { class: 'badge-passed', icon: 'cil-check-circle' };
            if (name === 'Suspended') return { class: 'badge-fail', icon: 'cil-x-circle' };
            if (name === 'OldStudent') return { class: 'badge-secondary-status', icon: 'cil-clock' };
            return { class: 'badge-pending', icon: 'cil-clock' }; // Inactive or others
        },
        handleView(item) {
            this.$emit('view', item);
        },
        handleEdit(item) {
            this.$emit('edit', item);
        },
        handleDelete(item) {
            if (confirm(`Are you sure you want to delete user ${this.getName(item, 'en') || this.getName(item, 'th')}?`)) {
                this.$emit('delete', item);
            }
        },
        getName(user, lang) {
            if (!user || !user.name) return '';
            if (typeof user.name === 'string') return user.name;
            if (Array.isArray(user.name)) {
                const nameObj = user.name.find(n => n.key === lang);
                return nameObj ? nameObj.value : (user.name[0] ? user.name[0].value : '');
            }
            return '';
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
    color: #4f5d73;
}

.custom-table tr:last-child td {
    border-bottom: none;
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

/* Badges */
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.3px;
    white-space: nowrap;
}

.status-icon {
    width: 14px;
    height: 14px;
    margin-right: 6px;
}

.badge-passed {
    color: #38a169;
    background-color: #f0fff4;
    border: 1px solid rgba(56, 161, 105, 0.4);
}

.badge-pending {
    color: #d69e2e;
    background-color: #fffaf0;
    border: 1px solid rgba(214, 158, 46, 0.4);
}

.badge-fail {
    color: #e53e3e;
    background-color: #fff5f5;
    border: 1px solid rgba(229, 62, 62, 0.4);
}

.badge-secondary-status {
    color: #718096;
    background-color: #f7fafc;
    border: 1px solid rgba(113, 128, 150, 0.4);
}

.badge-admin {
    color: #3182ce;
    background-color: #ebf8ff;
    border: 1px solid rgba(49, 130, 206, 0.4);
}

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
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
}

/* Action Buttons */
.action-btn {
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    outline: none;
}

.icon-view { color: #a0aec0; }
.icon-edit { color: #4299e1; }
.icon-danger { color: #e53e3e; }

.action-btn:hover {
    transform: scale(1.15);
    background-color: #f8f9fa;
}

::v-deep tr:hover td {
    background-color: #f8f9fa;
}

::v-deep .custom-table th {
    border-bottom: 2px solid #f1f5f9;
}
</style>
