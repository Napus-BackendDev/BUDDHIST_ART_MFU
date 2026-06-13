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
                            <div class="avatar-circle mr-3 overflow-hidden d-flex align-items-center justify-content-center"
                                :style="!item.image ? { backgroundColor: getAvatarColor(getName('en', item) || getName('th', item)) } : {}">
                                <img v-if="item.image" :src="item.image" style="width: 100%; height: 100%; object-fit: cover;" />
                                <span v-else>{{ getInitials(getName('en', item) || getName('th', item)) }}</span>
                            </div>
                            <div>
                                <div class="font-weight-bold" style="color: #2c3e50; font-size: 0.95rem;">{{ getName($i18n.locale, item) || getName('en', item) || getName('th', item) }}</div>
                                <div class="small text-muted font-weight-bold">{{ item.studentId ? `ID: ${item.studentId}` : ($i18n.locale === 'en' ? 'No Student ID' : 'ไม่มีรหัสประจำตัวนักศึกษา') }}</div>
                            </div>
                        </div>
                    </td>
                </template>

                <!-- Email Office / Personal Column -->
                <template #email_details="{ item }">
                    <td class="py-3">
                        <template v-if="getRoleNameEn(item.role) === 'Customer'">
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
                        <div v-if="getRoleNameEn(item.role) === 'Customer'" class="status-badge status-customer">
                            <CIcon name="cil-user" size="sm" class="status-icon" />
                            {{ $i18n.locale === 'en' ? 'Customer' : 'ลูกค้า' }}
                        </div>
                        <div v-else-if="getRoleNameEn(item.role) === 'Admin' || getStatusNameEn(item.status) === 'Admin'" class="status-badge status-admin">
                            <CIcon name="cilShieldAlt" size="sm" class="status-icon" />
                            {{ $i18n.locale === 'en' ? 'Admin' : 'ผู้ดูแลระบบ' }}
                        </div>
                        <div v-else :class="['status-badge', getStatusBadge(getStatusNameEn(item.status)).class]">
                            <CIcon :name="getStatusBadge(getStatusNameEn(item.status)).icon" size="sm" class="status-icon" />
                            {{ getStatusName(item.status) }}
                        </div>
                    </td>
                </template>

                <!-- Actions Column -->
                <template #actions="{ item }">
                    <td class="text-right py-3 pr-4">
                        <div class="d-inline-flex align-items-center action-wrapper">
                            <button class="action-btn icon-view" v-c-tooltip="$i18n.locale === 'en' ? 'View' : 'ดู'" @click="handleView(item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit mx-2" v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="handleEdit(item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" v-c-tooltip="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" @click="handleDelete(item)">
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
                {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} {{ (activePage - 1) * 10 + 1 }} {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} {{ Math.min(activePage * 10, filteredUsers.length) }} {{ $i18n.locale === 'en' ? 'of' : 'จาก' }} {{ filteredUsers.length }} {{ $i18n.locale === 'en' ? 'users' : 'ผู้ใช้งาน' }}
            </div>
            <div class="text-muted text-sm" v-else>
                {{ $i18n.locale === 'en' ? 'Showing 0 users' : 'แสดง 0 ผู้ใช้งาน' }}
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
        fields() {
            return [
                { key: 'name_student_id', label: this.$i18n.locale === 'en' ? 'NAME / STUDENT ID' : 'ชื่อ / รหัสนักศึกษา', _classes: 'border-top-0 border-bottom w-30' },
                { key: 'email_details', label: this.$i18n.locale === 'en' ? 'EMAIL OFFICE / PERSONAL' : 'อีเมลสำนักงาน / ส่วนตัว', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'tel_role', label: this.$i18n.locale === 'en' ? 'TEL / ROLE' : 'เบอร์โทรศัพท์ / บทบาท', _classes: 'border-top-0 border-bottom w-20' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom w-10' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right w-5' }
            ];
        },
        ...mapGetters({
            users: 'user/user'
        }),
        filteredUsers() {
            if (!this.users) return [];
            return this.users.filter(user => {
                const name = (this.getName(this.$i18n.locale, user) || this.getName('en', user) || this.getName('th', user) || '').toLowerCase();
                const email = ((user.contact && user.contact.studentEmail) || '').toLowerCase();
                const studentId = (user.studentId || '').toLowerCase();
                const search = this.filters.search.toLowerCase();

                const searchMatch = !this.filters.search || 
                    name.includes(search) ||
                    studentId.includes(search) ||
                    email.includes(search);
                
                // Get role details for matching
                const userRoleId = (typeof user.role === 'object' && user.role) ? user.role._id : user.role;
                const userRoleNameEn = this.getRoleNameEn(user.role);
                const roleMatch = this.filters.role === 'All Roles' || 
                    userRoleId === this.filters.role || 
                    userRoleNameEn === this.filters.role;

                // Get status details for matching
                const userStatusId = (typeof user.status === 'object' && user.status) ? user.status._id : user.status;
                const userStatusNameEn = this.getStatusNameEn(user.status);
                const statusMatch = this.filters.status === 'All Status' || 
                    userStatusId === this.filters.status || 
                    userStatusNameEn === this.filters.status;

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
            const userName = this.getName(this.$i18n.locale, item) || this.getName('en', item) || this.getName('th', item);
            const confirmMsg = this.$i18n.locale === 'en' 
                ? `Are you sure you want to delete user ${userName}?` 
                : `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งาน ${userName}?`;
            if (confirm(confirmMsg)) {
                this.$emit('delete', item);
            }
        },
        getRoleName(role) {
            if (!role) return 'User';
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const lang = this.$i18n.locale || 'en';
                const titleLang = role.title.find(t => t.key === lang) || role.title.find(t => t.key === 'en');
                return titleLang ? titleLang.value : (role.title[0] ? role.title[0].value : 'Unknown');
            }
            return 'User';
        },
        getRoleNameEn(role) {
            if (!role) return 'User';
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const titleLang = role.title.find(t => t.key === 'en');
                return titleLang ? titleLang.value : (role.title[0] ? role.title[0].value : 'Unknown');
            }
            return 'User';
        },
        getStatusName(status) {
            if (!status) return 'Admin';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const lang = this.$i18n.locale || 'en';
                const titleLang = status.title.find(t => t.key === lang) || status.title.find(t => t.key === 'en');
                return titleLang ? titleLang.value : (status.title[0] ? status.title[0].value : 'Unknown');
            }
            return 'Admin';
        },
        getStatusNameEn(status) {
            if (!status) return 'Admin';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const titleLang = status.title.find(t => t.key === 'en');
                return titleLang ? titleLang.value : (status.title[0] ? status.title[0].value : 'Unknown');
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
