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
            // Future implementation for excel import
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
            const dataToExport = this.$refs.usersTable.filteredUsers;
            if (dataToExport.length === 0) {
                alert("No data available to export.");
                return;
            }
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
            XLSX.writeFile(workbook, `Users_Export_${new Date().toLocaleDateString()}.xlsx`);
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
