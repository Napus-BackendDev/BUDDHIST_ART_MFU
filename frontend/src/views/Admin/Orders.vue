<template>
    <div class="orders-page">
        <HeaderHero :title="$i18n.locale === 'en' ? 'Order Management' : 'จัดการคำสั่งซื้อ'" :description="$i18n.locale === 'en' ? 'Overview and track all customer orders, payments and fulfillment statuses in real-time.' : 'ภาพรวมและติดตามคำสั่งซื้อของลูกค้า การชำระเงิน และสถานะการจัดส่งแบบเรียลไทม์'" icon="cil-cart" :showCreateButton="true" :showExportButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create Order' : 'สร้างคำสั่งซื้อ'" themeColor="blue" @create="onCreateOrder" @export="handleExport" />
        <OrderWidget v-model="filters.status" :orders="orders" />
        <OrderFilter v-model="filters" />
        <OrderTable ref="orderTable" :filters="filters" :items="orders" :loadingItems="loadingItems" @view-order="onViewOrder" @edit-order="onEditOrder" @approve="handleApproveOrder" @reject="handleRejectOrder"/>
        <OrderCreateModal :show.sync="showCreateModal" :saving="loading" @save="handleSaveOrder" />
        <OrderViewModal :show.sync="showViewModal" :order="selectedOrder" />
        <OrderEditModal :show.sync="showEditModal" :order="selectedOrder" :saving="loading" @save="handleUpdateOrder" />
        
        <!-- Rejection Reason Modal -->
        <CModal class="admin-modal" :title="$i18n.locale === 'en' ? 'Reject Order' : 'ปฏิเสธคำสั่งซื้อ'" :show.sync="showRejectModal" color="danger" size="lg">
            <div class="p-3">
                <p class="text-muted mb-3">
                    {{ $i18n.locale === 'en' ? 'Please provide a reason for rejecting this order. This message will be sent to the customer via email.' : 'กรุณาระบุเหตุผลในการปฏิเสธคำสั่งซื้อนี้ ข้อความนี้จะถูกส่งไปยังอีเมลของลูกค้า' }}
                </p>
                <CTextarea 
                    v-model="rejectRemark" 
                    :placeholder="$i18n.locale === 'en' ? 'Enter reason for rejection...' : 'ระบุเหตุผล...'" 
                    rows="5"
                    class="reject-textarea"
                />
            </div>
            <template #footer>
                <CButton color="secondary" @click="showRejectModal = false" :disabled="loading">{{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}</CButton>
                <CButton color="danger" @click="confirmReject" :disabled="!rejectRemark || loading">
                    <CIcon v-if="loading" name="cil-reload" class="mr-2 spinner-animation" />
                    {{ loading ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังดำเนินการ...') : ($i18n.locale === 'en' ? 'Confirm Reject' : 'ยืนยันการปฏิเสธ') }}
                </CButton>
            </template>
        </CModal>
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
                endDate: null,
                quickRange: 'All Time'
            },
            showRejectModal: false,
            rejectRemark: '',
            loading: false,
            loadingItems: []
        }
    },
    computed: {
        orders() {
            const allOrders = this.$store.getters['order/orders'] || [];
            return allOrders.filter(item => {
                if (!item.status) return false;
                let statusStr = '';
                if (typeof item.status === 'string') {
                    statusStr = item.status.toLowerCase();
                } else if (item.status && Array.isArray(item.status.title)) {
                    const enVal = item.status.title.find(t => t.key === 'en')?.value || '';
                    const thVal = item.status.title.find(t => t.key === 'th')?.value || '';
                    statusStr = (enVal + ' ' + thVal).toLowerCase();
                } else if (item.status && item.status.title) {
                    statusStr = String(item.status.title).toLowerCase();
                }
                
                // Exclude Pending Payment (รอชำระเงิน) / Reserved / payment
                const isPendingPayment = statusStr.includes('รอชำระเงิน') || 
                                         statusStr.includes('payment') || 
                                         statusStr.includes('reserved');
                return !isPendingPayment;
            });
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
                this.loading = true;
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
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'Order created successfully.' : 'สร้างคำสั่งซื้อเรียบร้อยแล้ว',
                    variant: 'success'
                });

                // 4. Refresh and close
                await this.fetchOrders();
                this.showCreateModal = false;
            } catch (error) {
                console.error('Error creating order:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: error.response?.data?.message || (this.$i18n.locale === 'en' ? 'Failed to create order.' : 'ไม่สามารถสร้างคำสั่งซื้อได้'),
                    variant: 'danger'
                });
            } finally {
                this.loading = false;
            }
        },
        async handleUpdateOrder(updatedOrder) {
            try {
                this.loading = true;
                await this.$store.dispatch('order/update', updatedOrder);
                
                if (updatedOrder._image) {
                    await this.$store.dispatch('order/upload', {
                        _id: updatedOrder._id,
                        image: updatedOrder._image
                    });
                }

                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'Order updated successfully.' : 'อัปเดตคำสั่งซื้อเรียบร้อยแล้ว',
                    variant: 'success'
                });

                await this.fetchOrders();
                this.showEditModal = false;
            } catch (error) {
                console.error('Error updating order:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: error.response?.data?.message || (this.$i18n.locale === 'en' ? 'Failed to update order.' : 'ไม่สามารถอัปเดตคำสั่งซื้อได้'),
                    variant: 'danger'
                });
            } finally {
                this.loading = false;
            }
        },
        async handleApproveOrder(order) {
            await this.updateStatus(order, 'Approved');
        },
        async handleRejectOrder(order) {
            this.selectedOrder = order;
            this.rejectRemark = '';
            this.showRejectModal = true;
        },
        async confirmReject() {
            if (!this.rejectRemark) return;
            await this.updateStatus(this.selectedOrder, 'Rejected', this.rejectRemark);
            this.showRejectModal = false;
        },
        async updateStatus(order, statusName, remark = null) {
            try {
                this.loading = true;
                this.loadingItems.push(order._id);
                await this.$store.dispatch('setting/status/get');
                const statuses = this.$store.getters['setting/status/item'] || [];
                const targetStatus = statuses.find(s => {
                    const title = s.title || [];
                    const enStatus = title.find(t => t.key === 'en');
                    return (enStatus ? enStatus.value : '') === statusName;
                });
 
                if (!targetStatus) throw new Error(`Status ${statusName} not found`);
 
                const payload = {
                    _id: order._id,
                    status: targetStatus._id
                };

                if (remark) {
                    payload.remark = remark;
                }

                await this.$store.dispatch('order/update', payload);
                
                await this.fetchOrders();
                
                let translatedStatus = statusName;
                if (statusName === 'Approved') {
                    translatedStatus = this.$i18n.locale === 'en' ? 'Approved' : 'อนุมัติ';
                } else if (statusName === 'Rejected') {
                    translatedStatus = this.$i18n.locale === 'en' ? 'Rejected' : 'ปฏิเสธ';
                }

                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' 
                        ? `Order status updated to ${statusName}.` 
                        : `อัปเดตสถานะคำสั่งซื้อเป็น ${translatedStatus} เรียบร้อยแล้ว`,
                    variant: 'success'
                });
            } catch (error) {
                console.error('Error updating order status:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: error.message || (this.$i18n.locale === 'en' ? 'Failed to update order status.' : 'ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้'),
                    variant: 'danger'
                });
            } finally {
                this.loading = false;
                this.loadingItems = this.loadingItems.filter(id => id !== order._id);
            }
        },
        async handleExport() {
            if (this.$refs.orderTable) {
                await this.$refs.orderTable.exportExcel();
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
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
