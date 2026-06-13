<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="view-artwork-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-magnifying-glass" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Artwork Details</h5>
                        <p class="text-muted small mb-0">Detailed view of your submitted artwork.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-4 py-3" v-if="artwork">
            <div class="artwork-detail-container">
                <!-- 1) Image Section -->
                <div class="view-section mb-4 text-center">
                    <div class="artwork-image-view rounded-xl overflow-hidden shadow-sm border mx-auto">
                        <img 
                            :src="artwork.image || `https://via.placeholder.com/600/e2e8f0/808080?text=${getName('en', artwork).charAt(0)}`" 
                            class="w-100 h-100 object-fit-contain bg-white" 
                            :alt="getName('en', artwork)"
                        />
                    </div>
                </div>

                <!-- 2) Status Section -->
                <div class="view-section mb-4">
                    <div class="d-flex flex-wrap align-items-center justify-content-center gap-4 status-container-stacked">
                        <div class="status-item text-center px-3">
                            <label class="view-label-center">Approval Status</label>
                            <CBadge :class="['status-badge-lg px-4 py-2', getStatusInfo(artwork).approval.class]">
                                <CIcon :name="getStatusInfo(artwork).approval.icon" size="sm" class="status-icon-lg" />
                                {{ getStatusInfo(artwork).approval.label }}
                            </CBadge>
                        </div>
                        <div class="status-item text-center px-3 border-left-light">
                            <label class="view-label-center">Sale Status</label>
                            <CBadge :class="['status-badge-lg px-4 py-2', getStatusInfo(artwork).sale.class]">
                                <CIcon :name="getStatusInfo(artwork).sale.icon" size="sm" class="status-icon-lg" />
                                {{ getStatusInfo(artwork).sale.label }}
                            </CBadge>
                        </div>
                    </div>
                </div>

                <hr class="my-4 opacity-5">

                <!-- 3) Artwork Title (TH, EN) -->
                <div class="row mb-4">
                    <div class="col-md-6 mb-3 mb-md-0">
                        <div class="view-section">
                            <label class="view-label">Artwork Title (Thai)</label>
                            <h2 class="view-value-title font-weight-bold mb-0 text-dark">{{ getName('th', artwork) }}</h2>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="view-section">
                            <label class="view-label">Artwork Title (English)</label>
                            <h2 class="view-value-title font-weight-bold mb-0 text-muted">{{ getName('en', artwork) }}</h2>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <!-- 4) Artist -->
                    <div class="col-md-6 mb-4">
                        <div class="view-section">
                            <label class="view-label">Artist</label>
                            <div class="d-flex align-items-center">
                                <div class="artist-avatar-md mr-3" :style="{ backgroundColor: getAvatarColor(artwork.artist || artwork.owner) }">
                                    {{ getInitials(artwork.artist || artwork.owner) }}
                                </div>
                                <div class="view-value">
                                    <div class="font-weight-bold text-dark h5 mb-0">
                                        {{ (artwork.artist || artwork.owner) ? getName('en', artwork.artist || artwork.owner) : 'N/A' }}
                                    </div>
                                    <div v-if="(artwork.artist || artwork.owner) && (artwork.artist || artwork.owner).studentId" class="small text-muted">ID: {{ (artwork.artist || artwork.owner).studentId }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5) Category -->
                    <div class="col-md-6 mb-4">
                        <div class="view-section">
                            <label class="view-label">Category</label>
                            <div class="view-value font-weight-bold text-dark h5">
                                {{ artwork.category ? getName('en', artwork.category) : 'N/A' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 6) Technique, Size & Remark -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3 mb-md-0">
                        <div class="view-section p-4 bg-white rounded-xl border-premium-sm shadow-sm h-100">
                            <label class="view-label">Technique</label>
                            <div class="view-value text-dark mb-2 d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">TH</span> 
                                <span class="font-weight-bold">{{ artwork.technique ? getName('th', artwork.technique) : 'N/A' }}</span>
                            </div>
                            <div class="view-value text-muted d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">EN</span> 
                                <span>{{ artwork.technique ? getName('en', artwork.technique) : 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3 mb-md-0">
                        <div class="view-section p-4 bg-white rounded-xl border-premium-sm shadow-sm h-100">
                            <label class="view-label">Size</label>
                            <div class="view-value text-dark mb-2 d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">TH</span> 
                                <span class="font-weight-bold">{{ artwork.size ? getName('th', artwork.size) : 'N/A' }}</span>
                            </div>
                            <div class="view-value text-muted d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">EN</span> 
                                <span>{{ artwork.size ? getName('en', artwork.size) : 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="view-section p-4 bg-white rounded-xl border-premium-sm shadow-sm h-100">
                            <label class="view-label">Remark</label>
                            <div class="view-value text-dark mb-2 d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">TH</span> 
                                <span class="font-weight-bold">{{ artwork.remark ? getName('th', artwork.remark) : 'N/A' }}</span>
                            </div>
                            <div class="view-value text-muted d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">EN</span> 
                                <span>{{ artwork.remark ? getName('en', artwork.remark) : 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 7) Price / Value -->
                <div class="view-section mb-4 p-3 border rounded-xl bg-primary-faded">
                    <label class="view-label mb-1">Price / Value</label>
                    <div class="view-value-price font-weight-bold h2 mb-0 text-primary">
                        ฿ {{ formatPrice(artwork.price) }}
                    </div>
                </div>

                <!-- 8) Description (EN) -->
                <div class="view-section mb-4">
                    <label class="view-label">Description (English)</label>
                    <div class="view-description-box p-3 border rounded-lg bg-white shadow-sm">
                        {{ (artwork.description && artwork.description.length > 0) ? getName('en', artwork.description) : 'No English description provided.' }}
                    </div>
                </div>

                <!-- 9) Description (TH) -->
                <div class="view-section mb-4">
                    <label class="view-label">Description (Thai)</label>
                    <div class="view-description-box p-3 border rounded-lg bg-white shadow-sm">
                        {{ (artwork.description && artwork.description.length > 0) ? getName('th', artwork.description) : 'ไม่มีคำอธิบายภาษาไทย.' }}
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end py-2">
                <CButton 
                    color="light" 
                    @click="$emit('update:show', false)"
                    class="btn-close-view px-4"
                >
                    Close
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'ArtworkViewModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        artwork: {
            type: Object,
            default: () => null
        }
    },
    methods: {
        getName(lang, item) {
            if (!item) return '';
            
            // 1. If item itself is a string
            if (typeof item === 'string') return item;
            
            // 2. If item is the array itself
            if (Array.isArray(item)) {
                const target = item.find(n => n.key === lang) || item[0];
                return target ? target.value : '';
            }
            
            // 3. If item is an object with title/name/key properties
            const field = item.title || item.name || item.key;
            if (field) {
                if (typeof field === 'string') return field;
                if (Array.isArray(field)) {
                    const target = field.find(n => n.key === lang) || field[0];
                    return target ? target.value : '';
                }
            }
            
            // 4. Default if nothing matches but item is an object
            if (typeof item === 'object') {
                return item.value || '';
            }
            
            return '';
        },
        getInitials(artist) {
            const name = this.getName('en', artist);
            if (!name) return '??';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        },
        getAvatarColor(artist) {
            const colors = ['#e06e64', '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#a0aec0'];
            const name = this.getName('en', artist);
            if (!name) return colors[0];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
            return isNaN(num) ? '0.00' : num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        getStatusInfo(item) {
            const defaultStatus = { label: 'N/A', class: 'status-pending', icon: 'cil-question-mark' };
            if (!item || !item.status) return { approval: defaultStatus, sale: defaultStatus };
            
            let approvalStatus = null;
            let saleStatus = null;

            if (item.status && item.status.approval) {
                approvalStatus = item.status.approval;
                saleStatus = item.status.sale;
            } else if (item.status) {
                approvalStatus = item.status;
            }

            // Approval Status Logic
            const appLabel = approvalStatus ? this.getName('en', approvalStatus) : 'Pending';
            let approval = { ...defaultStatus, label: appLabel };
            
            switch (appLabel) {
                case 'Approved': approval = { label: 'Approved', class: 'status-completed', icon: 'cil-check-circle' }; break;
                case 'Rejected': approval = { label: 'Rejected', class: 'status-cancelled', icon: 'cil-ban' }; break;
                case 'Revised': approval = { label: 'Needs Revision', class: 'status-update', icon: 'cil-reload' }; break;
                default: approval = { label: appLabel, class: 'status-pending', icon: 'cil-clock' };
            }

            // Sale Status Logic
            const saleLabel = saleStatus ? this.getName('en', saleStatus) : 'Not for Sale';
            let sale = { ...defaultStatus, label: saleLabel };

            switch (saleLabel) {
                case 'Available': sale = { label: 'Available', class: 'status-completed', icon: 'cil-cart' }; break;
                case 'Sold Out': sale = { label: 'Sold Out', class: 'status-cancelled', icon: 'cil-lock-locked' }; break;
                case 'Exhibition': sale = { label: 'In Exhibition', class: 'status-update', icon: 'cil-tv' }; break;
                default: sale = { label: saleLabel, class: 'status-pending', icon: 'cil-tag' };
            }

            return { approval, sale };
        }
    }
}
</script>

<style scoped>
.view-artwork-modal {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.artwork-detail-container {
    max-width: 800px;
    margin: 0 auto;
}

.artwork-image-view {
    max-width: 100%;
    height: 450px;
    background-color: #f8fafc;
}

.view-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.6rem;
    letter-spacing: 0.08em;
}

.view-label-center {
    display: block;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
}

.view-value-title {
    color: #0f172a;
    font-size: 1.75rem;
    line-height: 1.2;
}

.view-value-subtitle {
    font-size: 1.15rem;
    font-weight: 500;
    color: #64748b;
}

.artist-avatar-md {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.status-container-stacked {
    padding: 1rem 0;
}

.status-badge-lg {
    display: inline-flex;
    align-items: center;
    border-radius: 99px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    border: 1px solid transparent;
}

.status-icon-lg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.border-left-light {
    border-left: 1px solid #f1f5f9;
}

.bg-primary-faded {
    background-color: #3b82f608;
    border-color: #3b82f622 !important;
}

.view-description-box {
    line-height: 1.7;
    font-size: 1rem;
    color: #334155;
    white-space: pre-line;
}

.badge-white-outline {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    font-weight: 800;
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 6px;
    min-width: 32px;
    text-align: center;
}

.border-premium-sm {
    border: 2px solid #f1f5f9 !important;
}

.status-completed {
    background-color: #f0fdf4;
    color: #166534;
    border-color: #bbf7d0;
}

.status-pending {
    background-color: #fffbeb;
    color: #92400e;
    border-color: #fef3c7;
}

.status-cancelled {
    background-color: #fef2f2;
    color: #991b1b;
    border-color: #fee2e2;
}

.status-update {
    background-color: #eff6ff;
    color: #1e40af;
    border-color: #dbeafe;
}

.btn-close-view {
    border-radius: 12px;
    font-weight: 600;
    padding: 0.6rem 2.5rem;
}

::v-deep .modal-content {
    border-radius: 24px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.rounded-xl { border-radius: 20px; }
.rounded-lg { border-radius: 12px; }

@media (max-width: 768px) {
    .border-left-light {
        border-left: none;
        border-top: 1px solid #f1f5f9;
        padding-top: 1.5rem;
        width: 100%;
    }
    .artwork-image-view {
        height: 300px;
    }
}
</style>
