<template>
    <div>
        <div class="filter-bar mb-4 d-flex justify-content-between align-items-center">
            <!-- Search Input -->
            <div class="search-wrapper">
                <CIcon name="cilMagnifyingGlass" class="search-icon" />
                <CInput class="m-0 w-100 custom-search-cinput"
                    placeholder="Search orders by ID, customer, or artwork..." />
            </div>

            <!-- Right Filters -->
            <div class="right-filters d-flex">
                <!-- Date Picker Dropdown -->
                <CDropdown :caret="false" class="mr-3" placement="bottom-end">
                    <template #toggler>
                        <button class="filter-btn">
                            <CIcon name="cil-calendar" class="filter-icon" />
                            <span class="date-text">Oct 1 - Oct 31, 2023</span>
                            <CIcon name="cil-chevron-bottom" class="dropdown-icon" />
                        </button>
                    </template>
                    <CDropdownItem>Today</CDropdownItem>
                    <CDropdownItem>This Week</CDropdownItem>
                    <CDropdownItem>Last 30 Days</CDropdownItem>
                    <CDropdownItem>This Year</CDropdownItem>
                </CDropdown>

                <!-- Status Filter Dropdown -->
                <CDropdown :caret="false" placement="bottom-end">
                    <template #toggler>
                        <button class="filter-btn">
                            <span class="status-text">All Status</span>
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

        <!-- Assuming the table will go below -->
        <OrderTable />
    </div>
</template>

<script>
// We can reuse the OrderTable component we constructed earlier for the actual list
import OrderTable from './components/table/OrderTable.vue'

export default {
    name: 'Orders',
    components: {
        OrderTable
    }
}
</script>

<style scoped>
.filter-bar {
    /* No special background on the bar itself, it's transparent over body */
    width: 100%;
}

/* Base custom input wrapper styles for that "pill" card look */
.search-wrapper,
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

.search-wrapper:hover,
.filter-btn:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* Search specific */
.search-wrapper {
    height: 48px;
    width: 420px;
}

.search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
    margin-right: 12px;
}

/* Styles for the CInput to strip borders and make it transparent like native input */
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

/* Date Range specific */
.date-text {
    font-weight: 600;
    color: #3b4d6b;
    font-size: 0.95rem;
    margin: 0 16px 0 12px;
}

/* Status specific */
.status-text {
    font-weight: 600;
    color: #3b4d6b;
    font-size: 0.95rem;
    margin-right: 16px;
}

.filter-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
}

.dropdown-icon {
    color: #7a8aa3;
    width: 14px;
    height: 14px;
}
</style>
