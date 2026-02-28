<template>
    <div>
        <Widget />
        <CRow class="mb-4">
            <CCol md="8" sm="12">
                <LineCharts class="h-100" />
            </CCol>
            <CCol md="4" sm="12">
                <PendingApproval class="h-100" />
            </CCol>
        </CRow>
        <OrderTable />
    </div>
</template>

<script>
import Widget from './components/Widget.vue'
import LineCharts from './components/charts/LineCharts.vue';
import PendingApproval from './components/PendingApproval.vue';
import OrderTable from './components/table/AdminTable.vue';

export default {
    name: 'Overview',
    components: {
        Widget,
        LineCharts,
        PendingApproval,
        OrderTable
    },
    data() {
        return {}
    }
}
</script>
