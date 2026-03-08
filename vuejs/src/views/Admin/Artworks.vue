<template>
    <div class="artworks-dashboard pt-3">
        <!-- Top Filters Section -->
        <div class="metrics-header mb-4 d-flex justify-content-between align-items-center">
            <!-- Left Filter: Search -->
            <div class="left-filters">
                <CInput placeholder="Search artworks by title or artist..." class="search-input-custom mb-0"
                    add-input-classes="search-input-field">
                    <template #prepend>
                        <div class="search-icon-wrapper">
                            <CIcon name="cilMagnifyingGlass" class="search-icon" />
                        </div>
                    </template>
                </CInput>
            </div>

            <!-- Right Filters: Categories and Status -->
            <div class="right-filters d-flex">
                <!-- Categories Dropdown -->
                <CDropdown :caret="false" class="mr-3" placement="bottom-end">
                    <template #toggler>
                        <button class="filter-btn">
                            <span class="filter-text">All Categories</span>
                            <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                        </button>
                    </template>
                    <CDropdownItem>All Categories</CDropdownItem>
                    <CDropdownItem>Painting</CDropdownItem>
                    <CDropdownItem>Sculpture</CDropdownItem>
                    <CDropdownItem>Digital Art</CDropdownItem>
                    <CDropdownItem>Photography</CDropdownItem>
                </CDropdown>

                <!-- Status Filter Dropdown -->
                <CDropdown :caret="false" placement="bottom-end">
                    <template #toggler>
                        <button class="filter-btn">
                            <span class="filter-text">All Status</span>
                            <CIcon name="cil-filter" class="filter-icon right-icon" />
                        </button>
                    </template>
                    <CDropdownItem>All Status</CDropdownItem>
                    <CDropdownItem>Pending</CDropdownItem>
                    <CDropdownItem>Completed</CDropdownItem>
                    <CDropdownItem>Cancelled</CDropdownItem>
                </CDropdown>
            </div>
        </div>

        <CRow>
            <CCol md="12">
                <AdminTable />
            </CCol>
        </CRow>
    </div>
</template>

<script>
import AdminTable from './components/table/AdminTable.vue';

export default {
    name: 'Artworks',
    components: {
        AdminTable
    }
}
</script>

<style scoped>
.artworks-dashboard {
    padding-bottom: 2rem;
}

/* Base custom input wrapper styles for that "pill" card look */
.search-input-custom {
    width: 320px;
}

/* Give the wrapper standard container stylings */
::v-deep .search-input-custom .input-group {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    overflow: hidden;
}

::v-deep .search-input-custom .input-group:hover,
::v-deep .search-input-custom .input-group:focus-within {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    border-color: #d1d5db;
}

/* Style the prepend icon area */
::v-deep .search-input-custom .input-group-prepend {
    margin: 0;
    height: 100%;
}

::v-deep .search-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 16px;
    padding-right: 12px;
    height: 100%;
    background: transparent;
}

::v-deep .search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
}

/* Style the actual input field to seamlessly blend */
::v-deep .search-input-field {
    border: none !important;
    background: transparent !important;
    padding-left: 0;
    height: 100%;
    font-size: 0.95rem;
    color: #3b4d6b;
    box-shadow: none !important;
}

::v-deep .search-input-field::placeholder {
    color: #a0aec0;
    font-weight: 400;
}

/* Filter Buttons (Dropdown Toggles) */
.filter-btn {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    cursor: pointer;
    outline: none;
}

.filter-btn:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    border-color: #d1d5db;
}

/* Dropdown text */
.filter-text {
    font-weight: 600;
    color: #3b4d6b;
    font-size: 0.95rem;
    margin: 0 16px 0 0;
    /* Margin on the right to separate from icons */
}

/* Give Categories button a bit less tight margin since it doesn't have a left icon */
.right-filters>CDropdown:first-child .filter-text {
    margin: 0 12px 0 0;
}

.dropdown-icon,
.filter-icon {
    color: #7a8aa3;
    width: 16px;
    height: 16px;
}
</style>
