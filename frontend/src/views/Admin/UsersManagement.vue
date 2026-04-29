<template>
    <div class="users-management-dashboard">
        <HeaderHero 
            title="User Management" 
            description="Manage system users, roles, and permissions effectively. Support for manual entry and bulk import." 
            createButtonText="Create User"
            icon="cil-people"
            :showCreateButton="true"
            :showExportButton="true"
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
                const titleEn = r.title.find(t => t.key === 'en');
                const name = titleEn ? titleEn.value : (r.title[0] ? r.title[0].value : 'Unknown');
                return { _id: r._id, name };
            }).filter(role => role && role.name !== 'Unknown' && role.name !== '');
        },
        studentStatuses() {
            if (!this.rawStatuses || !Array.isArray(this.rawStatuses)) return [];
            return this.rawStatuses.filter(s => {
                if (!s.group || !s.group.title || !Array.isArray(s.group.title)) return false;
                const groupTitleEn = s.group.title.find(t => t.key === 'en');
                return groupTitleEn && groupTitleEn.value === 'Student Group';
            }).map(s => {
                if (!s.title || !Array.isArray(s.title)) return null;
                const titleEn = s.title.find(t => t.key === 'en');
                const name = titleEn ? titleEn.value : (s.title[0] ? s.title[0].value : 'Unknown');
                return { _id: s._id, name };
            }).filter(s => s && s.name !== 'Unknown');
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
            this.$store.dispatch('user/update', userData)
                .then(() => {
                    this.fetchUsers();
                    this.showEditModal = false;
                });
        },
        handleDeleteUser(user) {
            this.$store.dispatch('user/delete', { _id: user._id })
                .then(() => {
                    this.fetchUsers();
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
                        alert("The file is empty or invalid.");
                        return;
                    }

                    // Find Default Role (Student) and Status
                    const studentRole = this.roles.find(r => r.name.toLowerCase().includes('student')) || this.roles[0];
                    const activeStatus = this.studentStatuses.find(s => s.name.toLowerCase().includes('active') || s.name.toLowerCase().includes('normal')) || this.studentStatuses[0];

                    const mappedData = jsonData.map(row => {
                        // Resolve Role from file if provided, else use default student role
                        let roleId = studentRole ? studentRole._id : null;
                        if (row['Role']) {
                            const foundRole = this.roles.find(r => r.name.toLowerCase() === String(row['Role']).toLowerCase());
                            if (foundRole) roleId = foundRole._id;
                        }

                        // Resolve Status from file if provided, else use default active status
                        let statusId = activeStatus ? activeStatus._id : null;
                        if (row['Status']) {
                            const foundStatus = this.studentStatuses.find(s => s.name.toLowerCase() === String(row['Status']).toLowerCase());
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
                        alert("No valid user data found. Please ensure you use the correct column headers:\nStudentID, UsernameThai, UsernameEng, Official Email, Personal Email, Telephone, Temporary Password");
                        return;
                    }

                    if (confirm(`Detected ${mappedData.length} valid users. Proceed with bulk import?`)) {
                        this.$store.dispatch('user/create', mappedData)
                            .then(() => {
                                alert("Bulk import completed successfully!");
                                this.fetchUsers();
                                this.showChoiceModal = false;
                            })
                            .catch(err => {
                                console.error("Import error:", err);
                                alert("Failed to import users. Check for duplicate Student IDs or Emails.");
                            });
                    }
                } catch (error) {
                    console.error("File processing error:", error);
                    alert("Error reading file. Please use a valid .xlsx or .csv file.");
                }
            };
            reader.readAsArrayBuffer(file);
        },
        downloadTemplate() {
            const data = [
                ["StudentID", "UsernameThai", "UsernameEng", "Official Email", "Personal Email", "Telephone", "Temporary Password", "Role", "Status"],
                ["64XXXXXX", "ตัวอย่าง ชื่อ-นามสกุล", "Sample Name", "sample.nam@lamduan.mfu.ac.th", "sample@gmail.com", "0812345678", "123456", "Student", "NewStudent"]
            ];
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
            this.$store.dispatch('user/create', userData)
                .then(() => {
                    this.fetchUsers();
                    this.showManualImportModal = false;
                });
        },
        exportToExcel() {
            if (!this.$refs.usersTable || !this.$refs.usersTable.filteredUsers) {
                console.error("Could not locate table data for export.");
                return;
            }
            
            const users = this.$refs.usersTable.filteredUsers;
            if (users.length === 0) {
                alert("No data available to export.");
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
                    'Profile Image': user.avatar || '-'
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
