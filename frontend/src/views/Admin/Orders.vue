<template>
    <div class="orders-page">
        <HeaderHero title="Order Management" description="Overview and track all customer orders, payments and fulfillment statuses in real-time." icon="cil-cart" :showCreateButton="true" :showExportButton="true" createButtonText="Create Order" @create="onCreateOrder" @export="handleExport" />
        <OrderWidget v-model="filters.status" :orders="orders" />
        <OrderFilter v-model="filters" />
        <OrderTable ref="orderTable" :filters="filters" :items="orders" @view-order="onViewOrder" @edit-order="onEditOrder" @approve="handleApproveOrder" @reject="handleRejectOrder"/>
        <OrderCreateModal :show.sync="showCreateModal" @save="handleSaveOrder" />
        <OrderViewModal :show.sync="showViewModal" :order="selectedOrder" />
        <OrderEditModal :show.sync="showEditModal" :order="selectedOrder" @save="handleUpdateOrder" />
    </div>
</template>

<script>
import HeaderHero from './components/HeaderHero.vue'
import OrderWidget from './components/widget/OrderWidget.vue'
import OrderFilter from './components/filter/OrderFilter.vue'
import OrderTable from './components/table/OrderTable.vue'
import OrderCreateModal from './components/modal/order/OrderCreateModal.vue'
import OrderViewModal from './components/modal/order/OrderViewModal.vue'
import OrderEditModal from './components/modal/order/OrderEditModal.vue'

export default {
    name: 'Orders',
    components: {
        HeaderHero,
        OrderWidget,
        OrderFilter,
        OrderTable,
        OrderCreateModal,
        OrderViewModal,
        OrderEditModal
    },
    data() {
        return {
            showCreateModal: false,
            showViewModal: false,
            showEditModal: false,
            selectedOrder: null,
            filters: {
                search: '',
                status: 'All Status',
                startDate: null,
                endDate: null
            }
        }
    },
    computed: {
        orders() {
            return this.$store.getters['order/orders'] || [];
        }
    },
    created() {
        this.fetchOrders();
    },
    methods: {
        async fetchOrders() {
            try {
                await this.$store.dispatch('order/get');
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        },
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
        async handleSaveOrder(newOrder) {
            try {
                // 1. Create the order
                const response = await this.$store.dispatch('order/create', {
                    contact: newOrder.contact,
                    address: newOrder.address,
                    artwork: newOrder.artwork
                });
                
                const createdOrder = response.data.data;

                // 2. Upload image if exists
                if (newOrder._image) {
                    await this.$store.dispatch('order/upload', {
                        _id: createdOrder._id,
                        image: newOrder._image
                    });
                }

                // 3. Success feedback
                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: 'Order created successfully.',
                    variant: 'success'
                });

                // 4. Refresh and close
                await this.fetchOrders();
                this.showCreateModal = false;
            } catch (error) {
                console.error('Error creating order:', error);
                this.$store.commit('dialog/showToast', {
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to create order.',
                    variant: 'danger'
                });
            }
        },
        async handleUpdateOrder(updatedOrder) {
            try {
                await this.$store.dispatch('order/update', updatedOrder);
                
                if (updatedOrder._image) {
                    await this.$store.dispatch('order/upload', {
                        _id: updatedOrder._id,
                        image: updatedOrder._image
                    });
                }

                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: 'Order updated successfully.',
                    variant: 'success'
                });

                await this.fetchOrders();
                this.showEditModal = false;
            } catch (error) {
                console.error('Error updating order:', error);
                this.$store.commit('dialog/showToast', {
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to update order.',
                    variant: 'danger'
                });
            }
        },
        async handleApproveOrder(order) {
            await this.updateStatus(order, 'Approved');
        },
        async handleRejectOrder(order) {
            await this.updateStatus(order, 'Rejected');
        },
        async updateStatus(order, statusName) {
            try {
                await this.$store.dispatch('setting/status/get');
                const statuses = this.$store.getters['setting/status/item'] || [];
                const targetStatus = statuses.find(s => {
                    const title = s.title || [];
                    const enStatus = title.find(t => t.key === 'en');
                    return (enStatus ? enStatus.value : '') === statusName;
                });

                if (!targetStatus) throw new Error(`Status ${statusName} not found`);

                await this.$store.dispatch('order/update', {
                    _id: order._id,
                    status: targetStatus._id
                });
                
                await this.fetchOrders();
                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: `Order status updated to ${statusName}.`,
                    variant: 'success'
                });
            } catch (error) {
                console.error('Error updating order status:', error);
                this.$store.commit('dialog/showToast', {
                    title: 'Error',
                    message: error.message || 'Failed to update order status.',
                    variant: 'danger'
                });
            }
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
.orders-page {
    padding: 0;
    min-height: 100vh;
    position: relative;
    overflow: visible !important;
}
</style>
