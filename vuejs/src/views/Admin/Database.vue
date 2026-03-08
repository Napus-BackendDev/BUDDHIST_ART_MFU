<template>
    <div>
        <!-- Top Header & Actions Section -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <!-- Left: Title -->
            <div class="d-flex align-items-center">
                <div>
                    <h3 class="font-weight-bold m-0" style="color: #2c3e50;">Database Management</h3>
                    <p class="text-muted mt-1 mb-0 font-weight-bold">Manage orders, artworks, and submissions</p>
                </div>
            </div>

            <!-- Tabs Button Group -->
            <div class="tabs-wrapper mb-4">
                <CButtonGroup class="custom-pill-group">
                    <CButton
                        :class="{ 'pill-active': currentTab === 'Orders', 'pill-inactive': currentTab !== 'Orders' }"
                        @click="currentTab = 'Orders'">
                        Orders
                    </CButton>
                    <CButton
                        :class="{ 'pill-active': currentTab === 'Artworks', 'pill-inactive': currentTab !== 'Artworks' }"
                        @click="currentTab = 'Artworks'">
                        Artworks
                    </CButton>
                    <CButton
                        :class="{ 'pill-active': currentTab === 'Submissions', 'pill-inactive': currentTab !== 'Submissions' }"
                        @click="currentTab = 'Submissions'">
                        Submissions
                    </CButton>
                </CButtonGroup>
            </div>
        </div>

        <!-- Toolbar Section (Filters, Export, Import, Search) -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <!-- Left side Search -->
            <div class="search-wrapper">
                <CIcon name="cilMagnifyingGlass" class="search-icon" />
                <CInput class="m-0 custom-search-cinput" placeholder="Search records..." />
            </div>

            <!-- Right side controls -->
            <div class="d-flex align-items-center gap-3">
                <!-- Status Filter -->
                <div class="filter-wrapper mr-3 d-flex align-items-center justify-content-between px-3">
                    <span class="mr-2 text-dark font-weight-bold" style="font-size: 0.95rem;">All</span>
                    <CIcon name="cil-filter" class="text-muted" style="width: 16px; height: 16px;" />
                </div>

                <!-- Import Dropdown (Manual / Upload) -->
                <CDropdown class="mr-3 font-weight-bold custom-import-dropdown" placement="bottom-end" :caret="false">
                    <template #toggler-content>
                        <CIcon name="cil-data-transfer-up" class="mr-2"
                            style="width: 18px; height: 18px; color: #344054;" />
                        <span style="color: #344054; font-size: 0.95rem;">Import</span>
                        <CIcon name="cil-chevron-bottom" class="ml-2 mt-1"
                            style="width: 12px; height: 12px; color: #344054;" />
                    </template>
                    <CDropdownItem @click="showManualImportModal = true">
                        <CIcon name="cil-keyboard" class="mr-2 text-muted" /> Add Manually
                    </CDropdownItem>
                    <CDropdownItem @click="triggerFileUpload">
                        <CIcon name="cil-file" class="mr-2 text-muted" /> Upload File (.csv, .xlsx)
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
        <DatabaseTable ref="dbTable" :currentTab="currentTab" />

        <!-- Manual Import Modal -->
        <CModal :show.sync="showManualImportModal" title="Import Data Manually" color="dark">
            <p class="text-muted">Fill out the fields below to add a new record to <strong>{{ currentTab }}</strong>.
            </p>
            <CInput label="Record ID" placeholder="Leave blank to auto-generate" />
            <CInput label="Primary Name / Title" />
            <CSelect label="Status" :options="['Pending', 'Completed', 'Draft', 'Active']" />

            <template #footer>
                <CButton color="secondary" @click="showManualImportModal = false">Cancel</CButton>
                <CButton color="dark" @click="submitManualImport">Add Record</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import DatabaseTable from './components/table/DatabaseTable.vue'
import * as XLSX from 'xlsx' // Use xlsx package for exporting

export default {
    name: 'Database',
    components: {
        DatabaseTable
    },
    data() {
        return {
            currentTab: 'Orders',
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

            alert(`Simulating upload for: ${file.name}`);
            // Reset input so the same file could be selected again if needed
            event.target.value = '';
        },
        submitManualImport() {
            alert(`New manual record added to ${this.currentTab}`);
            this.showManualImportModal = false;
        },
        exportToExcel() {
            // Get the current table items directly from the child component
            if (!this.$refs.dbTable || !this.$refs.dbTable.currentItems) {
                console.error("Could not locate table data for export.");
                return;
            }

            const dataToExport = this.$refs.dbTable.currentItems;
            if (dataToExport.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Create a new workbook and worksheet from JSON data
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, this.currentTab);

            // Trigger the download of the file
            XLSX.writeFile(workbook, `${this.currentTab}_Export.xlsx`);
        }
    }
}
</script>

<style scoped>
/* Pill Button Group */
.tabs-wrapper {
    /* Reduce width instead of taking 100% full screen */
    width: 480px;
    max-width: 100%;
}

.custom-pill-group {
    width: 100%;
    background-color: #ffffff;
    border-radius: 10px;
    padding: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f1f5;
    display: flex;
}

.custom-pill-group .btn {
    flex: 1;
    border: none;
    border-radius: 8px !important;
    font-weight: 500;
    font-size: 0.85rem;
    padding: 0.4rem 0.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pill-active {
    background-color: #e06e64 !important;
    /* Soft Red matching image */
    color: #ffffff !important;
    box-shadow: 0 2px 6px rgba(224, 110, 100, 0.25);
}

.pill-inactive {
    background-color: transparent !important;
    color: #7a8aa3 !important;
}

.pill-inactive:hover {
    color: #344054 !important;
    background-color: #f8f9fa !important;
}

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
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    width: 320px;
}

.search-wrapper:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
    margin-right: 12px;
}

.custom-search-cinput {
    flex-grow: 1;
}

::v-deep .custom-search-cinput .form-group {
    margin-bottom: 0 !important;
}

::v-deep .custom-search-cinput .form-control {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #172b4d;
    box-shadow: none;
    padding: 0;
}

::v-deep .custom-search-cinput .form-control::placeholder {
    color: #a0aec0;
}

.gap-3 {
    gap: 1rem;
}
</style>
