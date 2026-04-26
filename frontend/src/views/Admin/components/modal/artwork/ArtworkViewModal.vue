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
                        <p class="text-muted small mb-0">Detailed view of the selected artwork.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2" v-if="artwork">
            <CRow>
                <!-- Image Section -->
                <CCol md="5" class="mb-4 mb-md-0">
                    <div class="artwork-image-view rounded-xl overflow-hidden shadow-sm border">
                        <img 
                            :src="artwork.image || `https://via.placeholder.com/400/e2e8f0/808080?text=${getName('en', artwork).charAt(0)}`" 
                            class="w-100 h-100 object-fit-contain bg-white" 
                            :alt="getName('en', artwork)"
                        />
                    </div>
                    <div class="mt-4 d-flex flex-wrap align-items-center justify-content-center status-container">
                        <div class="mr-4 mb-2 d-flex align-items-center justify-content-between">
                            <span class="status-label-text mr-2">Approval:</span>
                            <CBadge :class="['status-badge-lg px-3 py-2', getStatusInfo(artwork).approval.class]">
                                <CIcon :name="getStatusInfo(artwork).approval.icon" size="sm" class="status-icon-lg" />
                                {{ getStatusInfo(artwork).approval.label }}
                            </CBadge>
                        </div>
                        <div class="mb-2 d-flex align-items-center justify-content-between">
                            <span class="status-label-text mr-2">Sale:</span>
                            <CBadge :class="['status-badge-lg px-3 py-2', getStatusInfo(artwork).sale.class]">
                                <CIcon :name="getStatusInfo(artwork).sale.icon" size="sm" class="status-icon-lg" />
                                {{ getStatusInfo(artwork).sale.label }}
                            </CBadge>
                        </div>
                    </div>
                </CCol>

                <!-- Info Section -->
                <CCol md="7">
                    <div class="view-group mb-4">
                        <label class="view-label">Artwork Title</label>
                        <h3 class="view-value-title font-weight-bold">{{ getName('en', artwork) }}</h3>
                    </div>

                    <CRow class="mb-4">
                        <CCol sm="6">
                            <div class="view-group">
                                <label class="view-label">Artist</label>
                                <div class="d-flex align-items-center">
                                    <div class="artist-avatar-sm mr-2" :style="{ backgroundColor: getAvatarColor(artwork.artist) }">
                                        {{ getInitials(artwork.artist) }}
                                    </div>
                                    <div class="view-value font-weight-bold text-dark">
                                        {{ artwork.artist ? getName('en', artwork.artist) : 'N/A' }}
                                        <div v-if="artwork.artist && artwork.artist.studentId" class="small text-muted">ID: {{ artwork.artist.studentId }}</div>
                                    </div>
                                </div>
                            </div>
                        </CCol>
                        <CCol sm="6">
                            <div class="view-group">
                                <label class="view-label">Category</label>
                                <div class="view-value font-weight-bold text-dark">
                                    {{ artwork.category ? getName('en', artwork.category) : 'N/A' }}
                                </div>
                            </div>
                        </CCol>
                    </CRow>

                    <CRow class="mb-4">
                        <CCol sm="6">
                            <div class="view-group">
                                <label class="view-label">Technique</label>
                                <div class="view-value text-muted">
                                    {{ artwork.technique ? getName('en', artwork.technique) : 'N/A' }}
                                </div>
                            </div>
                        </CCol>
                        <CCol sm="6">
                            <div class="view-group">
                                <label class="view-label">Size</label>
                                <div class="view-value text-muted">
                                    {{ artwork.size ? getName('en', artwork.size) : 'N/A' }}
                                </div>
                            </div>
                        </CCol>
                    </CRow>

                    <div class="view-group mb-4">
                        <label class="view-label">Price / Value</label>
                        <div class="view-value-price font-weight-bold h4 mb-0 text-primary">
                            ฿ {{ formatPrice(artwork.price) }}
                        </div>
                    </div>

                    <div class="view-group">
                        <label class="view-label">Description</label>
                        <p class="view-description text-muted">
                            {{ artwork.description && artwork.description.length > 0 ? getName('en', artwork.description) : 'No additional description provided for this artwork.' }}
                        </p>
                    </div>
                </CCol>
            </CRow>
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
                <CButton 
                    color="primary" 
                    class="btn-edit-shortcut ml-3"
                    @click="$emit('edit', artwork)"
                >
                    <CIcon name="cil-pencil" class="mr-2" /> Edit Artwork
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
            
            // Approval Status Logic - Directly passing populated status object
            const appLabel = item.status.approval ? this.getName('en', item.status.approval) : 'Pending';
            let approval = { ...defaultStatus, label: appLabel };
            
            switch (appLabel) {
                case 'Approved': approval = { label: 'Approved', class: 'status-completed', icon: 'cil-check-circle' }; break;
                case 'Rejected': approval = { label: 'Rejected', class: 'status-cancelled', icon: 'cil-ban' }; break;
                case 'Revised': approval = { label: 'Needs Revision', class: 'status-update', icon: 'cil-reload' }; break;
                default: approval = { label: appLabel, class: 'status-pending', icon: 'cil-clock' };
            }

            // Sale Status Logic - Directly passing populated status object
            const saleLabel = item.status.sale ? this.getName('en', item.status.sale) : 'Not for Sale';
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
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.modal-header-custom {
    padding: 0.5rem 0.5rem;
}

.icon-square {
    width: 48px;
    height: 48px;
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

.close-btn:hover {
    color: #64748b;
}

.artwork-image-view {
    height: 300px;
    background-color: #f8fafc;
}

.object-fit-contain {
    object-fit: contain;
}

.view-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
}

.view-value-title {
    color: #1e293b;
    font-size: 1.5rem;
}

.view-value {
    font-size: 1rem;
}

.view-value-price {
    color: #3b82f6;
}

.view-description {
    line-height: 1.6;
    font-size: 0.95rem;
}

.artist-avatar-sm {
    width: 32px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #475569;
}

.status-badge-lg {
    display: inline-flex;
    align-items: center;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    padding: 0.5rem 1.75rem !important;
    border-width: 1px;
    border-style: solid;
    transition: all 0.2s;
}

.status-label-text {
    font-weight: 800;
    text-transform: uppercase;
    color: #64748b;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
}

.status-icon-lg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.status-container {
    padding: 4px;
}

.status-completed {
    background-color: #f0fff4;
    color: #38a169;
    border-color: rgba(56, 161, 105, 0.4);
}

.status-pending {
    background-color: #fffaf0;
    color: #d69e2e;
    border-color: rgba(214, 158, 46, 0.4);
}

.status-cancelled {
    background-color: #fff5f5;
    color: #e53e3e;
    border-color: rgba(229, 62, 62, 0.4);
}

.status-update {
    background-color: #ebf8ff;
    color: #3182ce;
    border-color: rgba(49, 130, 206, 0.4);
}

.btn-close-view {
    border-radius: 30px;
    font-weight: 600;
    border: 1px solid #e2e8f0;
}

.btn-edit-shortcut {
    border-radius: 30px;
    padding: 0.6rem 2rem;
    font-weight: 600;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
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
    padding: 1.25rem 2.5rem;
}

.rounded-xl {
    border-radius: 16px;
}
</style>
