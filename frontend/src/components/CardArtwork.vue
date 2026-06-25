<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol :class="[cols === 3 ? 'col-custom-grid-3' : 'col-custom-grid', 'mb-5']" v-for="(art, index) in artworks" :key="index">
                <div class="artwork-card cursor-pointer" @click="getDetail(art)">
                    <!-- Image Wrapper -->
                    <div class="card-img-wrapper">
                        <!-- Badges -->
                        <div class="card-badges">
                            <div class="badge-category">
                                {{ art.category ? getName(currentLocale, art.category) : (currentLocale === 'en' ? 'Artwork' : 'ผลงาน') }}
                            </div>
                            <!-- Status Badge (Top-Right) - Only in Private Mode or if not Success -->
                            <div v-if="!isPublic && art.status && getStatusLabel(art)" 
                                class="status-badge-mini px-3 py-1 rounded-pill shadow-sm"
                                :class="getStatusClass(art)">
                                <span class="small font-weight-bold text-uppercase">{{ getStatusLabel(art) }}</span>
                            </div>
                            <div v-else-if="isPublic && isApprovalReserved(art)" class="badge-reserved">
                                <CIcon name="cil-lock-locked" size="sm" class="mr-1"/> 
                                {{ currentLocale === 'en' ? 'Reserved' : 'จองแล้ว' }}
                            </div>
                        </div>
                        
                        <div class="card-img-bg" :style="{ backgroundImage: 'url(' + String.fromCharCode(34) + (art.image || 'https://via.placeholder.com/800x800?text=No+Image') + String.fromCharCode(34) + ')' }"></div>
                        <div class="card-img-overlay-gradient"></div>

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
                    <div class="card-content">
                        <div class="art-details">
                            <h4 class="art-title text-truncate" :title="getName(currentLocale, art)">{{ getName(currentLocale, art) }}</h4>
                            <p class="art-artist text-truncate">
                                <span>{{ currentLocale === 'en' ? 'By ' : 'โดย ' }}</span> 
                                <strong>{{ art.artist ? getName(currentLocale, art.artist) : (currentLocale === 'en' ? 'Anonymous' : 'ศิลปินนิรนาม') }}</strong>
                            </p>
                            <div class="art-technique text-truncate" v-if="art.technique">
                                {{ getName(currentLocale, art.technique) }}
                            </div>
                        </div>

                        <!-- Footer (Price & Action) -->
                        <div class="card-footer-box">
                            <div class="price-container">
                                <template v-if="!isPurchasable(art)">
                                    <div class="price-label">{{ currentLocale === 'en' ? 'Status' : 'สถานะ' }}</div>
                                    <div class="price-value exhibition-only">
                                        <span v-if="isExhibition(art)">{{ currentLocale === 'en' ? 'Exhibition Only' : 'โชว์เท่านั้น' }}</span>
                                        <span v-else-if="isSoldOut(art)">{{ currentLocale === 'en' ? 'Sold Out' : 'ขายแล้ว' }}</span>
                                        <span v-else>{{ currentLocale === 'en' ? 'Not for Sale' : 'ไม่ขาย' }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="price-label">{{ currentLocale === 'en' ? 'Current Price' : 'ราคาปัจจุบัน' }}</div>
                                    <div class="price-value">
                                        {{ formatPrice(art.price) }} <span class="price-currency">{{ currentLocale === 'en' ? 'THB' : 'บาท' }}</span>
                                    </div>
                                </template>
                            </div>
                            
                            <!-- Add to Cart Button (Only in Public Mode AND if For Sale) -->
                            <div v-if="isPublic && isPurchasable(art)" class="action-btn-wrapper" @click.stop="handleCartAction(art)">
                                <!-- Loading State -->
                                <button 
                                    v-if="loadingItems.includes(art._id)"
                                    class="action-btn-circle-premium d-flex align-items-center justify-content-center in-cart"
                                    disabled
                                >
                                    <CIcon name="cil-reload" class="spinner-animation" />
                                </button>
                                <!-- Normal States -->
                                <button 
                                    v-else
                                    class="action-btn-circle-premium d-flex align-items-center justify-content-center" 
                                    :class="{ 'in-cart': isInCart(art._id), 'reserved': isApprovalReserved(art) }"
                                    :title="isInCart(art._id) ? (currentLocale === 'en' ? 'Remove from Cart' : 'นำออกจากตะกร้า') : (isApprovalReserved(art) ? (currentLocale === 'en' ? 'Reserved' : 'จองแล้ว') : (currentLocale === 'en' ? 'Add to Cart' : 'เพิ่มลงตะกร้า'))"
                                    :disabled="isApprovalReserved(art)"
                                >
                                    <CIcon v-if="isInCart(art._id)" name="cil-check" />
                                    <CIcon v-else-if="isApprovalReserved(art)" name="cil-lock-locked" />
                                    <CIcon v-else name="cil-cart" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </CCol>
        </CRow>
    </div>
    <div v-else class="text-center py-5 no-results-box bg-light rounded-xl mt-4">
        <CIcon name="cil-brush" size="3xl" class="text-muted mb-3 opacity-30" />
        <h4 class="text-muted font-weight-bold">{{ currentLocale === 'en' ? 'No Artworks Found' : 'ไม่พบผลงานที่ต้องการ' }}</h4>
        <p class="text-muted max-w-lg mx-auto">{{ currentLocale === 'en' ? "Sorry, we couldn't find any artworks matching your criteria at this time." : 'ขออภัย เราไม่พบผลงานที่ตรงตามเงื่อนไขที่คุณเลือกในขณะนี้' }}</p>
    </div>
</template>

<script>
export default {
    name: 'CardArtwork',
    props: {
        artworks: {
            type: Array,
            default: () => []
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        cols: {
            type: Number,
            default: 4
        }
    },
    data() {
        return {
            loadingItems: []
        }
    },
    computed: {
        currentLocale() {
            return this.$i18n ? this.$i18n.locale : 'en';
        }
    },
    methods: {
        getDetail(art) {
            const titleEn = this.getName('en', art);
            if (titleEn) {
                const slug = titleEn.replace(/\s+/g, '-').toLowerCase();
                this.$router.push(`/artwork/${slug}`);
            } else {
                this.$router.push(`/artwork/${art._id}`);
            }
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
            if (value === undefined || value === null) return '0';
            return parseFloat(value).toLocaleString('en-US');
        },
        async handleCartAction(art) {
            if (!this.isPurchasable(art)) return;

            if (this.isApprovalReserved(art) && !this.isInCart(art._id)) {
                return;
            }

            try {
                this.loadingItems.push(art._id);
                
                if (!this.isInCart(art._id)) {
                    let latest = art;
                    try {
                        const res = await this.$store.dispatch('artwork/explore', { _id: art._id });
                        if (res) latest = res;
                    } catch (error) {
                        console.warn('artwork/explore not available, using local data:', error);
                    }
                    if (latest && this.isApprovalReserved(latest)) {
                        alert(this.currentLocale === 'en' ? 'Sorry, this artwork was just reserved.' : 'ขออภัย ผลงานนี้เพิ่งถูกจองไป');
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
        isInCart(id) {
            return this.$store.getters['cart/isInCart'](id);
        },
        isApprovalReserved(art) {
            if (!art || !art.status || !art.status.approval) return false;
            return this.getName('en', art.status.approval) === 'Reserved';
        },
        isPurchasable(art) {
            if (!art || !art.status || !art.status.sale) return false;
            const status = this.getName('en', art.status.sale);
            return status === 'Available';
        },
        isExhibition(art) {
            if (!art || !art.status || !art.status.sale) return false;
            const statusEn = this.getName('en', art.status.sale).toLowerCase();
            const statusTh = this.getName('th', art.status.sale).toLowerCase();
            return statusEn.includes('exhibition') || 
                   statusTh.includes('โชว์ผลงาน') || 
                   statusTh.includes('ร่วมแสดงงาน') ||
                   statusEn.includes('show');
        },
        isSoldOut(art) {
            if (!art || !art.status || !art.status.sale) return false;
            const statusEn = this.getName('en', art.status.sale).toLowerCase();
            return statusEn === 'sold out';
        },
        getStatusLabel(art) {
            if (!art.status) return '';
            if (art.status.approval) {
                return this.getName(this.currentLocale, art.status.approval);
            }
            if (typeof art.status === 'string') return art.status;
            if (art.status.artworkStatus) return art.status.artworkStatus;
            return '';
        },
        getStatusClass(art) {
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
/* Modern Premium Artwork Card Design */
.artwork-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.artwork-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(74, 29, 24, 0.06);
    border-color: rgba(74, 29, 24, 0.1);
}

.card-img-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 Aspect Ratio (Square) */
    overflow: hidden;
    background-color: #faf9f6;
    border-bottom: 1px solid rgba(0, 0, 0, 0.02);
}

.card-img-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.artwork-card:hover .card-img-bg {
    transform: scale(1.05);
}

.card-img-overlay-gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 35%;
    background: linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%);
    pointer-events: none;
    opacity: 0.5;
    transition: opacity 0.4s ease;
}

.artwork-card:hover .card-img-overlay-gradient {
    opacity: 0.8;
}

.card-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 10;
    pointer-events: none;
}

.badge-category {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #4b5563;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.badge-reserved {
    background: rgba(74, 29, 24, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #ffffff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 10px rgba(74, 29, 24, 0.15);
}

.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
    background: #ffffff;
    z-index: 5;
}

.art-details {
    margin-bottom: 16px;
}

.art-title {
    font-family: 'Cinzel', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1c1917;
    margin-bottom: 6px;
    line-height: 1.35;
}

.art-artist {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 4px;
}

.art-artist strong {
    color: #374151;
}

.art-technique {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.78rem;
    color: #9ca3af;
}

.card-footer-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 14px;
    border-top: 1px solid #f3f4f6;
}

.price-container {
    display: flex;
    flex-direction: column;
}

.price-label {
    font-family: 'Sarabun', sans-serif;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9ca3af;
    margin-bottom: 2px;
    font-weight: 600;
}

.price-value {
    font-family: 'Sarabun', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #4a1d18;
    line-height: 1;
}

.price-value.exhibition-only {
    font-size: 1.05rem;
    color: #6b7280;
    font-weight: 600;
}

.price-currency {
    font-size: 0.8rem;
    color: #4a1d18;
    font-weight: 600;
    margin-left: 2px;
}

.action-btn-wrapper {
    z-index: 10;
}

/* Premium Circle Cart Button */
.action-btn-circle-premium {
    width: 40px;
    height: 40px;
    background: #ffffff;
    border-radius: 50%;
    color: #4a1d18;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    outline: none;
    cursor: pointer;
}

.action-btn-circle-premium:hover {
    background: linear-gradient(135deg, #4a1d18, #612721);
    border-color: #4a1d18;
    color: #ffffff;
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(74, 29, 24, 0.25);
}

.action-btn-circle-premium.in-cart {
    background: linear-gradient(135deg, #4a1d18, #612721);
    border-color: #4a1d18;
    color: #ffffff;
    box-shadow: 0 4px 10px rgba(74, 29, 24, 0.15);
}

.action-btn-circle-premium.in-cart:hover {
    background: #dc2626; /* Turn red for removal alert */
    border-color: #dc2626;
    box-shadow: 0 6px 15px rgba(220, 38, 38, 0.25);
}

.action-btn-circle-premium.reserved {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    box-shadow: none;
    cursor: not-allowed;
}

.action-btn-circle-premium.reserved:hover {
    transform: none;
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    box-shadow: none;
}

/* Private Mode Action Buttons */
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

.edit-btn { background-color: #4a1d18; }
.edit-btn:hover { background-color: #612721; transform: scale(1.05); }
.delete-btn { background-color: #ef4444; }
.delete-btn:hover { background-color: #dc2626; transform: scale(1.05); }

/* Status Badges */
.status-badge-mini {
    background: #ffffff;
    color: #1e293b;
    font-size: 0.65rem;
    border: 1px solid #e2e8f0;
    pointer-events: none;
}

.badge-pending { border-color: #f59e0b; color: #d97706; }
.badge-approved { border-color: #10b981; color: #059669; }
.badge-rejected { border-color: #ef4444; color: #b91c1c; }

/* Status Overlays */
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

/* Grid Layout definitions */
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

.col-custom-grid-3 {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 12px;
}

@media (min-width: 576px) {
    .col-custom-grid-3 { flex: 0 0 50%; max-width: 50%; }
}

@media (min-width: 992px) {
    .col-custom-grid-3 { flex: 0 0 33.333333%; max-width: 33.333333%; }
}

.no-results-box {
    border: 2px dashed #e5e7eb;
    border-radius: 24px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner-animation {
  animation: spin 1s linear infinite;
}
</style>
