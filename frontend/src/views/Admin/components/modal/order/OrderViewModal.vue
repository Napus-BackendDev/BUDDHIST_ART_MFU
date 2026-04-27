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
                        <h5 class="modal-title font-weight-bold" v-if="order && order._id">
                            ORD-{{ order._id.substring(order._id.length - 8).toUpperCase() }}
                        </h5>
                        <h5 class="modal-title font-weight-bold" v-else>Order Details</h5>
                        <div class="d-flex align-items-center mt-1">
                            <div :class="['status-badge-small mr-2', getStatusInfo(order).class]">
                                {{ getStatusInfo(order).label }}
                            </div>
                            <span class="text-muted small">{{ formatDate(order.createdAt) }}</span>
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
                            <div class="info-value">{{ order.contact ? order.contact.name : 'N/A' }}</div>
                        </div>
                    </CCol>
                    <CCol md="6">
                        <div class="info-item">
                            <span class="info-label">Phone Number</span>
                            <div class="info-value">{{ order.contact ? order.contact.telephone : 'N/A' }}</div>
                        </div>
                    </CCol>
                </CRow>
                <CRow class="mt-3">
                    <CCol md="12">
                        <div class="info-item">
                            <span class="info-label">Email Address</span>
                            <div class="info-value">{{ order.contact ? order.contact.email : 'N/A' }}</div>
                        </div>
                    </CCol>
                </CRow>
                <CRow class="mt-3">
                    <CCol md="6">
                        <div class="info-item">
                            <span class="info-label">Billing Address</span>
                            <div class="info-value address-value">{{ order.address && order.address.bill ? order.address.bill : 'Not provided' }}</div>
                        </div>
                    </CCol>
                    <CCol md="6">
                        <div class="info-item">
                            <span class="info-label">Shipping Address</span>
                            <div class="info-value address-value">{{ order.address && order.address.shipping ? order.address.shipping : 'Not provided' }}</div>
                        </div>
                    </CCol>
                </CRow>
            </div>

            <hr class="section-divider">

            <hr class="section-divider">
            
            <!-- Shipping & Tracking -->
            <div class="shipping-section mt-4">
                <h6 class="section-title mb-3">Shipping & Tracking</h6>
                <CRow>
                    <CCol md="4">
                        <div class="info-item">
                            <span class="info-label">Carrier</span>
                            <div class="info-value">{{ order.carrier || 'Thailand Post' }}</div>
                        </div>
                    </CCol>
                    <CCol md="4">
                        <div class="info-item">
                            <span class="info-label">Tracking ID</span>
                            <div class="info-value font-family-mono">{{ order.trackingId || 'Not assigned' }}</div>
                        </div>
                    </CCol>
                    <CCol md="4">
                        <div class="info-item">
                            <span class="info-label">Expected Delivery</span>
                            <div class="info-value">{{ order.deliveryDate ? formatDateShort(order.deliveryDate) : 'To be confirmed' }}</div>
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
                        <span class="price-value">฿ {{ totalAmount }}</span>
                    </div>
                </div>
                
                <div class="artworks-list-container">
                    <div v-if="order.artwork && order.artwork.length > 0">
                        <div 
                            v-for="art in order.artwork" 
                            :key="art._id" 
                            class="selected-art-item d-flex align-items-center p-3 mb-2 rounded-lg bg-light"
                        >
                            <img :src="art.image || `https://via.placeholder.com/54/eee/888?text=${getName('en', art).charAt(0)}`" :alt="getName('en', art)" class="selected-thumb mr-3">
                            <div class="flex-grow-1">
                                <div class="font-weight-bold text-dark">{{ getName('en', art) }}</div>
                                <div class="text-muted small">
                                    {{ art.artist ? getName('en', art.artist) : 'Unknown Artist' }}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-weight-bold text-blue">฿ {{ formatPrice(art.price) }}</div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-4 text-muted border rounded-lg bg-light italic">
                        No artworks associated with this order.
                    </div>
                </div>
            </div>

            <!-- Proof of Payment (Image) -->
            <div class="mt-4" v-if="order.image">
                <h6 class="section-title mb-3">Proof of Payment</h6>
                <div class="payment-proof-container">
                    <img :src="order.image" alt="Payment Proof" class="payment-proof-img img-fluid rounded-lg">
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
import moment from 'moment';

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
    },
    computed: {
        totalAmount() {
            if (!this.order || !this.order.artwork) return '0.00';
            const total = this.order.artwork.reduce((sum, art) => sum + (parseFloat(art.price) || 0), 0);
            return this.formatPrice(total);
        }
    },
    methods: {
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            if (Array.isArray(item)) {
                const target = item.find(n => n.key === lang) || item[0];
                return target ? target.value : '';
            }
            const field = item.title || item.name || item.key;
            if (field) {
                if (typeof field === 'string') return field;
                if (Array.isArray(field)) {
                    const target = field.find(n => n.key === lang) || field[0];
                    return target ? target.value : '';
                }
            }
            return item.value || '';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY hh:mm A');
        },
        formatDateShort(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY');
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        getStatusInfo() {
            if (!this.order || !this.order.status) return { label: 'Pending', class: 'badge-pending' };
            const status = this.getName('en', this.order.status);
            switch (status) {
                case 'Completed':
                case 'Success':
                case 'Approved':
                    return { label: 'Completed', class: 'badge-completed' };
                case 'Cancelled':
                case 'Rejected':
                    return { label: 'Cancelled', class: 'badge-cancelled' };
                default:
                    return { label: status || 'Pending', class: 'badge-pending' };
            }
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
    min-height: 80px;
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

/* Timeline */
.timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 12px;
}

.marker-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #cbd5e1;
}

.marker-dot.latest {
    background-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.marker-line {
    flex-grow: 1;
    width: 2px;
    background-color: #f1f5f9;
    margin: 4px 0;
}

.smallest {
    font-size: 0.7rem;
}

.font-family-mono {
    font-family: monospace;
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

.payment-proof-container {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    text-align: center;
}

.payment-proof-img {
    max-height: 400px;
    object-fit: contain;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Status Badges */
.status-badge-small {
    padding: 0.35rem 1rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-width: 1px;
    border-style: solid;
}

.badge-completed {
    background-color: #f0fff4;
    color: #38a169;
    border-color: rgba(56, 161, 105, 0.4);
}

.badge-pending {
    background-color: #fffaf0;
    color: #d69e2e;
    border-color: rgba(214, 158, 46, 0.4);
}

.badge-cancelled {
    background-color: #fff5f5;
    color: #e53e3e;
    border-color: rgba(229, 62, 62, 0.4);
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
