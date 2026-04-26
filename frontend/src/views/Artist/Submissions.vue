<template>
    <div class="submissions-dashboard">
        <HeaderHero 
            title="ศิลปะพุทธศิลป์ - การยื่นประกาศ" 
            description="ตรวจสอบและจัดการรายการยื่นประกาศ ทั้งหมดในระบบพุทธศิลป์" 
            icon="cil-list" 
            :showCreateButton="false" 
        />
        <SubmissionWidget v-model="filters.quickRange" />
        <SubmissionFilter v-model="filters" />
        <SubmissionTable :filters="filters" @view="handleView" />
    </div>
</template>

<script>
import SubmissionTable from './components/table/SubmissionTable.vue'
import HeaderHero from '../Admin/components/HeaderHero.vue'
import SubmissionWidget from '../Admin/components/widget/SubmissionWidget.vue'
import SubmissionFilter from '../Admin/components/filter/SubmissionFilter.vue'

export default {
    name: 'ArtistSubmissions',
    components: {
        SubmissionTable,
        HeaderHero,
        SubmissionWidget,
        SubmissionFilter
    },
    data() {
        return {
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
        handleView(item) {
            this.$router.push({ name: 'ArtistSubmissionsDetail', params: { id: item._id } });
        }
    }
}
</script>

<style scoped>
.submissions-dashboard {
    padding-bottom: 2rem;
    position: relative;
    overflow: visible !important;
}
</style>
