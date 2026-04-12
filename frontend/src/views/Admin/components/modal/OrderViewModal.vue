<template>
    <CModal 
        title="Order Details" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="order-view-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-file" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ order.id || 'Order Details' }}</h5>
                        <div class="d-flex align-items-center mt-1">
                            <div :class="['status-badge-small mr-2', order.statusClass]">
                                {{ order.status }}
                            </div>
                            <span class="text-muted small">{{ order.datetime }}</span>
                        </div>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="modal-body-custom px-4 py-3" v-if="order">
            <!-- Customer Information -->
            <div class="info-section mb-4">
                <h6 class="section-title">Customer Information</h6>
                <CRow class="mt-3">
                    <CCol md="6">
                        <div class="info-item">
                            <span class="info-label">Customer Name</span>
                            <div class="info-value">{{ order.customer }}</div>
                        </div>
                    </CCol>
                    <CCol md="6">
                        <div class="info-item">
                            <span class="info-label">Phone Number</span>
                            <div class="info-value">{{ order.phone || '081-XXX-XXXX' }}</div>
                        </div>
                    </CCol>
                </CRow>
                <CRow class="mt-3">
                    <CCol md="12">
                        <div class="info-item">
                            <span class="info-label">Delivery Address</span>
                            <div class="info-value address-value">{{ order.address || 'Not provided' }}</div>
                        </div>
                    </CCol>
                </CRow>
            </div>

            <hr class="section-divider">

            <!-- Artwork Selection Section -->
            <div class="artwork-section mt-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="section-title mb-0">Purchased Artworks</h6>
                    <div class="total-price-display">
                        <span class="text-muted mr-2">Total Amount:</span>
                        <span class="price-value">฿ {{ order.amount || '0' }}</span>
                    </div>
                </div>
                
                <div class="artworks-list-container">
                    <!-- Artwork Item -->
                    <div v-if="order.artworks && order.artworks.length > 0">
                        <div 
                            v-for="art in order.artworks" 
                            :key="art.id" 
                            class="selected-art-item d-flex align-items-center p-3 mb-2 rounded-lg bg-light"
                        >
                            <img :src="art.image" :alt="art.title" class="selected-thumb mr-3">
                            <div class="flex-grow-1">
                                <div class="font-weight-bold text-dark">{{ art.title }}</div>
                                <div class="text-muted small">{{ art.artist }}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-weight-bold text-blue">฿ {{ art.price }}</div>
                            </div>
                        </div>
                    </div>
                    <!-- Fallback for mock data that doesn't have artwork array yet -->
                    <div v-else class="selected-art-item d-flex align-items-center p-3 mb-2 rounded-lg bg-light">
                        <div class="thumbnail-wrapper-view mr-3">
                            <div :style="`background-color: #${order.imgBg || 'eee'}; color: #${order.imgColor || '888'}`" class="thumb-placeholder-view">
                                {{ order.thumbnail || 'A' }}
                            </div>
                        </div>
                        <div class="flex-grow-1">
                            <div class="font-weight-bold text-dark">{{ order.artwork }}</div>
                            <div class="text-muted small">{{ order.artist }}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-weight-bold text-blue">฿ {{ order.amount ? order.amount.replace('$', '').replace(',', '') : '0' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end align-items-center py-2 px-3">
                <CButton 
                    color="primary" 
                    @click="$emit('update:show', false)"
                    class="btn-close-modal"
                >
                    Close Details
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'OrderViewModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        order: {
            type: Object,
            default: () => ({})
        }
    }
}
</script>

<style scoped>
.modal-header-custom {
    padding: 0.5rem 0;
}

.section-title {
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #3b82f6;
    letter-spacing: 0.05em;
    margin-bottom: 0;
}

.info-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.25rem;
}

.info-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
}

.address-value {
    line-height: 1.6;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
}

.section-divider {
    border-top: 1px dashed #e2e8f0;
    margin: 1.5rem 0;
}

.price-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1e293b;
}

/* Artwork Items */
.selected-art-item {
    border: 1px solid #f1f5f9;
    background-color: #ffffff !important;
    transition: all 0.2s;
}

.selected-thumb {
    width: 54px;
    height: 54px;
    border-radius: 10px;
    object-fit: cover;
}

.thumbnail-wrapper-view {
    width: 54px;
    height: 54px;
    border-radius: 10px;
    overflow: hidden;
}

.thumb-placeholder-view {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.2rem;
}

/* Status Badges */
.status-badge-small {
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
}

.badge-completed {
    background-color: #ecfdf5;
    color: #059669;
}

.badge-pending {
    background-color: #fffbeb;
    color: #d97706;
}

.badge-cancelled {
    background-color: #fef2f2;
    color: #dc2626;
}

/* Header UI */
.icon-square {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-blue-light {
    background-color: #3b82f611;
}

.text-blue {
    color: #3b82f6;
}

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

.btn-close-modal {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.7rem 2rem !important;
    font-weight: 600 !important;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

::v-deep .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem 2rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.25rem;
}
</style>
