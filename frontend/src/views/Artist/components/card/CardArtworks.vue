<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol class="col-custom-grid mb-5" v-for="(art, index) in artworks" :key="index">
                <CCard 
                    :class="['h-100 border-0 shadow-sm artwork-card cursor-pointer', { 'is-pending': isPending(art), 'is-rejected': isRejected(art) }]"
                    style="border-radius: 20px; overflow: hidden;" @click="getDetail(art._id)">
                    <div class="card-img-wrapper position-relative">
                        <!-- Badge Container (Top-Left Stack) -->
                        <div class="position-absolute d-flex flex-column align-items-start m-4" style="top: 0; left: 0; z-index: 1; gap: 8px;">
                            <!-- Category Badge -->
                            <div class="px-3 py-1 rounded-pill text-uppercase font-weight-bold cat-badge"
                                style="font-size: 0.72rem; letter-spacing: 0.8px; color: white; border: 2px solid white;">
                                {{ art.category ? getName(currentLocale, art.category) : 'Artwork' }}
                            </div>
                            
                            <!-- Status Badge -->
                            <div v-if="art.status && getStatusLabel(art)" 
                                class="px-3 py-1 rounded-pill text-uppercase font-weight-bold status-badge shadow-lg"
                                :class="getStatusClass(art)"
                                style="font-size: 0.72rem; letter-spacing: 0.8px; color: white; border: 2px solid white;">
                                {{ getStatusLabel(art) }}
                            </div>
                        </div>

                        <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: `url(${art.image || 'https://via.placeholder.com/800x800?text=No+Image'})` }">
                        </div>
                        
                        <!-- Status Overlays -->
                        <div v-if="isPending(art)" class="status-overlay pending-overlay">
                            <div class="status-content">
                                <CIcon name="cil-clock" class="mb-2" size="xl" />
                                <span class="font-weight-bold">Pending Review</span>
                            </div>
                        </div>

                        <div v-if="isRejected(art)" class="status-overlay rejected-overlay">
                            <div class="status-content">
                                <CIcon name="cil-warning" class="mb-2" size="xl" />
                                <span class="font-weight-bold">แก้ไข</span>
                            </div>
                        </div>
                    </div>
                    <CCardBody class="p-4 bg-white position-relative card-body-custom">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="font-weight-bold art-title mb-0">{{ getName(currentLocale, art) }}</h5>
                        </div>
                        <p class="text-muted art-subtitle mb-3">by {{ art.artist ? getName(currentLocale, art.artist) : 'Unknown Artist' }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <h4 class="font-weight-bold price-text mb-0">฿ {{ formatPrice(art.price) }}</h4>
                            <div v-if="art.status && art.status.sale" class="sale-status-dot" :title="getName(currentLocale, art.status.sale)">
                                <span :class="['dot', art.status.sale.title === 'Sold Out' ? 'dot-sold' : 'dot-available']"></span>
                                <span class="small text-muted ml-1">{{ getName(currentLocale, art.status.sale) }}</span>
                            </div>
                        </div>

                        <!-- Action Buttons (Edit/Delete) for Artist -->
                        <div class="action-buttons-group">
                            <div class="action-btn edit-btn shadow-sm" title="Edit Artwork" @click.stop="handleEdit(art)">
                                <CIcon name="cil-pencil" />
                            </div>
                            <div class="action-btn delete-btn shadow-sm" title="Delete Artwork" @click.stop="handleDelete(art)">
                                <CIcon name="cil-trash" />
                            </div>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
    <div v-else class="text-center py-5 no-results-box bg-light rounded-xl mt-4">
        <CIcon name="cil-brush" size="3xl" class="text-muted mb-3 opacity-30" />
        <h4 class="text-muted font-weight-bold">No Artworks Found</h4>
        <p class="text-muted max-w-lg mx-auto">We couldn't find any artworks matching your current criteria. Try resetting your search or adjusting the filters.</p>
    </div>
</template>

<script>
export default {
    name: 'CardArtworks',
    props: {
        artworks: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        currentLocale() {
            return this.$i18n ? this.$i18n.locale : 'en';
        }
    },
    methods: {
        getDetail(id) {
            this.$router.push(`/artwork/${id}`);
        },
        handleEdit(art) {
            this.$emit('edit', art);
        },
        handleDelete(art) {
            this.$emit('delete', art);
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                return nameObj ? nameObj.value : (titleField[0] ? titleField[0].value : '');
            }
            return '';
        },
        formatPrice(value) {
            if (value === undefined || value === null) return '0.00';
            return parseFloat(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        isAvailable(art) {
            if (!art || !art.status || !art.status.sale) return true;
            return this.getName('en', art.status.sale) !== 'Sold Out';
        },
        isInCart(id) {
            return this.$store.getters['cart/isInCart'](id);
        },
        getStatusLabel(art) {
            if (!art.status) return '';
            
            // Priority 1: Randomized status.approval object (localized)
            if (art.status.approval) {
                return this.getName(this.currentLocale, art.status.approval);
            }
            
            // Priority 2: Simple top-level status string
            if (typeof art.status === 'string') return art.status;
            if (art.status.artworkStatus) return art.status.artworkStatus;
            
            return '';
        },
        getStatusClass(art) {
            // Use fallback to English for class mapping logic if needed
            // By getting the label in 'en' specifically for logic
            const statusEn = art.status && art.status.approval 
                ? this.getName('en', art.status.approval).toLowerCase() 
                : (typeof art.status === 'string' ? art.status.toLowerCase() : '');

            if (statusEn.includes('pending')) return 'badge-pending';
            if (statusEn.includes('approve') || statusEn.includes('accept')) return 'badge-approved';
            if (statusEn.includes('reject')) return 'badge-rejected';
            if (statusEn.includes('draft')) return 'badge-draft';
            return 'badge-info';
        },
        isPending(art) {
            const statusEn = art.status && art.status.approval 
                ? this.getName('en', art.status.approval).toLowerCase() 
                : (typeof art.status === 'string' ? art.status.toLowerCase() : '');
            return statusEn.includes('pending');
        },
        isRejected(art) {
            const statusEn = art.status && art.status.approval 
                ? this.getName('en', art.status.approval).toLowerCase() 
                : (typeof art.status === 'string' ? art.status.toLowerCase() : '');
            return statusEn.includes('reject');
        }
    }
}
</script>

<style scoped>
.artwork-card {
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    transform-origin: center;
}

.artwork-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.15) !important;
}

.card-img-wrapper {
    height: 420px;
}

@media (min-width: 992px) {
    .card-img-wrapper {
        height: 380px;
    }
}

.col-custom-grid {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 10px;
}

@media (min-width: 576px) {
    .col-custom-grid {
        flex: 0 0 50%;
        max-width: 50%;
    }
}

@media (min-width: 768px) {
    .col-custom-grid {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
    }
}

@media (min-width: 992px) {
    .col-custom-grid {
        flex: 0 0 25%;
        max-width: 25%;
    }
}

.card-img-bg {
    background-size: cover;
    background-position: center;
    transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.artwork-card:hover .card-img-bg {
    transform: scale(1.05);
}

.art-title {
    color: #1e293b;
    font-size: 1.15rem;
}

.art-subtitle {
    font-size: 0.9rem;
}

.price-text {
    color: #8c1515;
    letter-spacing: -0.5px;
}

.cat-badge {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.action-buttons-group {
    position: absolute;
    right: 20px;
    bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 2;
}

.artwork-card:hover .action-buttons-group {
    opacity: 1;
    transform: translateY(0);
}

.action-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.edit-btn {
    background-color: #8c1515; /* Red */
}

.edit-btn:hover {
    background-color: #701111;
    transform: scale(1.1);
}

.delete-btn {
    background-color: #ef4444; /* Red */
}

.delete-btn:hover {
    background-color: #dc2626;
    transform: scale(1.1);
}

.sale-status-dot {
    display: flex;
    align-items: center;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.dot-available {
    background-color: #10b981;
}

.dot-sold {
    background-color: #ef4444;
}

.no-results-box {
    border: 2px dashed #e2e8f0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.rounded-xl {
    border-radius: 24px;
}

.max-w-lg {
    max-width: 32rem;
}

/* Ultra-Pop Status Badge Themes */
.cat-badge {
    background: linear-gradient(135deg, #8c1515 0%, #b91c1c 100%) !important;
    box-shadow: 0 12px 24px -6px rgba(140, 21, 21, 0.5) !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.status-badge {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.artwork-card:hover .cat-badge,
.artwork-card:hover .status-badge {
    transform: translateY(-5px) scale(1.1);
    box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.3) !important;
}

.badge-pending {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
    box-shadow: 0 12px 24px -6px rgba(245, 158, 11, 0.5) !important;
}

.badge-approved {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    box-shadow: 0 12px 24px -6px rgba(16, 185, 129, 0.5) !important;
}

.badge-rejected {
    background: linear-gradient(135deg, #8c1515 0%, #b91c1c 100%) !important;
    box-shadow: 0 12px 24px -6px rgba(140, 21, 21, 0.5) !important;
}

.badge-draft {
    background: linear-gradient(135deg, #64748b 0%, #475569 100%) !important;
    box-shadow: 0 12px 24px -6px rgba(100, 116, 139, 0.5) !important;
}

.badge-info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
    box-shadow: 0 12px 24px -6px rgba(59, 130, 246, 0.5) !important;
}

/* Status Transition Overlays (Pending & Rejected) */
.artwork-card.is-pending .card-img-bg,
.artwork-card.is-rejected .card-img-bg {
    filter: grayscale(100%) brightness(0.5);
}

.status-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.3s ease;
}

.pending-overlay {
    background: rgba(0, 0, 0, 0.4);
}

.rejected-overlay {
    background: rgba(140, 21, 21, 0.6); /* MFU Red tint */
}

.status-content {
    color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    backdrop-filter: blur(4px);
    padding: 1.5rem;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.2);
}

.artwork-card:hover .status-overlay {
    background: rgba(0, 0, 0, 0.2);
}

.artwork-card.is-pending .art-title,
.artwork-card.is-pending .price-text,
.artwork-card.is-rejected .art-title,
.artwork-card.is-rejected .price-text {
    opacity: 0.7;
}
</style>