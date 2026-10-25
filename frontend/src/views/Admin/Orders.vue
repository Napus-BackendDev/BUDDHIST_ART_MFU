<template>
    <div class="orders-page">
        <HeaderHero :title="$i18n.locale === 'en' ? 'Order Management' : 'จัดการคำสั่งซื้อ'" :description="$i18n.locale === 'en' ? 'Overview and track all customer orders, payments and fulfillment statuses in real-time.' : 'ภาพรวมและติดตามคำสั่งซื้อของลูกค้า การชำระเงิน และสถานะการจัดส่งแบบเรียลไทม์'" icon="cil-cart" :showCreateButton="true" :showExportButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create Order' : 'สร้างคำสั่งซื้อ'" themeColor="blue" @create="onCreateOrder" @export="handleExport" />
        <OrderWidget v-model="filters.status" :orders="orders" />
        <OrderFilter v-model="filters" />
        <OrderTable ref="orderTable" :filters="filters" :items="orders" :loadingItems="loadingItems" :loadingActions="loadingActions" @view-order="onViewOrder" @edit-order="onEditOrder" @approve="handleApproveOrder" @reject="handleRejectOrder"/>
        <OrderCreateModal :show.sync="showCreateModal" :saving="loading" :error="createError" @save="handleSaveOrder" />
        <OrderViewModal :requested-document="requestedDocument" :show.sync="showViewModal" :order="selectedOrder" />
        <OrderEditModal :show.sync="showEditModal" :order="selectedOrder" :saving="loading" @save="handleUpdateOrder" />
        
        <!-- Approval confirmation: approving sells the artwork and emails documents to the buyer -->
        <CModal class="admin-modal" :title="$i18n.locale === 'en' ? 'Approve Order' : 'อนุมัติคำสั่งซื้อ'" :show.sync="showApproveModal" color="success">
            <div class="p-3">
                <p class="mb-0">
                    {{ $i18n.locale === 'en' ? 'Approving marks the artwork as sold and emails the invoice and certificate to the buyer. This cannot be undone.' : 'การอนุมัติจะเปลี่ยนผลงานเป็นขายแล้ว และส่งใบแจ้งหนี้กับใบรับรองให้ผู้ซื้อทางอีเมล ไม่สามารถย้อนกลับได้' }}
                </p>
                <p class="font-weight-bold mt-2 mb-0" v-if="selectedOrder">#{{ selectedOrder.orderNumber || selectedOrder._id }}</p>
            </div>
            <template #footer>
                <CButton color="secondary" @click="showApproveModal = false" :disabled="loading">{{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}</CButton>
                <CButton color="success" @click="confirmApprove" :disabled="loading">{{ loading ? ($i18n.locale === 'en' ? 'Processing...' : 'กำลังดำเนินการ...') : ($i18n.locale === 'en' ? 'Confirm Approve' : 'ยืนยันการอนุมัติ') }}</CButton>
            </template>
        </CModal>

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
            createError: '',
            requestedDocument: '',
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
            showApproveModal: false,
            rejectRemark: '',
            loading: false,
            loadingItems: [],
            loadingActions: {}
        }
    },
    computed: {
        orders() {
            const allOrders = this.$store.getters['order/orders'] || [];
            return allOrders.filter(item => item.status);
        }
    },
    async created() {
        await this.fetchOrders();
        await this.openDocumentFromQuery();
    },
    watch: {
        '$route.query'() { this.openDocumentFromQuery(); }
    },
    methods: {
        async openDocumentFromQuery() {
            const query = this.$route?.query || {};
            if (typeof query.order !== 'string' || !['invoice', 'certificate'].includes(query.document)) return;
            const order = (this.$store.getters['order/orders'] || []).find(item => item._id === query.order);
            if (!order) return;
            this.selectedOrder = order;
            this.showViewModal = true;
            this.requestedDocument = query.document;
        },
        async fetchOrders() {
            try {
                await this.$store.dispatch('order/get');
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        },
        onCreateOrder() {
            this.createError = '';
            this.showCreateModal = true;
        },
        onViewOrder(order) {
            this.requestedDocument = '';
            this.selectedOrder = order;
            this.showViewModal = true;
        },
        onEditOrder(order) {
            this.selectedOrder = order;
            this.showEditModal = true;
        },
        async handleSaveOrder(newOrder) {
            if (this.loading) return;
            this.createError = '';
            let createdOrder = null;
            try {
                this.loading = true;
                // 1. Create the order
                const response = await this.$store.dispatch('order/create', {
                    contact: newOrder.contact,
                    address: newOrder.address,
                    artwork: newOrder.artwork
                });
                
                createdOrder = response.data.data;

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
                if (createdOrder) {
                    this.showCreateModal = false;
                    await this.fetchOrders();
                    const saved = this.$store.getters?.['order/orders']?.find(order => order._id === createdOrder._id);
                    this.onEditOrder(saved || createdOrder);
                }
                this.createError = createdOrder
                    ? (this.$i18n.locale === 'en' ? 'Order saved, but slip upload failed. Open Edit to retry the upload for this order.' : 'สร้างคำสั่งซื้อแล้ว แต่อัปโหลดหลักฐานไม่สำเร็จ กรุณาแนบใหม่ในหน้าต่างแก้ไขคำสั่งซื้อนี้')
                    : (this.$i18n.locale === 'en' ? 'Could not create the order. Your entries are preserved; check artwork availability and try again.' : 'สร้างคำสั่งซื้อไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ กรุณาตรวจสอบว่าผลงานยังพร้อมขายแล้วลองอีกครั้ง');
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: this.createError,
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

                if (updatedOrder._replaceImage) {
                    await this.$store.dispatch('order/replaceSlip', {
                        _id: updatedOrder._id,
                        image: updatedOrder._replaceImage
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
        handleApproveOrder(order) {
            this.selectedOrder = order;
            this.showApproveModal = true;
        },
        async confirmApprove() {
            if (!this.selectedOrder || this.loading) return;
            await this.updateStatus(this.selectedOrder, 'Approved');
            this.showApproveModal = false;
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
                this.$set(this.loadingActions, order._id, statusName);
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
                this.$delete(this.loadingActions, order._id);
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
