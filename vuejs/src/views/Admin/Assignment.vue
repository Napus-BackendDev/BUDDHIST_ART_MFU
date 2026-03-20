<template>
    <div>
        <!-- Back Button -->
        <div class="mb-3">
            <CLink :to="{ name: 'SubmissionsDetail', params: { id: $route.params.submissionId } }" class="back-link d-inline-flex align-items-center text-muted">
                <CIcon name="cil-arrow-left" class="mr-2" />
                <span class="font-weight-bold">Back to detail</span>
            </CLink>
        </div>

        <HeaderHero 
            title="Midterm Art Project - Portrait Drawing" 
            description="Manage and review all student submissions, provide feedback, and grade their work in real-time." 
            icon="cil-task" 
            :showCreateButton="false" 
            :showExportButton="true" 
            @export="handleExport"
        />
        <AssignmentWidget v-model="filters.status" />
        <AssignmentFilter v-model="filters" />
        <AssignmentTable :filters="filters" />
    </div>
</template>

<script>
import AssignmentTable from './components/table/AssignmentTable.vue'
import AssignmentWidget from './components/widget/AssignmentWidget.vue'
import AssignmentFilter from './components/filter/AssignmentFilter.vue'
import HeaderHero from './components/HeaderHero.vue'

export default {
    name: 'Assignment',
    components: {
        AssignmentTable,
        AssignmentWidget,
        AssignmentFilter,
        HeaderHero
    },
    data() {
        return {
            filters: {
                search: '',
                status: 'All Statuses',
                deadline: 'Any Deadline',
                quickRange: 'All Time',
                startDate: null,
                endDate: null
            }
        }
    },
    methods: {
        handleExport() {
            // Placeholder for export functionality
            console.log('Exporting data...');
        }
    }
}
</script>

<style scoped>
/* Back Link Styling */
.back-link {
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s;
    color: #8a93a2 !important;
}

.back-link:hover {
    color: #172b4d !important;
    text-decoration: none;
    transform: translateX(-4px);
}
</style>
