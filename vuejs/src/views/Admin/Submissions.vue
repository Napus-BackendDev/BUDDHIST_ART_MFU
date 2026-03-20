<template>
    <div class="submissions-dashboard">
        <HeaderHero title="Submission Management" description="Track and manage all artwork submissions, student assignments, and digital portfolios." icon="cil-list" :showCreateButton="true" createButtonText="Add Submission" @create="addSubmission" />
        <SubmissionWidget v-model="filters.quickRange" />
        <SubmissionFilter v-model="filters" />
        <SubmissionTable :filters="filters" @view="handleView" @edit="handleEdit" @delete="handleDelete" />
        <SubmissionCreateModal :show.sync="showCreateModal" @save="handleSave" />
        <SubmissionEditModal :show.sync="showEditModal" :submissionData="selectedSubmission" @update="handleUpdate" />
    </div>
</template>

<script>
import SubmissionTable from './components/table/SubmissionTable.vue'
import HeaderHero from './components/HeaderHero.vue'
import SubmissionWidget from './components/widget/SubmissionWidget.vue'
import SubmissionFilter from './components/filter/SubmissionFilter.vue'
import SubmissionCreateModal from './components/modal/submission/SubmissionCreateModal.vue'
import SubmissionEditModal from './components/modal/submission/SubmissionEditModal.vue'

export default {
    name: 'Submissions',
    components: {
        SubmissionTable,
        HeaderHero,
        SubmissionWidget,
        SubmissionFilter,
        SubmissionCreateModal,
        SubmissionEditModal
    },
    data() {
        return {
            showCreateModal: false,
            showEditModal: false,
            selectedSubmission: null,
            filters: {
                search: '',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            }
        }
    },
    created() {
        this.fetchSubmissions();
    },
    methods: {
        fetchSubmissions() {
            this.$store.dispatch('submission/get', {});
        },
        addSubmission() {
            this.showCreateModal = true;
        },
        handleSave(data) {
            this.$store.dispatch('submission/create', data)
                .then(() => {
                    this.fetchSubmissions();
                    this.showCreateModal = false;
                });
        },
        handleView(item) {
            this.$router.push({ name: 'SubmissionsDetail', params: { id: item._id } });
        },
        handleEdit(item) {
            this.selectedSubmission = item;
            this.showEditModal = true;
        },
        handleUpdate(data) {
            this.$store.dispatch('submission/update', data)
                .then(() => {
                    this.fetchSubmissions();
                    this.showEditModal = false;
                });
        },
        handleDelete(item) {
            if (confirm('Are you sure you want to delete this submission?')) {
                this.$store.dispatch('submission/delete', { _id: item._id })
                    .then(() => {
                        this.fetchSubmissions();
                    });
            }
        }
    }
}
</script>

<style scoped>
.submissions-dashboard {
    padding-bottom: 2rem;
}

.filter-bar {
    width: 100%;
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
