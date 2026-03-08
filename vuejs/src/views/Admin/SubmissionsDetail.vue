<template>
    <div>
        <div class="mb-4 d-flex align-items-center">
            <CLink :to="{ name: 'Submissions' }" class="back-btn mr-3">
                <CIcon name="cil-arrow-left" size="lg" />
            </CLink>
            <div>
                <h3 class="font-weight-bold m-0" style="color: #2c3e50;">Midterm Art Project</h3>
                <p class="text-muted mt-1 mb-0 small">Managing assignments for 45 students</p>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar mb-4 d-flex justify-content-between align-items-center">
            <!-- Search Input -->
            <div class="search-wrapper">
                <CIcon name="cilMagnifyingGlass" class="search-icon" />
                <CInput class="m-0 w-100 custom-search-cinput" placeholder="Search assignment by title..." />
            </div>

            <!-- Right Actions -->
            <div class="right-filters d-flex">
                <CButton class="add-btn d-flex align-items-center" @click="addAssignment">
                    <CIcon name="cil-plus" class="mr-2" /> Add Assignment
                </CButton>
            </div>
        </div>

        <!-- DataTable Component -->
        <SubmissionDetailTable @view="handleView" @edit="handleEdit" @delete="handleDelete" />
    </div>
</template>

<script>
import SubmissionDetailTable from './components/table/SubmissionDetailTable.vue'

export default {
    name: 'SubmissionsDetail',
    components: {
        SubmissionDetailTable
    },
    methods: {
        addAssignment() {
            // Logic to add a new assignment
            console.log('Add new assignment clicked');
        },
        handleView(item) {
            console.log('Viewing assignment item:', item);
            this.$router.push({ name: 'Assignment', params: { id: item.id } });
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
.back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    background-color: #ffffff;
    color: #5c6873;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease-in-out;
}

.back-btn:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

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
    width: 420px;
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
</style>
