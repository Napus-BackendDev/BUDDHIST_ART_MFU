<template>
    <div>
        <HeaderHero 
            title="Order Management" 
            description="Overview and track all customer orders, payments and fulfillment statuses in real-time." 
            icon="cil-cart"
            :showCreateButton="true" 
            @create="onCreateOrder" 
        />
        <OrderWidget @filter-status="filters.status = $event" />
        <OrderFilter v-model="filters" />
        <OrderTable
            :filters="filters"
            @view-order="onViewOrder"
        />

        <OrderCreateModal
            :show.sync="showCreateModal"
            @save="handleSaveOrder"
        />
        <OrderViewModal :show.sync="showViewModal" :order="selectedOrder" />
    </div>
</template>

<script>
import OrderTable from './components/table/OrderTable.vue'
import OrderWidget from './components/widget/OrderWidget.vue'
import HeaderHero from './components/HeaderHero.vue'
import OrderFilter from './components/filter/OrderFilter.vue'
import OrderCreateModal from './components/modal/OrderCreateModal.vue';
import OrderViewModal from './components/modal/OrderViewModal.vue';

export default {
    name: 'Orders',
    components: {
        OrderTable,
        OrderWidget,
        HeaderHero,
        OrderFilter,
        OrderCreateModal,
        OrderViewModal
    },
    data() {
        return {
            showCreateModal: false,
            showViewModal: false,
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
        handleSaveOrder(orderData) {
            console.log('Order Saved:', orderData)
            // Mocking success
            this.showCreateModal = false
        }
    }
}
</script>

<style scoped>
</style>
