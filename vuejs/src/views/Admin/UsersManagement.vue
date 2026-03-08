<template>
    <div>
        <!-- Toolbar Section (Search, Filters, Add User) -->
        <!-- No Header Title as requested -->
        <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
            <!-- Left side Search -->
            <div class="search-wrapper">
                <CIcon name="cilMagnifyingGlass" class="search-icon" />
                <CInput class="m-0 custom-search-cinput" placeholder="Search users by name or email..." />
            </div>

            <!-- Right side controls -->
            <div class="d-flex align-items-center gap-3">
                <!-- Role Filter -->
                <div class="filter-wrapper mr-3 d-flex align-items-center justify-content-between px-3">
                    <span class="mr-2 text-dark font-weight-bold" style="font-size: 0.95rem;">Role: All</span>
                    <CIcon name="cil-filter" class="text-muted" style="width: 16px; height: 16px;" />
                </div>

                <!-- Status Filter -->
                <div class="filter-wrapper mr-3 d-flex align-items-center justify-content-between px-3">
                    <span class="mr-2 text-dark font-weight-bold" style="font-size: 0.95rem;">Status: All</span>
                    <CIcon name="cil-filter" class="text-muted" style="width: 16px; height: 16px;" />
                </div>

                <!-- Add New User Dropdown (Manual / Upload) -->
                <CDropdown class="mr-3 font-weight-bold custom-import-dropdown" placement="bottom-end" :caret="false">
                    <template #toggler-content>
                        <CIcon name="cil-user-plus" class="mr-2" style="width: 18px; height: 18px; color: #344054;" />
                        <span style="color: #344054; font-size: 0.95rem;">Add New User</span>
                        <CIcon name="cil-chevron-bottom" class="ml-2 mt-1"
                            style="width: 12px; height: 12px; color: #344054;" />
                    </template>
                    <CDropdownItem @click="showManualImportModal = true">
                        <CIcon name="cil-keyboard" class="mr-2 text-muted" /> Add Manually
                    </CDropdownItem>
                    <CDropdownItem @click="triggerFileUpload">
                        <CIcon name="cil-file" class="mr-2 text-muted" /> Import File (.csv, .xlsx)
                    </CDropdownItem>
                </CDropdown>
                <!-- Hidden File Input for Uploading -->
                <input type="file" ref="fileInput" class="d-none"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    @change="handleFileUpload">

                <!-- Export Excel Button -->
                <CButton class="font-weight-bold custom-export-btn d-flex align-items-center" @click="exportToExcel">
                    <CIcon name="cil-layers" class="mr-2" style="width: 18px; height: 18px;" /> Export
                </CButton>
            </div>
        </div>

        <!-- Dynamic Data Table component -->
        <UsersTable ref="usersTable" />

        <!-- Manual Import Modal -->
        <CModal :show.sync="showManualImportModal" title="Add New User Manually" color="dark">
            <p class="text-muted">Fill out the fields below to add a new system user.</p>
            <CForm>
                <CInput label="Full Name" placeholder="e.g. John Doe" />
                <CInput label="Email Address" type="email" placeholder="e.g. john@example.com" />
                <CSelect label="Role" :options="['Admin', 'Developer', 'Evaluator', 'Customer']" />
                <CInput label="Password" type="password" placeholder="Enter temporary password" />
            </CForm>
            <template #footer>
                <CButton color="secondary" @click="showManualImportModal = false">Cancel</CButton>
                <CButton color="dark" @click="submitManualImport">Save User</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import * as XLSX from 'xlsx';
import UsersTable from './components/table/UsersTable.vue';

export default {
    name: 'UsersManagement',
    components: {
        UsersTable
    },
    data() {
        return {
            showManualImportModal: false,
        }
    },
    methods: {
        triggerFileUpload() {
            this.$refs.fileInput.click();
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            alert(`Simulating import user data for: ${file.name}`);
            // Reset input so the same file could be selected again if needed
            event.target.value = '';
        },
        submitManualImport() {
            alert(`New manual user record added successfully.`);
            this.showManualImportModal = false;
        },
        exportToExcel() {
            if (!this.$refs.usersTable || !this.$refs.usersTable.users) {
                console.error("Could not locate table data for export.");
                return;
            }

            const dataToExport = this.$refs.usersTable.users;
            if (dataToExport.length === 0) {
                alert("No data available to export.");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
            XLSX.writeFile(workbook, `Users_Export.xlsx`);
        }
    }
}
</script>

<style scoped>
/* Toolbar elements */
.filter-wrapper {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 0 16px !important;
    height: 48px;
    display: flex;
    align-items: center;
    min-width: 120px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.filter-wrapper:hover {
    background-color: #f8f9fa;
}

/* Import Dropdown */
::v-deep .custom-import-dropdown .btn {
    background-color: #ffffff !important;
    color: #344054 !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    font-weight: 500;
    height: 48px;
    display: inline-flex;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02) !important;
    transition: all 0.2s;
}

::v-deep .custom-import-dropdown .btn:hover {
    background-color: #f8f9fa !important;
}

/* Export Button */
.custom-export-btn {
    background-color: #e06e64 !important;
    /* Soft Red matching image */
    color: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 600;
    height: 48px;
    padding: 0 24px;
    font-size: 0.95rem;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(224, 110, 100, 0.2) !important;
}

.custom-export-btn:hover {
    background-color: #cf5d54 !important;
    transform: translateY(-1px);
}

/* Search Bar */
.search-wrapper {
    position: relative;
    width: 320px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    width: 18px;
    height: 18px;
    z-index: 10;
}

::v-deep .custom-search-cinput .form-group {
    margin-bottom: 0 !important;
}

::v-deep .custom-search-cinput .form-control {
    padding-left: 40px !important;
    height: 48px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    font-size: 0.95rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
}

::v-deep .custom-search-cinput .form-control:focus {
    border-color: #cbd5e0;
    box-shadow: 0 0 0 3px rgba(226, 232, 240, 0.4);
}
</style>
