<template>
    <div class="users-management-dashboard">
        <HeaderHero 
            :title="$i18n.locale === 'en' ? 'User Management' : 'จัดการผู้ใช้งาน'" 
            :description="$i18n.locale === 'en' ? 'Manage system users, roles, and permissions effectively. Support for manual entry and bulk import.' : 'จัดการผู้ใช้งาน ระบบบทบาท และสิทธิ์การเข้าถึง รองรับการเพิ่มข้อมูลด้วยตนเองและนำเข้าแบบกลุ่ม'" 
            :createButtonText="$i18n.locale === 'en' ? 'Create User' : 'เพิ่มผู้ใช้งาน'"
            icon="cil-people"
            :showCreateButton="true"
            :showExportButton="true"
            themeColor="red"
            @create="showChoiceModal = true"
            @export="exportToExcel"
        />

        <UserWidget v-model="filters.status" :currentRole.sync="filters.role" />

        <UserFilter v-model="filters" :roles="roles" :statuses="studentStatuses" />

        <UsersTable 
            ref="usersTable" 
            :filters="filters" 
            @view="handleViewUser"
            @edit="handleEditUser"
            @delete="handleDeleteUser"
        />

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
            @save="handleSaveUser"
        />

        <!-- View User Modal -->
        <UserViewModal 
            :show.sync="showViewModal"
            :user="selectedUser"
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
            filters: {
                search: '',
                role: 'All Roles',
                status: 'All Status'
            }
        }
    },
    computed: {
        ...mapGetters({
            rawRoles: 'setting/roles/item',
            isRolesReload: 'setting/roles/isReload',
            rawStatuses: 'setting/status/item'
        }),
        roles() {
            if (!this.rawRoles || !Array.isArray(this.rawRoles)) return [];
            return this.rawRoles.map(r => {
                if (!r.title || !Array.isArray(r.title)) return null;
                const lang = this.$i18n.locale || 'en';
                const titleLang = r.title.find(t => t.key === lang) || r.title.find(t => t.key === 'en');
                const name = titleLang ? titleLang.value : (r.title[0] ? r.title[0].value : 'Unknown');
                const titleEn = r.title.find(t => t.key === 'en');
                const nameEn = titleEn ? titleEn.value : 'Unknown';
                return { _id: r._id, name, nameEn };
            }).filter(role => role && role.nameEn !== 'Unknown' && role.nameEn !== '');
        },
        studentStatuses() {
            if (!this.rawStatuses || !Array.isArray(this.rawStatuses)) return [];
            return this.rawStatuses.filter(s => {
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
                return { _id: s._id, name, nameEn };
            }).filter(s => s && s.nameEn !== 'Unknown');
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
        this.fetchRoles();
        this.fetchStatuses();
    },
    methods: {
        fetchUsers() {
            this.$store.dispatch('user/get', {});
        },
        fetchRoles() {
            this.$store.dispatch('setting/roles/config', {});
        },
        fetchStatuses() {
            this.$store.dispatch('setting/status/get', {});
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
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

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
                        if (row['Role']) {
                            const foundRole = this.roles.find(r => 
                                r.nameEn.toLowerCase() === String(row['Role']).toLowerCase() ||
                                r.name.toLowerCase() === String(row['Role']).toLowerCase()
                            );
                            if (foundRole) roleId = foundRole._id;
                        }

                        // Resolve Status from file if provided, else use default active status
                        let statusId = activeStatus ? activeStatus._id : null;
                        if (row['Status']) {
                            const foundStatus = this.studentStatuses.find(s => 
                                s.nameEn.toLowerCase() === String(row['Status']).toLowerCase() ||
                                s.name.toLowerCase() === String(row['Status']).toLowerCase()
                            );
                            if (foundStatus) statusId = foundStatus._id;
                        }

                        return {
                            studentId: row['StudentID'] ? String(row['StudentID']) : '',
                            name: [
                                { key: 'th', value: row['UsernameThai'] || '' },
                                { key: 'en', value: row['UsernameEng'] || '' }
                            ],
                            contact: {
                                studentEmail: row['Official Email'] || '',
                                personalEmail: row['Personal Email'] || '',
                                telephone: row['Telephone'] ? String(row['Telephone']) : ''
                            },
                            password: String(row['Temporary Password'] || '123456'),
                            role: roleId,
                            status: statusId
                        };
                    }).filter(u => u.studentId && u.contact.studentEmail);

                    if (mappedData.length === 0) {
                        alert(this.$i18n.locale === 'en' 
                            ? "No valid user data found. Please ensure you use the correct column headers:\nStudentID, UsernameThai, UsernameEng, Official Email, Personal Email, Telephone, Temporary Password"
                            : "ไม่พบข้อมูลผู้ใช้งานที่ถูกต้อง กรุณาตรวจสอบให้แน่ใจว่าใช้หัวตารางต่อไปนี้:\nStudentID, UsernameThai, UsernameEng, Official Email, Personal Email, Telephone, Temporary Password");
                        return;
                    }

                    const confirmMsg = this.$i18n.locale === 'en'
                        ? `Detected ${mappedData.length} valid users. Proceed with bulk import?`
                        : `ตรวจพบผู้ใช้งานที่ถูกต้องจำนวน ${mappedData.length} รายการ ต้องการดำเนินการนำเข้าข้อมูลหรือไม่?`;

                    if (confirm(confirmMsg)) {
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
                    alert(this.$i18n.locale === 'en' ? "Error reading file. Please use a valid .xlsx or .csv file." : "เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาใช้ไฟล์ .xlsx หรือ .csv ที่ถูกต้อง");
                }
            };
            reader.readAsArrayBuffer(file);
        },
        downloadTemplate() {
            const data = [[
                "StudentID", "UsernameThai", "UsernameEng", "Official Email", "Personal Email", "Telephone", "Temporary Password", "Role", "Status"
            ]];
            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
            
            // Auto-width columns
            const wscols = [
                {wch: 15}, {wch: 25}, {wch: 25}, {wch: 30}, {wch: 30}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 15}
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, "User_Import_Template.xlsx");
        },
        handleSaveUser(userData) {
            if (this.saving) return;
            this.saving = true;
            this.$store.dispatch('user/create', userData)
                .then(() => {
                    this.fetchUsers();
                    this.showManualImportModal = false;
                    alert(this.$i18n.locale === 'en' ? "User created successfully." : "สร้างผู้ใช้งานเรียบร้อยแล้ว");
                })
                .catch(err => {
                    console.error('Create user error:', err);
                    alert(this.$i18n.locale === 'en' ? "Failed to create user." : "ไม่สามารถสร้างผู้ใช้งานได้");
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
                    'Status': this.getStatusName(user.status),
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
            if (!role) return 'User';
            if (typeof role === 'string') return role;
            if (typeof role === 'object' && role.title && Array.isArray(role.title)) {
                const titleEn = role.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (role.title[0] ? role.title[0].value : 'Unknown');
            }
            return 'User';
        },
        getStatusName(status) {
            if (!status) return 'Active';
            if (typeof status === 'string') return status;
            if (typeof status === 'object' && status.title && Array.isArray(status.title)) {
                const titleEn = status.title.find(t => t.key === 'en');
                return titleEn ? titleEn.value : (status.title[0] ? status.title[0].value : 'Unknown');
            }
            return 'Active';
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
