<template>
    <div>

        <div class="filter-bar mb-4 d-flex justify-content-between align-items-center">
            <!-- Search Input -->
            <div class="search-wrapper">
                <CIcon name="cilMagnifyingGlass" class="search-icon" />
                <CInput class="m-0 w-100 custom-search-cinput" placeholder="Search submissions by title..." />
            </div>

            <!-- Right Actions -->
            <div class="right-filters d-flex">
                <CButton class="add-btn d-flex align-items-center" @click="addSubmission">
                    <CIcon name="cil-plus" class="mr-2" /> Add Submission
                </CButton>
            </div>
        </div>

        <!-- DataTable Component -->
        <SubmissionTable @view="handleView" @edit="handleEdit" @delete="handleDelete" />
    </div>
</template>

<script>
import SubmissionTable from './components/table/SubmissionTable.vue'

export default {
    name: 'Submissions',
    components: {
        SubmissionTable
    },
    methods: {
        addSubmission() {
            // Logic to add a new submission
            console.log('Add new submission clicked');
        },
        handleView(item) {
            console.log('Viewing item:', item);
            this.$router.push({ name: 'SubmissionsDetail', params: { id: item.id } });
        },
        handleEdit(item) {
            console.log('Editing item:', item);
            // Open edit form or modal
        },
        handleDelete(item) {
            console.log('Deleting item:', item);
            // Confirm and delete
        }
    }
}
</script>

<style scoped>
.filter-bar {
    width: 100%;
}

.add-btn {
    background-color: #eb7a34;
    border-color: #eb7a34;
    color: #ffffff !important;
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(235, 122, 52, 0.3);
    transition: all 0.2s;
}

.add-btn:hover {
    background-color: #d66a26;
    border-color: #d66a26;
    color: #ffffff !important;
}

/* Base custom input wrapper styles */
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

/* Styles for the CInput to strip borders */
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

/* Custom Text and Icons */
.date-text {
    font-weight: 600;
    color: #3b4d6b;
    font-size: 0.95rem;
    margin: 0 16px 0 12px;
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
