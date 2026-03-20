<template>
    <div>
        <HeaderHero title="Order Management" description="Overview and track all customer orders, payments and fulfillment statuses in real-time." icon="cil-cart" :showCreateButton="true" :showExportButton="true" createButtonText="Create Order" @create="onCreateOrder" @export="handleExport" />
        <OrderWidget v-model="filters.status" />
        <OrderFilter v-model="filters" />
        <OrderTable ref="orderTable" :filters="filters" @view-order="onViewOrder" @edit-order="onEditOrder"/>
        <OrderCreateModal :show.sync="showCreateModal" @save="handleSaveOrder" />
        <OrderViewModal :show.sync="showViewModal" :order="selectedOrder" />
        <OrderEditModal :show.sync="showEditModal" :order="selectedOrder" @save="handleUpdateOrder" />
    </div>
</template>

<script>
import OrderTable from './components/table/OrderTable.vue'
import OrderWidget from './components/widget/OrderWidget.vue'
import HeaderHero from './components/HeaderHero.vue'
import OrderFilter from './components/filter/OrderFilter.vue'
import OrderCreateModal from './components/modal/order/OrderCreateModal.vue';
import OrderViewModal from './components/modal/order/OrderViewModal.vue';
import OrderEditModal from './components/modal/order/OrderEditModal.vue';

export default {
    name: 'Orders',
    components: {
        OrderTable,
        OrderWidget,
        HeaderHero,
        OrderFilter,
        OrderCreateModal,
        OrderViewModal,
        OrderEditModal
    },
    data() {
        return {
            showCreateModal: false,
            showViewModal: false,
            showEditModal: false,
            selectedOrder: {},
            filters: {
                search: '',
                status: 'All Status',
                quickRange: 'All Time',
                startDate: null,
                endDate: null
            }
        }
    },
    methods: {
        onCreateOrder() {
            this.showCreateModal = true;
        },
        onViewOrder(order) {
            this.selectedOrder = order;
            this.showViewModal = true;
        },
        onEditOrder(order) {
            this.selectedOrder = order;
            this.showEditModal = true;
        },
        handleSaveOrder(orderData) {
            console.log('Order Saved:', orderData)
            // Mocking success
            this.showCreateModal = false
        },
        handleUpdateOrder(orderData) {
            console.log('Order Updated:', orderData)
            // In a real app, update the items list
            this.showEditModal = false
        },
        handleExport() {
            if (this.$refs.orderTable) {
                this.$refs.orderTable.exportExcel();
            }
        }
    }
}
</script>

<style scoped>
</style>
