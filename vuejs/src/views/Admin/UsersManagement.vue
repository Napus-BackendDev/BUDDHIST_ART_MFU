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

        <UserWidget />

        <UserFilter v-model="filters" />

        <UsersTable 
            ref="usersTable" 
            :filters="filters" 
            @view="handleViewUser"
            @edit="handleEditUser"
        />

        <!-- Choice Modal -->
        <UserCreateChoiceModal 
            :show.sync="showChoiceModal"
            @manual="handleManualChoice"
            @import="handleFileUpload"
        />

        <UserCreateModal 
            :show.sync="showManualImportModal"
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
            @save="handleUpdateUser"
        />
    </div>
</template>

<script>
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
    methods: {
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
            console.log("Updating user:", userData);
            alert("User updated successfully (Mock)!");
            this.showEditModal = false;
        },
        handleManualChoice() {
            this.showChoiceModal = false;
            this.showManualImportModal = true;
        },
        handleFileUpload(file) {
            if (!file) return;
            alert(`Simulating import user data for: ${file.name}`);
        },
        handleSaveUser(userData) {
            console.log("Saving new user:", userData);
            alert("User created successfully (Mock)!");
            this.showManualImportModal = false;
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
