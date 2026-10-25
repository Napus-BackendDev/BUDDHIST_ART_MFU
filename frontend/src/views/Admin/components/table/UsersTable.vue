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
                :no-items-view="{ noItems: $i18n.locale === 'en' ? 'No users found' : 'ไม่พบผู้ใช้งาน' }"
                @page-change="pageChange"
            >
                <!-- User Name / Student ID Column -->
                <template #name_student_id="{ item }">
                    <td class="py-3">
                        <div class="d-flex align-items-center">
                            <a v-if="item.image && !failedImages[item._id]" :href="getImageUrl(item.image)" target="_blank" class="avatar-circle mr-3 overflow-hidden d-flex align-items-center justify-content-center" style="cursor: pointer; text-decoration: none;">
                                <img :src="getImageUrl(item.image)" style="width: 100%; height: 100%; object-fit: cover;" @error="handleImageError(item._id)" />
                            </a>
                            <div v-else class="avatar-circle mr-3 overflow-hidden d-flex align-items-center justify-content-center"
                                :style="{ backgroundColor: getAvatarColor(getName('en', item) || getName('th', item)) }">
                                <span>{{ getInitials(getName('en', item) || getName('th', item)) }}</span>
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
                        <div class="small text-muted font-weight-bold">{{ getRoleBadge(item.role).label }}</div>
                    </td>
                </template>

                <!-- Learner status is separate from the account role. -->
                <template #status="{ item }">
                    <td class="py-3">
                        <div :class="['status-badge', getStatusBadge(getStatusNameEn(item.status)).class]">
                            <CIcon :name="getStatusBadge(getStatusNameEn(item.status)).icon" size="sm" class="status-icon" />
                            {{ getStatusName(item.status) }}
                        </div>
                        <div v-if="item.course" class="small text-muted font-weight-bold mt-1 course-tag">{{ courseText(item.course) }}</div>
                    </td>
                </template>
                <template #role="{ item }">
                    <td class="py-3">
                        <div :class="['status-badge', getRoleBadge(item.role).class]">
                            <CIcon :name="getRoleBadge(item.role).icon" size="sm" class="status-icon" />
                            {{ getRoleBadge(item.role).label }}
                        </div>
                    </td>
                </template>

                <!-- Registered Column -->
                <template #createdAt="{ item }">
                    <td class="text-muted text-sm py-3">
                        <div>{{ formatDate(item.createdAt) }}</div>
                        <div class="small mt-1">{{ formatTime(item.createdAt) }}</div>
                    </td>
                </template>

                <!-- Actions Column -->
                <template #actions="{ item }">
                    <td class="text-right py-3 pr-4">
                        <div class="d-inline-flex align-items-center action-wrapper">
                            <button type="button" class="action-btn icon-view" :aria-label="($i18n.locale === 'en' ? 'View user: ' : 'ดูผู้ใช้: ') + (getName($i18n.locale, item) || getName('en', item) || item.studentId)" v-c-tooltip="$i18n.locale === 'en' ? 'View' : 'ดู'" @click="handleView(item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button type="button" class="action-btn icon-edit mx-2" :aria-label="($i18n.locale === 'en' ? 'Edit user: ' : 'แก้ไขผู้ใช้: ') + (getName($i18n.locale, item) || getName('en', item) || item.studentId)" v-c-tooltip="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="handleEdit(item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button type="button" class="action-btn icon-danger" :aria-label="($i18n.locale === 'en' ? 'Delete user: ' : 'ลบผู้ใช้: ') + (getName($i18n.locale, item) || getName('en', item) || item.studentId)" v-c-tooltip="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" @click="handleDelete(item)">
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
    </CCard>
</template>

<script>
import { mapGetters } from 'vuex';
import { statusBadgeMixin } from '@/mixins/statusBadgeMixin';
import { normalizeCourse, courseLabel } from '@/utils/courses';

export default {
    name: 'UsersTable',
    mixins: [statusBadgeMixin],
    props: {
        filters: {
            type: Object,
            default: () => ({
                search: '',
                role: 'All Roles',
                status: 'All Status',
                course: 'All Courses'
            })
        }
    },
    data() {
        return {
            activePage: 1,
            failedImages: {}
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
                { key: 'name_student_id', label: this.$i18n.locale === 'en' ? 'NAME / STUDENT ID' : 'ชื่อ / รหัสนักศึกษา', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'email_details', label: this.$i18n.locale === 'en' ? 'EMAIL OFFICE / PERSONAL' : 'อีเมลสำนักงาน / ส่วนตัว', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'tel_role', label: this.$i18n.locale === 'en' ? 'TEL / ROLE' : 'เบอร์โทรศัพท์ / บทบาท', _classes: 'border-top-0 border-bottom w-15' },
                { key: 'createdAt', label: this.$i18n.locale === 'en' ? 'REGISTERED' : 'วันที่สมัคร', _classes: 'border-top-0 border-bottom w-15' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom w-10' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right w-5' }
            ];
        },
        ...mapGetters({
            users: 'user/user'
        }),
        filteredUsers() {
            if (!this.users) return [];
            const list = this.users.filter(user => {
                const name = (this.getName(this.$i18n.locale, user) || this.getName('en', user) || this.getName('th', user) || '').toLowerCase();
                const email = ((user.contact && user.contact.studentEmail) || (user.contact && user.contact.personalEmail) || '').toLowerCase();
                const studentId = (user.studentId || '').toLowerCase();
                const search = this.filters.search.toLowerCase();

                const searchMatch = !this.filters.search ||
                    name.includes(search) ||
                    studentId.includes(search) ||
                    email.includes(search);

                // Get role details for matching
                const userRoleId = (typeof user.role === 'object' && user.role) ? user.role._id : user.role;
                const userRoleNameEn = this.getRoleNameEn(user.role);
                const selectedRole = (this.filters.role || '').toLowerCase();
                const roleMatch = !this.filters.role ||
                    this.filters.role === 'All Roles' ||
                    (userRoleId && String(userRoleId) === this.filters.role) ||
                    (userRoleNameEn && userRoleNameEn.toLowerCase() === selectedRole);

                // Get status details for matching
                const userStatusId = (typeof user.status === 'object' && user.status) ? user.status._id : user.status;
                const userStatusNameEn = this.getStatusNameEn(user.status);
                const userStatusCode = (typeof user.status === 'object' && user.status && user.status.code) ? user.status.code : '';
                const selectedStatus = (this.filters.status || '').toLowerCase();
                const statusMatch = !this.filters.status ||
                    this.filters.status === 'All Status' ||
                    (userStatusId && String(userStatusId) === this.filters.status) ||
                    (userStatusNameEn && userStatusNameEn.toLowerCase() === selectedStatus) ||
                    (userStatusCode && userStatusCode.toLowerCase() === selectedStatus) ||
                    (selectedStatus === 'newstudent' && (userStatusNameEn.toLowerCase().includes('new') || userStatusCode.toLowerCase().includes('new'))) ||
                    (selectedStatus === 'oldstudent' && (userStatusNameEn.toLowerCase().includes('old') || userStatusCode.toLowerCase().includes('old')));

                const courseMatch = !this.filters.course || this.filters.course === 'All Courses' ||
                    normalizeCourse(user.course) === this.filters.course;

                return searchMatch && roleMatch && statusMatch && courseMatch;
            });
            return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
    },
    methods: {
        courseText(course) {
            return courseLabel(course, this.$i18n.locale);
        },
        handleImageError(id) {
            this.$set(this.failedImages, id, true);
        },
        getImageUrl(image) {
            if (!image) return '';
            if (image.startsWith('http://') || image.startsWith('https://')) {
                return image;
            }
            const baseUrl = process.env.VUE_APP_API_URL || window.location.origin;
            return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
        },
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
        getRoleNameEn(role) {
            if (!role) return 'Customer';
            if (typeof role === 'string') {
                const r = role.toLowerCase();
                if (r.includes('admin') || r.includes('ผู้ดูแลระบบ')) return 'Admin';
                if (r.includes('artist') || r.includes('ศิลปิน')) return 'Artist';
                if (r.includes('customer') || r.includes('ลูกค้า') || r.includes('user')) return 'Customer';
                return role;
            }
            if (typeof role === 'object') {
                if (role.code) {
                    const c = String(role.code).toUpperCase();
                    if (c === 'ADMIN') return 'Admin';
                    if (c === 'ARTIST') return 'Artist';
                    if (c === 'CUSTOMER' || c === 'USER') return 'Customer';
                }
                if (role.name) {
                    const n = String(role.name).toLowerCase();
                    if (n.includes('admin') || n.includes('ผู้ดูแลระบบ')) return 'Admin';
                    if (n.includes('artist') || n.includes('ศิลปิน')) return 'Artist';
                    if (n.includes('customer') || n.includes('user') || n.includes('ลูกค้า')) return 'Customer';
                }
                if (Array.isArray(role.title)) {
                    const en = role.title.find(t => t.key === 'en')?.value || '';
                    const th = role.title.find(t => t.key === 'th')?.value || '';
                    const combined = (en + ' ' + th).toLowerCase();
                    if (combined.includes('admin') || combined.includes('ผู้ดูแลระบบ')) return 'Admin';
                    if (combined.includes('artist') || combined.includes('ศิลปิน')) return 'Artist';
                    if (combined.includes('customer') || combined.includes('user') || combined.includes('ลูกค้า')) return 'Customer';
                    return en || (role.title[0] ? role.title[0].value : 'Customer');
                }
            }
            return 'Customer';
        },
        getRoleBadge(role) {
            const roleEn = this.getRoleNameEn(role);
            if (roleEn === 'Admin') {
                return {
                    class: 'status-admin',
                    icon: 'cilShieldAlt',
                    label: this.$i18n.locale === 'en' ? 'Admin' : 'ผู้ดูแลระบบ'
                };
            }
            if (roleEn === 'Artist') {
                return {
                    class: 'status-artist',
                    icon: 'cil-brush',
                    label: this.$i18n.locale === 'en' ? 'Artist' : 'ศิลปิน'
                };
            }
            return {
                class: 'status-customer',
                icon: 'cil-user',
                label: this.$i18n.locale === 'en' ? 'Customer' : 'ลูกค้า'
            };
        },
        getStatusName(status) {
            if (!status) return 'Active';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const lang = this.$i18n.locale || 'en';
                const titleLang = status.title.find(t => t.key === lang) || status.title.find(t => t.key === 'en');
                return titleLang ? titleLang.value : (status.title[0] ? status.title[0].value : 'Unknown');
            }
            return 'Active';
        },
        getStatusNameEn(status) {
            if (!status) return 'Active';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const titleLang = status.title.find(t => t.key === 'en');
                return titleLang ? titleLang.value : (status.title[0] ? status.title[0].value : 'Unknown');
            }
            return 'Active';
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
    padding: 0.35rem 0.85rem;
    border-radius: 50px;
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.2px;
}

.status-icon {
    margin-right: 0.4rem;
}

.status-admin {
    background-color: #e0f2fe;
    color: #0369a1;
    border: 1px solid #bae6fd;
}

.status-artist {
    background-color: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
}

.status-customer {
    background-color: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
}
</style>
