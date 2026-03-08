<template>
    <div>
        <!-- Top Header & Stats Section -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <!-- Left: Title & Subtitle -->
            <div class="d-flex align-items-center">
                <CLink :to="{ name: 'SubmissionsDetail', params: { id: $route.params.id || 1 } }" class="back-btn mr-3">
                    <CIcon name="cil-arrow-left" size="lg" />
                </CLink>
                <div>
                    <h3 class="font-weight-bold m-0" style="color: #2c3e50;">Midterm Art Project - Portrait Drawing</h3>
                    <p class="text-muted mt-1 mb-0 font-weight-bold">Student submissions and grading</p>
                </div>
            </div>

            <!-- Right: Submission Stats -->
            <div class="d-flex stats-container">
                <div class="stat-box pt-2 pb-2 pl-3 pr-3 text-center border-right">
                    <p class="text-muted mb-1 small text-uppercase font-weight-bold">Total Submitted</p>
                    <h4 class="mb-0 font-weight-bold text-dark">40<span class="text-muted small">/45</span></h4>
                </div>
                <div class="stat-box pt-2 pb-2 pl-3 pr-3 text-center border-right">
                    <p class="text-success mb-1 small text-uppercase font-weight-bold">Passed</p>
                    <h4 class="mb-0 font-weight-bold text-success">28</h4>
                </div>
                <div class="stat-box pt-2 pb-2 pl-3 pr-3 text-center border-right">
                    <p class="text-warning mb-1 small text-uppercase font-weight-bold">Pending</p>
                    <h4 class="mb-0 font-weight-bold text-warning">8</h4>
                </div>
                <div class="stat-box pt-2 pb-2 pl-3 pr-3 text-center">
                    <p class="text-danger mb-1 small text-uppercase font-weight-bold">Fail</p>
                    <h4 class="mb-0 font-weight-bold text-danger">4</h4>
                </div>
            </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="filter-bar mb-4 d-flex justify-content-between align-items-center">
            <!-- Search Input -->
            <div class="search-wrapper">
                <CIcon name="cilMagnifyingGlass" class="search-icon" />
                <CInput class="m-0 w-100 custom-search-cinput" placeholder="Search by student name or ID..." />
            </div>

            <!-- Right Filters -->
            <div class="right-filters d-flex gap-3">
                <CSelect :options="['All Statuses', 'Passed', 'Pending', 'Fail']" class="m-0 mr-2 filter-select" />
                <CSelect :options="['Any Deadline', 'On Time', 'Late']" class="m-0 filter-select" />
            </div>
        </div>

        <!-- DataTable Component with Split-View -->
        <AssignmentTable />
    </div>
</template>

<script>
import AssignmentTable from './components/table/AssignmentTable.vue'

export default {
    name: 'Assignment',
    components: {
        AssignmentTable
    }
}
</script>

<style scoped>
/* Back Button (Squircle) */
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

/* Stats Container */
.stats-container {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    overflow: hidden;
}

.stat-box {
    min-width: 120px;
}

.border-right {
    border-right: 1px solid #eef0f3 !important;
}

/* Filter Bar */
.filter-bar {
    width: 100%;
}

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
    width: 380px;
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

/* Custom CInput overrides */
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

/* Select Dropdown Overrides */
.filter-select {
    width: 160px;
}

::v-deep .filter-select .form-control {
    border-radius: 12px;
    height: 48px;
    border: 1px solid #eef0f3;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    cursor: pointer;
    font-size: 0.95rem;
    color: #495057;
    font-weight: 500;
}

::v-deep .filter-select .form-control:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.root-card {
    border-radius: 12px;
    overflow: hidden;
}
</style>
