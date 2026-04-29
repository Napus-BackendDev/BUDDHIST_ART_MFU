<template>
    <div>
        <HeaderHero 
            :title="$i18n.locale === 'en' ? 'Admin Dashboard' : 'แผงควบคุมหลัก'" 
            :subtitle="$i18n.locale === 'en' ? 'Welcome back! Here\'s what\'s happening with your platform today.' : 'ยินดีต้อนรับกลับ! นี่คือความเคลื่อนไหวบนแพลตฟอร์มของคุณในวันนี้'"
            icon="cil-speedometer"
        />
        <WidgetsDashboard />
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
import WidgetsDashboard from './components/WidgetsDashboard.vue'
import HeaderHero from './components/HeaderHero.vue'
import LineCharts from './components/charts/LineCharts.vue';
import PendingApproval from './components/PendingApproval.vue';
import OrderTable from './components/table/AdminTable.vue';

export default {
    name: 'Overview',
    components: {
        WidgetsDashboard,
        HeaderHero,
        LineCharts,
        PendingApproval,
        OrderTable
    },
    data() {
        return {}
    }
}
</script>
