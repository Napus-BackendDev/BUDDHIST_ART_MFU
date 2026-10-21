<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol :class="[cols === 3 ? 'col-custom-grid-3' : 'col-custom-grid', 'mb-5']" v-for="(art, index) in artworks" :key="index">
                <div class="artwork-card cursor-pointer" @click="getDetail(art)">
                    <!-- Image Wrapper -->
                    <div class="card-img-wrapper">
                        <!-- Badges (Only in Public Mode if Reserved) -->
                        <div class="card-badges" v-if="isPublic && isApprovalReserved(art)">
                            <div class="badge-reserved ml-auto">
                                <CIcon name="cil-lock-locked" size="sm" class="mr-1"/> 
                                {{ currentLocale === 'en' ? 'Reserved' : 'จองแล้ว' }}
                            </div>
                        </div>
                        
                        <div class="card-img-bg" :style="{ backgroundImage: 'url(' + String.fromCharCode(34) + (artworkImageUrl(art) || 'https://via.placeholder.com/800x800?text=No+Image') + String.fromCharCode(34) + ')' }"></div>

                        <!-- Status Overlays (Private Only) -->
                        <div v-if="!isPublic && isPending(art)" class="status-overlay pending-overlay">
                            <div class="status-content">
                                <CIcon name="cil-clock" class="mb-2" size="xl" />
                                <span class="font-weight-bold">{{ currentLocale === 'en' ? 'Pending Review' : 'รอตรวจสอบ' }}</span>
                            </div>
                        </div>

                        <div v-if="!isPublic && isRejected(art)" class="status-overlay rejected-overlay">
                            <div class="status-content">
                                <CIcon name="cil-warning" class="mb-2" size="xl" />
                                <span class="font-weight-bold">{{ currentLocale === 'en' ? 'Revision Required' : 'แก้ไข' }}</span>
                            </div>
                        </div>

                        <!-- Action Buttons (Edit/Delete) for Artist (Private Only) -->
                        <div v-if="!isPublic" class="action-buttons-group">
                            <button type="button" class="action-btn edit-btn shadow-sm" :aria-label="(currentLocale === 'en' ? 'Edit artwork: ' : 'แก้ไขผลงาน: ') + getName(currentLocale, art)" :title="currentLocale === 'en' ? 'Edit Artwork' : 'แก้ไขผลงาน'" @click.stop="handleEdit(art)">
                                <CIcon name="cil-pencil" />
                            </button>
                            <button type="button" class="action-btn delete-btn shadow-sm" :aria-label="(currentLocale === 'en' ? 'Delete artwork: ' : 'ลบผลงาน: ') + getName(currentLocale, art)" :title="currentLocale === 'en' ? 'Delete Artwork' : 'ลบผลงาน'" @click.stop="handleDelete(art)">
                                <CIcon name="cil-trash" />
                            </button>
                        </div>
                    </div>

                    <!-- Content Body -->
                    <div class="card-content">
                        <div class="art-details">
                            <h4 class="art-title text-truncate" :title="getName(currentLocale, art)">
                                <router-link class="artwork-detail-link" :to="`/artwork/${art._id}`" @click.native.stop>{{ getName(currentLocale, art) }}</router-link>
                            </h4>
                            <p class="art-artist text-truncate mb-2">
                                <span>{{ currentLocale === 'en' ? 'By ' : 'โดย ' }}</span> 
                                <strong>{{ art.artist ? getName(currentLocale, art.artist) : (currentLocale === 'en' ? 'Anonymous' : 'ศิลปินนิรนาม') }}</strong>
                            </p>
                            <!-- Category Badge under Artwork Title/Artist -->
                            <div class="art-meta-tags d-flex align-items-center flex-wrap gap-2">
                                <span class="badge-category-tag" v-if="art.category">
                                    {{ getName(currentLocale, art.category) }}
                                </span>
                                <span class="art-technique text-truncate" v-if="art.technique">
                                    {{ getName(currentLocale, art.technique) }}
                                </span>
                            </div>

                            <!-- Approval Status Badge for Artist (under Category) -->
                            <div v-if="!isPublic && art.status && getStatusLabel(art)" class="art-status-row mt-2">
                                <span class="status-badge-inline" :class="getStatusClass(art)">
                                    <span class="dot"></span>
                                    {{ getStatusLabel(art) }}
                                </span>
                            </div>
                        </div>

                        <!-- Footer (Price & Action) -->
                        <div class="card-footer-box">
                            <div class="price-container">
                                <template v-if="!isPurchasable(art)">
                                    <div class="price-label">{{ currentLocale === 'en' ? 'Status' : 'สถานะ' }}</div>
                                    <div class="price-value exhibition-only">
                                        <span v-if="isExhibition(art)">{{ currentLocale === 'en' ? 'Exhibition Only' : 'จัดโชว์เพียงเท่านั้น' }}</span>
                                        <span v-else-if="isSoldOut(art)">{{ currentLocale === 'en' ? 'Sold Out' : 'จำหน่ายแล้ว' }}</span>
                                        <span v-else>{{ currentLocale === 'en' ? 'Not for Sale' : 'ไม่ขาย' }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="price-label">{{ currentLocale === 'en' ? 'Current Price' : 'ราคา' }}</div>
                                    <div class="price-value">
                                        {{ formatPrice(art.price) }} <span class="price-currency">{{ currentLocale === 'en' ? 'THB' : 'บาท' }}</span>
                                    </div>
                                </template>
                            </div>
                            
                            <!-- Right side: View count + Cart Action Button -->
                            <div class="card-actions-wrapper d-flex align-items-center">
                                <!-- View Count Display near Cart Button -->
                                <div class="artwork-view-count mr-2" :title="currentLocale === 'en' ? `${formatViews(art.views)} views` : `ผู้เข้าชม ${formatViews(art.views)} ครั้ง`">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="view-icon mr-1" fill="currentColor">
                                        <path d="M256 96c-106.6 0-199.3 64.9-239.3 160 40 95.1 132.7 160 239.3 160s199.3-64.9 239.3-160c-40-95.1-132.7-160-239.3-160zm0 272a112 112 0 1 1 112-112 112.1 112.1 0 0 1-112 112zm0-184a72 72 0 1 0 72 72 72.1 72.1 0 0 0-72-72z"/>
                                    </svg>
                                    <span class="view-number">{{ formatViews(art.views) }}</span>
                                </div>

                                <!-- Add to Cart Button (Only in Public Mode AND if For Sale) -->
                                <div v-if="isPublic && isPurchasable(art)" class="action-btn-wrapper" @click.stop="handleCartAction(art)">
                                    <!-- Loading State -->
                                    <button 
                                        v-if="loadingItems.includes(art._id)"
                                        class="action-btn-circle-premium d-flex align-items-center justify-content-center in-cart"
                                        disabled
                                        :aria-label="currentLocale === 'en' ? 'Adding artwork to cart' : 'กำลังเพิ่มผลงานลงตะกร้า'"
                                    >
                                        <CIcon name="cil-reload" class="spinner-animation" aria-hidden="true" />
                                    </button>
                                    <!-- Normal States -->
                                    <button 
                                        v-else
                                        class="action-btn-circle-premium d-flex align-items-center justify-content-center" 
                                        :class="{ 'in-cart': isInCart(art._id), 'reserved': isApprovalReserved(art) }"
                                        :title="isInCart(art._id) ? (currentLocale === 'en' ? 'Remove from Cart' : 'นำออกจากตะกร้า') : (isApprovalReserved(art) ? (currentLocale === 'en' ? 'Reserved' : 'จองแล้ว') : (currentLocale === 'en' ? 'Add to Cart' : 'เพิ่มลงตะกร้า'))"
                                        :aria-label="isInCart(art._id) ? (currentLocale === 'en' ? 'Remove artwork from cart' : 'นำผลงานออกจากตะกร้า') : (isApprovalReserved(art) ? (currentLocale === 'en' ? 'Artwork reserved' : 'ผลงานถูกจองแล้ว') : (currentLocale === 'en' ? 'Add artwork to cart' : 'เพิ่มผลงานลงตะกร้า'))"
                                        :disabled="isApprovalReserved(art)"
                                    >
                                        <CIcon v-if="isInCart(art._id)" name="cil-check" aria-hidden="true" />
                                        <CIcon v-else-if="isApprovalReserved(art)" name="cil-lock-locked" aria-hidden="true" />
                                        <CIcon v-else name="cil-cart" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CCol>
        </CRow>

        <!-- Clean & Prominent Added to Cart Success Modal -->
        <CModal
            :show.sync="showAddedModal"
            centered
            class="cart-alert-modal"
            :closeOnBackdrop="true"
        >
            <div class="cart-alert-card p-4 p-md-5 text-center position-relative">
                <!-- Top Right Close Button -->
                <button type="button" class="alert-close-btn position-absolute" @click="showAddedModal = false" title="ปิด">
                    <CIcon name="cil-x" size="lg" />
                </button>

                <!-- Big Success Icon -->
                <div class="alert-icon-wrapper mx-auto mb-4">
                    <div class="alert-icon-pulse"></div>
                    <div class="alert-icon-circle">
                        <CIcon name="cil-check" size="2xl" class="text-white" />
                    </div>
                </div>

                <!-- Title & Message -->
                <h3 class="alert-modal-title font-weight-bold mb-2">
                    {{ currentLocale === 'en' ? 'Added to Cart Successfully!' : 'เพิ่มลงในตะกร้าเรียบร้อยแล้ว' }}
                </h3>
                <p class="alert-modal-subtitle text-muted mb-4">
                    {{ currentLocale === 'en' ? 'Artwork has been added to your shopping cart.' : 'ผลงานศิลปะชิ้นนี้ได้ถูกเพิ่มลงในตะกร้าของคุณเรียบร้อยแล้ว' }}
                </p>

                <!-- Bottom Dismiss Button -->
                <button type="button" class="btn-alert-dismiss px-5 py-2" @click="showAddedModal = false">
                    {{ currentLocale === 'en' ? 'Close' : 'ตกลง' }}
                </button>
            </div>
        </CModal>
    </div>
    <div v-else class="text-center py-5 no-results-box bg-light rounded-xl mt-4">
        <CIcon name="cil-brush" size="3xl" class="text-muted mb-3 opacity-30" />
        <h4 class="text-muted font-weight-bold">{{ currentLocale === 'en' ? 'No Artworks Found' : 'ไม่พบผลงานที่ต้องการ' }}</h4>
        <p class="text-muted max-w-lg mx-auto">{{ currentLocale === 'en' ? "Sorry, we couldn't find any artworks matching your criteria at this time." : 'ขออภัย เราไม่พบผลงานที่ตรงตามเงื่อนไขที่คุณเลือกในขณะนี้' }}</p>
    </div>
</template>

<script>
import { isArtworkPurchasable } from '@/utils/artworkPurchase';
import { artworkImageUrl } from '@/utils/submissionArtworkImport';
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
            loadingItems: [],
            showAddedModal: false
        }
    },
    computed: {
        currentLocale() {
            return this.$i18n ? this.$i18n.locale : 'en';
        }
    },
    methods: {
        artworkImageUrl,
        getDetail(art) {
            this.$router.push(`/artwork/${art._id}`);
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
        formatViews(views) {
            if (!views && views !== 0) return '0';
            const num = Number(views) || 0;
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
            }
            return num.toLocaleString();
        },
        async handleCartAction(art) {
            if (!this.isPurchasable(art)) return;

            if (this.isApprovalReserved(art) && !this.isInCart(art._id)) {
                return;
            }

            try {
                this.loadingItems.push(art._id);
                
                if (!this.isInCart(art._id)) {
                    const latest = await this.$store.dispatch('artwork/explore', { _id: art._id });
                    if (!this.isPurchasable(latest)) return;
                    this.$store.dispatch('cart/addToCart', latest);
                    this.showAddedModal = true;
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
            return isArtworkPurchasable(art, this.getName);
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
.artwork-detail-link { color: inherit; text-decoration: none; }
.artwork-detail-link:focus-visible { outline: 2px solid #612721; outline-offset: 4px; }
/* Modern Premium Artwork Card Design */
.artwork-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
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
    box-shadow: 0 12px 30px rgba(74, 29, 24, 0.08);
    border-color: rgba(74, 29, 24, 0.12);
}

.card-img-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 Aspect Ratio (Square) */
    overflow: hidden;
    background-color: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.card-img-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Keep the complete artwork visible */
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #ffffff;
}

.artwork-card:hover .card-img-bg {
    transform: none;
}

.card-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    z-index: 10;
    pointer-events: none;
}

.badge-reserved {
    background: rgba(74, 29, 24, 0.85);
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
    padding: 16px 18px 16px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background: #ffffff;
    z-index: 5;
    gap: 12px;
}

.art-details {
    margin-bottom: 0;
}

.art-title {
    font-family: var(--app-font-family);
    font-size: 1.12rem;
    font-weight: 700;
    color: #1c1917;
    margin-bottom: 4px;
    line-height: 1.3;
}

.art-artist {
    font-family: var(--app-font-family);
    font-size: 0.84rem;
    color: #6b7280;
    margin-bottom: 6px;
}

.art-artist strong {
    color: #374151;
}

/* Category & Meta Tags under Artwork Title */
.art-meta-tags {
    gap: 6px;
}

.badge-category-tag {
    display: inline-flex;
    align-items: center;
    background-color: #fbf7f1;
    color: #4a1d18;
    border: 1px solid rgba(74, 29, 24, 0.15);
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 0.76rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.02em;
    transition: all 0.2s ease;
    user-select: none;
}

.badge-category-tag:hover {
    background-color: #4a1d18;
    border-color: #4a1d18;
    color: #ffffff;
}

.art-technique {
    font-family: var(--app-font-family);
    font-size: 0.78rem;
    color: #9ca3af;
}

/* Inline Approval Status under Category (Artist Mode) */
.art-status-row {
    display: flex;
    align-items: center;
}

.status-badge-inline {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.74rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.02em;
    user-select: none;
    border: 1px solid transparent;
}

.status-badge-inline .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 5px;
    background-color: currentColor;
}

.status-badge-inline.badge-approved {
    background-color: #ecfdf5;
    color: #059669;
    border-color: #a7f3d0;
}

.status-badge-inline.badge-pending {
    background-color: #fffbeb;
    color: #d97706;
    border-color: #fde68a;
}

.status-badge-inline.badge-rejected {
    background-color: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
}

.status-badge-inline.badge-draft {
    background-color: #f3f4f6;
    color: #4b5563;
    border-color: #e5e7eb;
}

.status-badge-inline.badge-info {
    background-color: #eff6ff;
    color: #2563eb;
    border-color: #bfdbfe;
}

.card-footer-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #f3f4f6;
    margin-top: auto;
}

.price-container {
    display: flex;
    flex-direction: column;
}

.price-label {
    font-family: var(--app-font-family);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #9ca3af;
    margin-bottom: 2px;
    font-weight: 600;
}

.price-value {
    font-family: var(--app-font-family);
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

/* View Count near Cart Button */
.card-actions-wrapper {
    display: flex;
    align-items: center;
}

.artwork-view-count {
    display: inline-flex;
    align-items: center;
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 5px 9px;
    background-color: #f8fafc;
    border-radius: 20px;
    border: 1px solid #f1f5f9;
    user-select: none;
    transition: all 0.2s ease;
}

.artwork-view-count:hover {
    color: #4a1d18;
    background-color: #fbf7f1;
    border-color: #e8decb;
}

.view-icon {
    width: 14px;
    height: 14px;
    color: #94a3b8;
}

.artwork-view-count:hover .view-icon {
    color: #4a1d18;
}

.view-number {
    line-height: 1;
}

.action-btn-wrapper {
    z-index: 10;
}

/* Premium Circle Cart Button */
.action-btn-circle-premium {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
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
    background: #dc2626;
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

.artwork-card:hover .action-buttons-group,
.artwork-card:focus-within .action-buttons-group {
    opacity: 1;
    transform: translateX(0);
}

.action-btn {
    border: 0;
    padding: 0;
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:focus-visible { outline: 3px solid #8b633b; outline-offset: 3px; }
@media (hover: none) {
    .action-buttons-group { opacity: 1; transform: none; }
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

/* Clean & Prominent Cart Alert Modal */
.cart-alert-modal ::v-deep .modal-dialog {
    max-width: 460px;
    margin: 1.75rem auto;
}

.cart-alert-modal ::v-deep .modal-content {
    border-radius: 28px;
    border: none;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
    background: #ffffff;
    overflow: hidden;
}

.cart-alert-modal ::v-deep .modal-header,
.cart-alert-modal ::v-deep .modal-footer {
    display: none !important;
}

.cart-alert-card {
    background: #ffffff;
}

.alert-close-btn {
    top: 18px;
    right: 18px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    border: none;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
}

.alert-close-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
    transform: scale(1.05);
}

.alert-icon-wrapper {
    position: relative;
    width: 84px;
    height: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.alert-icon-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.35);
    z-index: 2;
    animation: alertPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.alert-icon-pulse {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.2);
    animation: alertPulse 1.8s infinite;
    z-index: 1;
}

@keyframes alertPop {
    0% { transform: scale(0.3); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes alertPulse {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 0; }
    100% { transform: scale(0.95); opacity: 0; }
}

.alert-modal-title {
    font-size: 1.45rem;
    color: #1e293b;
    line-height: 1.3;
}

.alert-modal-subtitle {
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.5;
}

.btn-alert-dismiss {
    background: linear-gradient(135deg, #4a1d18, #612721);
    color: #ffffff;
    border: none;
    border-radius: 30px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(74, 29, 24, 0.25);
    transition: all 0.2s ease;
    min-width: 130px;
}

.btn-alert-dismiss:hover {
    background: linear-gradient(135deg, #612721, #7a312a);
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(74, 29, 24, 0.35);
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
