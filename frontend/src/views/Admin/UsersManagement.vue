<template>
    <div class="users-management-dashboard">
        <HeaderHero 
            :title="$i18n.locale === 'en' ? 'User Management' : 'จัดการผู้ใช้งาน'" 
            :description="$i18n.locale === 'en' ? 'Manage system users, roles, and permissions effectively. Support for manual entry and bulk import.' : 'จัดการผู้ใช้งาน ระบบบทบาท และสิทธิ์การเข้าถึง รองรับการเพิ่มข้อมูลด้วยตนเองและนำเข้าแบบกลุ่ม'" 
            :createButtonText="$i18n.locale === 'en' ? 'Create User' : 'เพิ่มผู้ใช้งาน'"
            icon="cil-people"
            :showCreateButton="canEdit && !usersLoading && !usersLoadError"
            :showExportButton="!usersLoading && !usersLoadError"
            themeColor="red"
            @create="showChoiceModal = true"
            @export="exportToExcel"
        />

        <div v-if="!canEdit" class="alert alert-warning d-flex align-items-center mb-3" role="note">
            <CIcon name="cil-lock-locked" class="mr-2" />
            <span>{{ $i18n.locale === 'en' ? 'View-Only access: creating, editing, importing, or deleting users is disabled.' : 'สิทธิ์ดูอย่างเดียว (View Only): ไม่สามารถเพิ่ม แก้ไข นำเข้า หรือลบผู้ใช้งานได้' }}</span>
        </div>

        <p v-if="usersLoading" role="status" class="alert alert-info">
            {{ $i18n.locale === 'en' ? 'Loading users...' : 'กำลังโหลดข้อมูลผู้ใช้...' }}
        </p>
        <div v-else-if="usersLoadError" role="alert" class="alert alert-warning">
            <p>{{ usersLoadMessage }}</p>
            <CButton color="warning" :disabled="usersRetryNow < usersRetryAt" @click="fetchUsers">
                {{ $i18n.locale === 'en' ? 'Try again' : 'ลองใหม่' }}
            </CButton>
        </div>
        <template v-else>
        <UserWidget v-model="filters.status" :currentRole.sync="filters.role" :roles="roles" />

        <UserFilter v-model="filters" :roles="roles" :statuses="studentStatuses" />

        <UsersTable 
            ref="usersTable" 
            :filters="filters" 
            :roles="roles"
            :read-only="!canEdit"
            @view="handleViewUser"
            @edit="handleEditUser"
            @delete="handleDeleteUser"
        />
        </template>

        <!-- Choice Modal -->
        <UserCreateChoiceModal 
            :show.sync="showChoiceModal"
            @manual="handleManualChoice"
            @import="handleFileUpload"
            @download-template="downloadTemplate"
        />

        <UserCreateModal 
            :show.sync="showManualImportModal"
            :roles="roles"
            :statuses="studentStatuses"
            :saving="saving"
            :error="createError"
            @save="handleSaveUser"
        />

        <!-- View User Modal -->
        <UserViewModal 
            :show.sync="showViewModal"
            :user="selectedUser"
            :read-only="!canEdit"
            @edit="handleEditUser"
        />

        <!-- Edit User Modal -->
        <UserEditModal 
            :show.sync="showEditModal"
            :user="selectedUser"
            :roles="roles"
            :statuses="studentStatuses"
            :saving="saving"
            @save="handleUpdateUser"
        />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as XLSX from 'xlsx';
import UsersTable from './components/table/UsersTable.vue';
import UserWidget from './components/widget/UserWidget.vue';
import UserFilter from './components/filter/UserFilter.vue';
import HeaderHero from './components/HeaderHero.vue';
import UserCreateChoiceModal from './components/modal/user/UserCreateChoiceModal.vue';
import UserCreateModal from './components/modal/user/UserCreateModal.vue';
import UserViewModal from './components/modal/user/UserViewModal.vue';
import UserEditModal from './components/modal/user/UserEditModal.vue';
import { normalizeArtistContact, normalizeStudentId, isArtistRole } from '@/utils/officialEmail';
import { dedupeRoles, dedupeStatuses, resolveLocalizedTitle, getRoleDisplayLabel, resolveUserStatusMeta } from '@/utils/roles';
import { learnerImportHeaders, learnerImportRow, resolveLearnerImportStatus, courseByNameFromSheets, courseForLearner } from '@/utils/learnerImport';
import { courseLabel } from '@/utils/courses';
import { retryAtFromHeaders } from '@/utils/rateLimit';
import { hasTabPermission } from '@/utils/permissions';

export default {
    name: 'UsersManagement',
    components: {
        UsersTable,
        UserWidget,
        UserFilter,
        HeaderHero,
        UserCreateChoiceModal,
        UserCreateModal,
        UserViewModal,
        UserEditModal
    },
    data() {
        return {
            showChoiceModal: false,
            showManualImportModal: false,
            showViewModal: false,
            showEditModal: false,
            selectedUser: null,
            saving: false,
            createError: '',
            usersLoading: false,
            usersLoadError: '',
            usersRetryAt: 0,
            usersRetryNow: 0,
            usersRetryTimer: null,
            filters: {
                search: '',
                role: 'All Roles',
                status: 'All Status',
                course: 'All Courses'
            }
        }
    },
    computed: {
        canEdit() {
            return hasTabPermission(this, 'users', 'edit');
        },
        usersLoadMessage() {
            if (this.usersLoadError === 'rate') return this.$i18n.locale === 'en'
                ? 'Too many requests. Please wait before retrying.'
                : 'มีคำขอถี่เกินกำหนด กรุณารอก่อนลองใหม่';
            return this.$i18n.locale === 'en'
                ? 'Unable to load users. Please try again.'
                : 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองใหม่';
        },
        ...mapGetters({
            rawRoles: 'setting/roles/item',
            isRolesReload: 'setting/roles/isReload',
            rawStatuses: 'setting/status/item'
        }),
        roles() {
            if (!this.rawRoles || !Array.isArray(this.rawRoles)) return [];
            const lang = this.$i18n.locale || 'en';
            const mapped = this.rawRoles.map(r => {
                if (!r.title || !Array.isArray(r.title)) return null;
                const name = resolveLocalizedTitle(r, lang);
                const nameEn = resolveLocalizedTitle(r, 'en') || name;
                return { _id: r._id, name, nameEn, code: r.code, title: r.title };
            }).filter(role => role && role.name && role.nameEn);
            return dedupeRoles(mapped);
        },
        studentStatuses() {
            if (!this.rawStatuses || !Array.isArray(this.rawStatuses)) return [];
            const mapped = this.rawStatuses.filter(s => {
                if (!s.group || !s.group.title || !Array.isArray(s.group.title)) return false;
                const groupTitleEn = s.group.title.find(t => t.key === 'en');
                return groupTitleEn && groupTitleEn.value === 'Student Group';
            }).map(s => {
                if (!s.title || !Array.isArray(s.title)) return null;
                const lang = this.$i18n.locale || 'en';
                const titleLang = s.title.find(t => t.key === lang) || s.title.find(t => t.key === 'en');
                const name = titleLang ? titleLang.value : (s.title[0] ? s.title[0].value : 'Unknown');
                const titleEn = s.title.find(t => t.key === 'en');
                const nameEn = titleEn ? titleEn.value : 'Unknown';
                return { _id: s._id, name, nameEn, code: s.code };
            }).filter(s => s && s.nameEn !== 'Unknown');
            return dedupeStatuses(mapped);
        }
    },
    watch: {
        isRolesReload(val) {
            if (val) {
                this.fetchRoles();
                this.$store.commit('setting/roles/isReload', false);
            }
        }
    },
    created() {
        this.fetchUsers();
    },
    beforeDestroy() {
        clearTimeout(this.usersRetryTimer);
    },
    methods: {
        async fetchUsers() {
            if (this.usersLoading || Date.now() < this.usersRetryAt) return;
            this.usersLoading = true;
            this.usersLoadError = '';
            try {
                await Promise.all([
                    this.$store.dispatch('user/get', {}),
                    this.fetchRoles(),
                    this.fetchStatuses()
                ]);
            } catch (error) {
                this.usersLoadError = error.response?.status === 429 ? 'rate' : 'load';
                if (this.usersLoadError === 'rate') {
                    this.usersRetryAt = retryAtFromHeaders(error.response.headers);
                    this.usersRetryNow = Date.now();
                    clearTimeout(this.usersRetryTimer);
                    this.usersRetryTimer = setTimeout(() => {
                        this.usersRetryNow = Date.now();
                    }, Math.max(0, this.usersRetryAt - Date.now()));
                }
            } finally {
                this.usersLoading = false;
            }
        },
        fetchRoles() {
            return this.$store.dispatch('setting/roles/config', {});
        },
        fetchStatuses() {
            return this.$store.dispatch('setting/status/get', {});
        },
        handleViewUser(user) {
            this.selectedUser = user;
            this.showViewModal = true;
        },
        handleEditUser(user) {
            this.selectedUser = user;
            this.showViewModal = false;
            this.showEditModal = true;
        },
        handleUpdateUser(userData) {
            if (this.saving) return;
            this.saving = true;
            this.$store.dispatch('user/update', userData)
                .then(() => {
                    this.fetchUsers();
                    this.showEditModal = false;
                    alert(this.$i18n.locale === 'en' ? "User updated successfully." : "อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว");
                })
                .catch(err => {
                    console.error('Update user error:', err);
                    alert(this.$i18n.locale === 'en' ? "Failed to update user." : "ไม่สามารถอัปเดตข้อมูลผู้ใช้งานได้");
                })
                .finally(() => {
                    this.saving = false;
                });
        },
        handleDeleteUser(user) {
            const name = this.formatUserName(user, this.$i18n.locale);
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to delete user "${name}"?`
                : `คุณแน่ใจหรือว่าต้องการลบผู้ใช้งาน "${name}"?`;
            
            if (!confirm(confirmMsg)) return;

            this.$store.dispatch('user/delete', { _id: user._id })
                .then(() => {
                    this.fetchUsers();
                    alert(this.$i18n.locale === 'en' ? "User deleted successfully." : "ลบผู้ใช้งานเรียบร้อยแล้ว");
                })
                .catch(err => {
                    console.error('Delete user error:', err);
                    alert(this.$i18n.locale === 'en' ? "Failed to delete user." : "ไม่สามารถลบผู้ใช้งานได้");
                });
        },
        handleManualChoice() {
            this.showChoiceModal = false;
            this.createError = '';
            this.showManualImportModal = true;
        },
        handleFileUpload(file) {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' }).map((row, index) => {
                        try {
                            return learnerImportRow(row);
                        } catch (rowError) {
                            // Tell the admin which spreadsheet row to fix (row 1 is the header).
                            throw Error(`${this.$i18n.locale === 'en' ? 'Row' : 'แถวที่'} ${index + 2}: ${rowError.message}`);
                        }
                    });
                    // The course (หลักสูตร) may live on another sheet of the same workbook; match by learner name.
                    const courseLookup = courseByNameFromSheets(workbook.SheetNames.slice(1)
                        .map(name => XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '' })));

                    if (jsonData.length === 0) {
                        alert(this.$i18n.locale === 'en' ? "The file is empty or invalid." : "ไฟล์ว่างเปล่าหรือไม่ถูกต้อง");
                        return;
                    }

                    // Find Default Role (Artist) and Status
                    const studentRole = this.roles.find(r => 
                        r.nameEn.toLowerCase() === 'artist' || 
                        r.nameEn.toLowerCase().includes('student')
                    ) || this.roles.find(r => r.nameEn.toLowerCase() !== 'admin') || this.roles[0];
                    
                    const activeStatus = this.studentStatuses.find(s => 
                        s.nameEn.toLowerCase().includes('new') ||
                        s.nameEn.toLowerCase().includes('active') || 
                        s.nameEn.toLowerCase().includes('normal')
                    ) || this.studentStatuses[0];

                    const mappedData = jsonData.map(row => {
                        // Resolve Role from file if provided, else use default student role
                        let roleId = studentRole ? studentRole._id : null;
                        let roleNameEn = studentRole ? studentRole.nameEn : '';
                        if (row['Role']) {
                            const foundRole = this.roles.find(r => 
                                r.nameEn.toLowerCase() === String(row['Role']).toLowerCase() ||
                                r.name.toLowerCase() === String(row['Role']).toLowerCase()
                            );
                            if (foundRole) {
                                roleId = foundRole._id;
                                roleNameEn = foundRole.nameEn;
                            }
                        }

                        // Resolve Status from file if provided, else use default active status
                        let statusId = activeStatus ? activeStatus._id : null;
                        // Only learners (Artist role) carry a learner status; accounts exported as 'Active' are not learners.
                        if (row['Status'] && isArtistRole(roleNameEn)) {
                            const foundStatus = resolveLearnerImportStatus(row['Status'], this.rawStatuses || []);
                            if (!foundStatus) throw Error(`ไม่พบสถานะผู้เรียน: ${row['Status']}`);
                            statusId = foundStatus._id;
                        }

                        const studentId = normalizeStudentId(row['StudentID']);
                        const incomingContact = {
                            studentEmail: row['Official Email'] || '',
                            personalEmail: row['Personal Email'] || '',
                            telephone: row['Telephone'] ? String(row['Telephone']) : ''
                        };
                        const artist = isArtistRole(roleNameEn);
                        // Official Email is optional only for Artist rows. Keep
                        // the historical required-email behavior for other roles.
                        if (!studentId || (!artist && !String(incomingContact.studentEmail).trim())) {
                            return null;
                        }
                        const contact = artist
                            ? normalizeArtistContact(studentId, incomingContact)
                            : incomingContact;

                        return {
                            studentId,
                            name: [
                                { key: 'th', value: row['UsernameThai'] || '' },
                                { key: 'en', value: row['UsernameEng'] || '' }
                            ],
                            contact,
                            ...(row.Image ? { image: row.Image } : {}),
                            ...(row.Course || courseForLearner(courseLookup, row['UsernameThai']) ? { course: row.Course || courseForLearner(courseLookup, row['UsernameThai']) } : {}),
                            role: roleId,
                            status: statusId
                        };
                    }).filter(Boolean);

                    if (mappedData.length === 0) {
                        alert(this.$i18n.locale === 'en' 
                            ? "No valid user data found. Please ensure each row has a StudentID. Artist rows generate Official Email automatically; other roles still require Official Email."
                            : "ไม่พบข้อมูลผู้ใช้งานที่ถูกต้อง กรุณาตรวจสอบ StudentID ทุกแถว (Artist สร้าง Official Email อัตโนมัติ ส่วนบทบาทอื่นยังต้องระบุ Official Email)");
                        return;
                    }

                    const confirmMsg = this.$i18n.locale === 'en'
                        ? `Detected ${mappedData.length} valid users. Proceed with bulk import?`
                        : `ตรวจพบผู้ใช้งานที่ถูกต้อง ${mappedData.length} รายการ (ผู้เรียนเก่า ${mappedData.filter(u => u.status === resolveLearnerImportStatus('OldStudent', this.rawStatuses || [])?._id).length} / ผู้เรียนใหม่ ${mappedData.filter(u => u.status === resolveLearnerImportStatus('NewStudent', this.rawStatuses || [])?._id).length}) ข้าม ${jsonData.length - mappedData.length} แถวที่ไม่มีรหัสหรือข้อมูลจำเป็น ไม่บันทึกบัตรประชาชน/Passport ต้องการนำเข้าหรือไม่?`;

                    // Re-importing a Student ID updates that user (name, contact, status): say so before saving.
                    const knownIds = new Set((this.$store.getters['user/user'] || []).map(u => String(u.studentId || '')));
                    const updating = mappedData.filter(u => knownIds.has(String(u.studentId))).length;
                    const updateNote = updating
                        ? (this.$i18n.locale === 'en'
                            ? `

${updating} of them already exist and will be UPDATED (name, contact and status are overwritten).`
                            : `

ในจำนวนนี้ ${updating} รายการมีอยู่ในระบบแล้ว และจะถูกอัปเดตทับ (ชื่อ ข้อมูลติดต่อ และสถานะ)`)
                        : '';

                    if (confirm(confirmMsg + updateNote)) {
                        this.$store.dispatch('user/create', mappedData)
                            .then(() => {
                                alert(this.$i18n.locale === 'en' ? "Bulk import completed successfully!" : "นำเข้าข้อมูลผู้ใช้งานจำนวนมากเสร็จเรียบร้อยแล้ว!");
                                this.fetchUsers();
                                this.showChoiceModal = false;
                            })
                            .catch(err => {
                                console.error("Import error:", err);
                                alert(this.$i18n.locale === 'en' 
                                    ? "Failed to import users. Check for duplicate Student IDs or Emails."
                                    : "ไม่สามารถนำเข้าข้อมูลผู้ใช้งานได้ กรุณาตรวจสอบรหัสนักศึกษาหรืออีเมลที่ซ้ำกัน");
                            });
                    }
                } catch (error) {
                    console.error("File processing error:", error);
                    alert(error.message || (this.$i18n.locale === 'en' ? "Error reading file. Please use a valid .xlsx or .csv file." : "เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาใช้ไฟล์ .xlsx หรือ .csv ที่ถูกต้อง"));
                }
            };
            reader.readAsArrayBuffer(file);
        },
        downloadTemplate() {
            const data = [learnerImportHeaders];
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
            
            // Auto-width columns
            const wscols = [8, 30, 32, 22, 22, 20, 32, 36, 45].map(wch => ({ wch }));
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, "User_Import_Template.xlsx");
        },
        handleSaveUser(userData) {
            if (this.saving) return;
            this.saving = true;
            this.createError = '';
            this.$store.dispatch('user/create', userData)
                .then(() => {
                    this.fetchUsers();
                    this.showManualImportModal = false;
                    alert(this.$i18n.locale === 'en' ? "User created successfully." : "สร้างผู้ใช้งานเรียบร้อยแล้ว");
                })
                .catch(err => {
                    console.error('Create user error:', err);
                    // Keep the form open with its draft and say why, instead of a generic alert.
                    const duplicate = [404, 409].includes(err && err.response && err.response.status);
                    this.createError = this.$i18n.locale === 'en'
                        ? (duplicate ? 'This student ID or email already exists. Change it and try again.' : 'Failed to create user. Please try again.')
                        : (duplicate ? 'รหัสนักศึกษาหรืออีเมลนี้มีอยู่แล้ว กรุณาแก้ไขแล้วลองใหม่' : 'ไม่สามารถสร้างผู้ใช้งานได้ กรุณาลองใหม่');
                })
                .finally(() => {
                    this.saving = false;
                });
        },
        exportToExcel() {
            if (!this.$refs.usersTable || !this.$refs.usersTable.filteredUsers) {
                console.error("Could not locate table data for export.");
                return;
            }
            
            const users = this.$refs.usersTable.filteredUsers;
            if (users.length === 0) {
                alert(this.$i18n.locale === 'en' ? "No data available to export." : "ไม่มีข้อมูลสำหรับการส่งออก");
                return;
            }

            // Map users to a clean format for Excel
            const dataToExport = users.map(user => {
                const nameTh = this.formatUserName(user, 'th');
                const nameEn = this.formatUserName(user, 'en');
                
                return {
                    'Student ID': user.studentId || 'N/A',
                    'Full Name (Thai)': nameTh,
                    'Full Name (English)': nameEn,
                    'Official Email': (user.contact && user.contact.studentEmail) || '-',
                    'Personal Email': (user.contact && user.contact.personalEmail) || '-',
                    'Telephone': (user.contact && user.contact.telephone) || '-',
                    'Role': this.getRoleName(user.role),
                    'Status': resolveUserStatusMeta(user, this.$i18n.locale, this.roles).label,
                    'Course': courseLabel(user.course, this.$i18n.locale) || '-',
                    'Profile Image': user.image || '-'
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users List");
            
            // Set column widths for better readability
            const wscols = [
                {wch: 15}, // Student ID
                {wch: 25}, // Name Thai
                {wch: 25}, // Name English
                {wch: 30}, // Official Email
                {wch: 30}, // Personal Email
                {wch: 15}, // Telephone
                {wch: 15}, // Role
                {wch: 15}, // Status
                {wch: 22}, // Course
                {wch: 50}  // Profile Image (Longer for URL)
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        },
        // Helper methods for export mapping
        formatUserName(user, lang) {
            if (!user || !user.name) return '';
            if (typeof user.name === 'string') return user.name;
            if (Array.isArray(user.name)) {
                const nameObj = user.name.find(n => n.key === lang);
                return nameObj ? nameObj.value : (user.name[0] ? user.name[0].value : '');
            }
            return '';
        },
        getRoleName(role) {
            return getRoleDisplayLabel(role, this.$i18n.locale, this.roles);
        },
        getStatusName(status) {
            return resolveUserStatusMeta({ status }, this.$i18n.locale, this.roles).label;
        }
    }
}
</script>

<style scoped>
.users-management-dashboard {
    padding-bottom: 2rem;
    position: relative;
    overflow: visible !important;
}

::v-deep .form-control {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    padding: 0.6rem 1rem;
    height: auto;
}

::v-deep .form-control:focus {
    border-color: #321fdb;
    box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.1);
}
</style>
