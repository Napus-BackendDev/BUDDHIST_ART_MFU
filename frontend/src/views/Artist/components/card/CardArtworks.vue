<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol class="col-custom-grid mb-5" v-for="(art, index) in artworks" :key="index">
                <CCard class="h-100 border-0 artwork-card cursor-pointer" @click="getDetail(art._id)">
                    <!-- Image Wrapper -->
                    <div class="card-img-wrapper position-relative">
                        <!-- Category Badge (Top-Left) -->
                        <div class="position-absolute glass-pill-badge px-3 py-1 m-3 rounded-pill" style="top: 0; left: 0; z-index: 2;">
                            <span class="small font-weight-bold">{{ art.category ? getName(currentLocale, art.category) : 'Artwork' }}</span>
                        </div>

                        <!-- Status Badge (Top-Right) - Only in Private Mode or if not Success -->
                        <div v-if="!isPublic && art.status && getStatusLabel(art)" 
                            class="position-absolute px-3 py-1 m-3 rounded-pill status-badge-mini shadow-sm"
                            :class="getStatusClass(art)"
                            style="top: 0; right: 0; z-index: 2;">
                            <span class="small font-weight-bold text-uppercase">{{ getStatusLabel(art) }}</span>
                        </div>

                        <!-- Full Cover Image Background -->
                        <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: `url(${art.image || 'https://via.placeholder.com/800x800?text=No+Image'})` }">
                        </div>
                        <div class="card-img-overlay-soft"></div>
                        
                        <!-- Status Overlays (Private Only) -->
                        <div v-if="!isPublic && isPending(art)" class="status-overlay pending-overlay">
                            <div class="status-content">
                                <CIcon name="cil-clock" class="mb-2" size="xl" />
                                <span class="font-weight-bold">Pending Review</span>
                            </div>
                        </div>

                        <div v-if="!isPublic && isRejected(art)" class="status-overlay rejected-overlay">
                            <div class="status-content">
                                <CIcon name="cil-warning" class="mb-2" size="xl" />
                                <span class="font-weight-bold">แก้ไข</span>
                            </div>
                        </div>

                        <!-- Action Buttons (Edit/Delete) for Artist (Private Only) -->
                        <div v-if="!isPublic" class="action-buttons-group">
                            <div class="action-btn edit-btn shadow-sm" title="Edit Artwork" @click.stop="handleEdit(art)">
                                <CIcon name="cil-pencil" />
                            </div>
                            <div class="action-btn delete-btn shadow-sm" title="Delete Artwork" @click.stop="handleDelete(art)">
                                <CIcon name="cil-trash" />
                            </div>
                        </div>
                    </div>

                    <!-- Content Body -->
                    <CCardBody class="p-4 bg-white">
                        <!-- Title, Artist and Technique -->
                        <div class="mb-3">
                            <h4 class="font-weight-bold art-title mb-1 text-truncate">{{ getName(currentLocale, art) }}</h4>
                            <div class="art-technique text-muted mb-1" v-if="art.technique">
                                <small class="d-flex align-items-center">
                                    {{ getName(currentLocale, art.technique) }}
                                </small>
                            </div>
                            <p class="text-muted small art-artist mb-0">by {{ art.artist ? getName(currentLocale, art.artist) : 'Unknown Artist' }}</p>
                        </div>

                        <hr class="my-3 opacity-50">

                        <!-- Price and Public Action -->
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="price-box">
                                <small class="text-muted d-block" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px;">Price</small>
                                <template v-if="isForSale(art)">
                                    <span class="price-value font-weight-bold text-danger">{{ formatPrice(art.price) }}</span>
                                    <small class="price-unit ml-1 font-weight-bold text-danger">฿</small>
                                </template>
                                <template v-else>
                                    <span class="price-value font-weight-bold text-danger" style="font-size: 1.1rem;">{{ currentLocale === 'en' ? 'Not for Sale' : 'ไม่ขาย' }}</span>
                                </template>
                            </div>
                            
                            <!-- Add to Cart Button (Only in Public Mode AND if For Sale) -->
                            <div v-if="isPublic && isForSale(art)" class="action-btn-container" @click.stop="handleCartAction(art)">
                                <!-- Loading State -->
                                <div v-if="loadingItems.includes(art._id)" class="in-cart-label" style="opacity: 0.7;">
                                    <CIcon name="cil-reload" class="mr-1 spinner-animation" />
                                    <span>{{ currentLocale === 'en' ? 'Syncing...' : 'กำลังตรวจสอบ...' }}</span>
                                </div>
                                <!-- Normal States -->
                                <div v-else-if="isInCart(art._id)" class="in-cart-label">
                                    <CIcon name="cil-check-circle" class="mr-1" />
                                    <span>In Cart</span>
                                </div>
                                <div v-else-if="isApprovalReserved(art)" class="in-cart-label" style="color: #ff9800; border-color: #ff9800; background-color: #fff3e0; cursor: not-allowed;">
                                    <CIcon name="cil-cart" class="mr-1" />
                                    <span>{{ currentLocale === 'en' ? 'Reserved' : 'จองแล้ว' }}</span>
                                </div>
                                <div v-else class="action-btn-circle">
                                    <CIcon name="cil-cart" />
                                </div>
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
        },
        isPublic: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isAdmin: false,
            loadingItems: []
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
            return parseFloat(value).toLocaleString('en-US');
        },
        async handleCartAction(art) {
            // Prevent if not for sale
            if (!this.isForSale(art)) return;

            // Prevent adding to cart if it's already in someone else's cart (Reserved)
            if (this.isApprovalReserved(art) && !this.isInCart(art._id)) {
                return;
            }

            try {
                this.loadingItems.push(art._id);
                
                // Final sync check before adding
                if (!this.isInCart(art._id)) {
                    const latest = await this.$store.dispatch('artwork/explore', { _id: art._id });
                    if (latest && this.isApprovalReserved(latest)) {
                        alert(this.$i18n.locale === 'en' ? 'Sorry, this artwork was just reserved.' : 'ขออภัย ผลงานนี้เพิ่งถูกจองไป');
                        return;
                    }
                    this.$store.dispatch('cart/addToCart', latest || art);
                    this.$store.dispatch('cart/setShowCart', true);
                } else {
                    this.$store.dispatch('cart/removeFromCart', art._id);
                }
            } catch (error) {
                console.error('Cart action failed:', error);
            } finally {
                this.loadingItems = this.loadingItems.filter(id => id !== art._id);
            }
        },
        isAvailable(art) {
            if (!art || !art.status || !art.status.sale) return true;
            return this.getName('en', art.status.sale) !== 'Sold Out';
        },
        isInCart(id) {
            return this.$store.getters['cart/isInCart'](id);
        },
        isApprovalReserved(art) {
            if (!art || !art.status || !art.status.approval) return false;
            return this.getName('en', art.status.approval) === 'Reserved';
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
        },
        isForSale(art) {
            if (!art || !art.status || !art.status.sale) return true;
            const statusEn = this.getName('en', art.status.sale);
            return statusEn === 'Available' || statusEn === 'Select Status' || statusEn === 'N/A' || statusEn === '';
        }
    }
}
</script>

<style scoped>
.artwork-card {
    border-radius: 24px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
    border: none !important;
}

.artwork-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
}

.card-img-wrapper {
    height: 320px;
    overflow: hidden;
    position: relative;
    margin-top: -1px;
}

.card-img-bg {
    background-size: cover;
    background-position: center;
    transition: transform 0.8s ease;
}

.artwork-card:hover .card-img-bg {
    transform: scale(1.1);
}

.card-img-overlay-soft {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
}

.glass-pill-badge {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #612721;
    font-size: 0.7rem;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.status-badge-mini {
    background: #ffffff;
    color: #1e293b;
    font-size: 0.65rem;
    border: 1px solid #e2e8f0;
}

.badge-pending { border-color: #f59e0b; color: #d97706; }
.badge-approved { border-color: #10b981; color: #059669; }
.badge-rejected { border-color: #ef4444; color: #b91c1c; }

.art-title {
    color: #1a202c;
    font-size: 1.15rem;
    line-height: 1.3;
}

.art-artist {
    font-size: 0.85rem;
    letter-spacing: 0.2px;
}

.price-value {
    font-size: 1.4rem;
    line-height: 1;
}

.price-unit {
    font-size: 0.9rem;
}

.action-btn-container {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.in-cart-label {
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
    color: #28a745;
    padding: 6px 12px;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid #28a745;
    transition: all 0.3s ease;
}

.action-btn-circle {
    width: 42px;
    height: 42px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a202c;
    transition: all 0.3s ease;
    border: 1px solid #eee;
}

.action-btn-circle:hover {
    background: #8c1515;
    color: #fff;
    transform: scale(1.1);
}

.action-buttons-group {
    position: absolute;
    right: 15px;
    bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
    z-index: 5;
}

.artwork-card:hover .action-buttons-group {
    opacity: 1;
    transform: translateX(0);
}

.action-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.edit-btn { background-color: #8c1515; }
.delete-btn { background-color: #ef4444; }

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
    background: rgba(0, 0, 0, 0.4);
}

.status-content {
    color: white;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    backdrop-filter: blur(4px);
    padding: 1rem;
    border-radius: 15px;
    background: rgba(0, 0, 0, 0.3);
}

.no-results-box {
    border: 2px dashed #e2e8f0;
    border-radius: 24px;
}

.col-custom-grid {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 12px;
}

@media (min-width: 576px) {
    .col-custom-grid { flex: 0 0 50%; max-width: 50%; }
}

@media (min-width: 768px) {
    .col-custom-grid { flex: 0 0 33.333333%; max-width: 33.333333%; }
}

@media (min-width: 992px) {
    .col-custom-grid { flex: 0 0 25%; max-width: 25%; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>