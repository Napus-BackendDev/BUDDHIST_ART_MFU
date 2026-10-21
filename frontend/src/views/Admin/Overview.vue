<template>
    <div>
        <HeaderHero 
            :title="$i18n.locale === 'en' ? 'Admin Dashboard' : 'แผงควบคุมหลัก'" 
            :subtitle="$i18n.locale === 'en' ? 'Welcome back! Here\'s what\'s happening with your platform today.' : 'ยินดีต้อนรับกลับ! นี่คือความเคลื่อนไหวบนแพลตฟอร์มของคุณในวันนี้'"
            icon="cil-speedometer"
        />
        <div v-if="statusError && !showRejectModal" class="alert alert-danger" role="alert">{{ statusError }}</div>
        <WidgetsDashboard />
        <CRow class="mb-4">
            <CCol md="8" sm="12">
                <LineCharts class="h-100" />
            </CCol>
            <CCol md="4" sm="12">
                <PendingApproval class="h-100" />
            </CCol>
        </CRow>
        <CRow class="mb-4">
            <CCol md="12">
                <OrderTable 
                    :title="$i18n.locale === 'en' ? 'Recent Orders' : 'คำสั่งซื้อล่าสุด'" 
                    :items="orders" 
                    :loadingItems="loadingItems"
                    @view-order="onViewOrder"
                    @edit-order="onEditOrder"
                    @approve="handleApproveOrder"
                    @reject="handleRejectOrder"
                />
            </CCol>
        </CRow>

        <!-- Order View Modal -->
        <OrderViewModal :show.sync="showViewModal" :order="selectedOrder" />

        <!-- Order Edit Modal -->
        <OrderEditModal :show.sync="showEditModal" :order="selectedOrder" @save="handleUpdateOrder" />

        <!-- Rejection Reason Modal -->
        <CModal class="admin-modal" :title="$i18n.locale === 'en' ? 'Reject Order' : 'ปฏิเสธคำสั่งซื้อ'" :show.sync="showRejectModal" color="danger" size="lg">
            <div class="p-3">
                <div v-if="statusError" class="alert alert-danger" role="alert">{{ statusError }}</div>
                <p class="text-muted mb-3">
                    {{ $i18n.locale === 'en' ? 'Please provide a reason for rejecting this order. This message will be sent to the customer via email.' : 'กรุณาระบุเหตุผลในการปฏิเสธคำสั่งซื้อนี้ ข้อความนี้จะถูกส่งไปยังอีเมลของลูกค้า' }}
                </p>
                <CTextarea 
                    v-model="rejectRemark" 
                    :label="$i18n.locale === 'en' ? 'Rejection reason' : 'เหตุผลที่ปฏิเสธ'"
                    :placeholder="$i18n.locale === 'en' ? 'Enter reason for rejection...' : 'ระบุเหตุผล...'" 
                    rows="5"
                    style="border-radius: 8px;"
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
import WidgetsDashboard from './components/WidgetsDashboard.vue'
import HeaderHero from './components/HeaderHero.vue'
import LineCharts from './components/charts/LineCharts.vue';
import PendingApproval from './components/PendingApproval.vue';
import OrderTable from './components/table/OrderTable.vue';
import OrderViewModal from './components/modal/order/OrderViewModal.vue';
import OrderEditModal from './components/modal/order/OrderEditModal.vue';

export default {
    name: 'Overview',
    components: {
        WidgetsDashboard,
        HeaderHero,
        LineCharts,
        PendingApproval,
        OrderTable,
        OrderViewModal,
        OrderEditModal
    },
    data() {
        return {
            showViewModal: false,
            showEditModal: false,
            selectedOrder: null,
            showRejectModal: false,
            rejectRemark: '',
            loading: false,
            statusError: '',
            loadingItems: []
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
        onViewOrder(order) {
            this.selectedOrder = order;
            this.showViewModal = true;
        },
        onEditOrder(order) {
            this.selectedOrder = order;
            this.showEditModal = true;
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
            this.statusError = '';
            this.showRejectModal = true;
        },
        async confirmReject() {
            if (!this.rejectRemark) return;
            const saved = await this.updateStatus(this.selectedOrder, 'Rejected', this.rejectRemark);
            if (saved) this.showRejectModal = false;
        },
        async updateStatus(order, statusName, remark = null) {
            this.statusError = '';
            try {
                this.loading = true;
                this.loadingItems.push(order._id);
                await this.$store.dispatch('setting/status/get');
                const statuses = this.$store.getters['setting/status/item'] || [];
                const code = { Approved: 'APPROVED', Rejected: 'REJECTED' }[statusName];
                const targetStatus = statuses.find(s => code && s.code === code) || statuses.find(s => {
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
                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: `Order status updated to ${statusName}.`,
                    variant: 'success'
                });
                return true;
            } catch (error) {
                console.error('Error updating order status:', error);
                const message = error.response && error.response.data && error.response.data.message;
                const translated = Array.isArray(message)
                    ? (message.find(item => item.key === this.$i18n.locale) || message[0] || {}).value : message;
                this.statusError = typeof translated === 'string' && translated ||
                    (this.$i18n.locale === 'en' ? 'Unable to update order status. Please try again.' : 'เปลี่ยนสถานะคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่');
                this.$store.commit('dialog/showToast', {
                    title: 'Error',
                    message: error.message || 'Failed to update order status.',
                    variant: 'danger'
                });
                return false;
            } finally {
                this.loading = false;
                this.loadingItems = this.loadingItems.filter(id => id !== order._id);
            }
        }
    }
}
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
