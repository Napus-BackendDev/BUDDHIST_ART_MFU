<template>
    <div class="artwork-detail-page bg-white min-vh-100">
        <CContainer class="py-5">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5 mt-5">
                <CSpinner color="danger" variant="grow" style="width: 4rem; height: 4rem;" />
                <h3 class="mt-4 text-muted font-weight-light">Fetching masterwork details...</h3>
            </div>

            <template v-else-if="artwork && artwork._id">
                <!-- Preview Banner -->
                <div v-if="isPreview"
                    class="preview-banner-premium mb-4 shadow-lg border-0 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="banner-icon-wrapper mr-3">
                            <CIcon name="cil-view-quilt" class="text-white" />
                        </div>
                        <div>
                            <div class="banner-title text-white">Preview Mode</div>
                            <div class="banner-subtitle">You are viewing how the artwork will appear to users. Changes are
                                not yet saved.</div>
                        </div>
                    </div>
                    <CButton color="light" size="sm" shape="pill" class="btn-close-preview font-weight-bold"
                        @click="closePreview">
                        <CIcon name="cil-x" class="mr-1" size="sm" /> Exit Preview
                    </CButton>
                </div>

                <!-- Back Button -->
                <div class="mb-4" v-if="!isPreview">
                    <CLink @click="$router.push({ name: 'Artworks' })"
                        class="text-muted text-decoration-none d-inline-flex align-items-center hover-link cursor-pointer">
                        <CIcon name="cil-arrow-left" class="mr-2" /> Back to Gallery
                    </CLink>
                </div>

                <CRow>
                    <!-- Image Section -->
                    <CCol lg="6" class="mb-4 mb-lg-0">
                        <div class="artwork-image-container shadow-sm position-relative">
                            <img :src="artwork.image || 'https://via.placeholder.com/1200x1200?text=No+Image'"
                                :alt="getName('en', artwork)" class="img-fluid w-100 h-100 main-artwork-img">
                            <div v-if="isSoldOut" class="sold-out-overlay">
                                <span class="sold-out-text">SOLD OUT</span>
                            </div>
                        </div>
                    </CCol>

                    <!-- Details Section -->
                    <CCol lg="6" class="pl-lg-5">
                        <div class="d-flex align-items-center mb-3">
                            <CBadge color="light" class="text-uppercase px-3 py-2 mr-2 font-weight-bold"
                                style="color: #6c757d; background-color: #f1f3f5; letter-spacing: 0.5px;">
                                {{ artwork.category ? getName('en', artwork.category) : 'Artwork' }}
                            </CBadge>
                            <CBadge v-if="artwork.status && artwork.status.approval"
                                class="text-uppercase px-3 py-2 font-weight-bold"
                                :style="getStatusBadgeStyle()">
                                {{ getName('en', artwork.status.approval) }}
                            </CBadge>
                        </div>

                        <h1 class="font-weight-bold display-4 mb-2 text-dark">{{ getName('en', artwork) }}</h1>
                        <p class="h5 text-muted mb-4">by {{ artwork.artist ? getName('en', artwork.artist) : 'Unknown Artist' }}</p>

                        <h2 class="text-danger font-weight-bold mb-4 display-5" style="color: #E55B5B !important;">
                            <span class="currency-symbol h4 mr-1">฿</span>{{ formatPrice(artwork.price) }}
                        </h2>

                        <div class="description-container mb-5">
                            <h6 class="text-uppercase font-weight-bold text-muted small mb-3" style="letter-spacing: 1px;">About this piece</h6>
                            <p class="text-muted" style="line-height: 1.8; font-size: 1.05rem;">
                                {{ getName('en', artwork, 'description') || 'No description provided for this artwork.' }}
                            </p>
                        </div>

                        <!-- Specs Grid -->
                        <CRow class="mb-5">
                            <CCol md="6" class="mb-4">
                                <div class="d-flex align-items-center">
                                    <div class="icon-box mr-3 bg-light text-danger rounded-circle d-flex align-items-center justify-content-center"
                                        style="width: 50px; height: 50px;">
                                        <CIcon name="cil-brush" size="lg" />
                                    </div>
                                    <div>
                                        <div class="text-uppercase text-muted small font-weight-bold"
                                            style="font-size: 0.7rem; letter-spacing: 1px;">Technique</div>
                                        <div class="font-weight-bold text-dark">{{ getName('en', artwork, 'technique') || 'Mixed Media' }}</div>
                                    </div>
                                </div>
                            </CCol>
                            <CCol md="6" class="mb-4">
                                <div class="d-flex align-items-center">
                                    <div class="icon-box mr-3 bg-light text-info rounded-circle d-flex align-items-center justify-content-center"
                                        style="width: 50px; height: 50px;">
                                        <CIcon name="cil-calendar" size="lg" />
                                    </div>
                                    <div>
                                        <div class="text-uppercase text-muted small font-weight-bold"
                                            style="font-size: 0.7rem; letter-spacing: 1px;">Created</div>
                                        <div class="font-weight-bold text-dark">{{ formatDate(artwork.createdAt) }}</div>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <!-- Artist Concept (Only if exists) -->
                        <div v-if="getName('en', artwork, 'description')" class="bg-light p-4 rounded-lg mb-5 position-relative" style="border-radius: 16px;">
                            <div class="d-flex align-items-center mb-2">
                                <CIcon name="cil-star" class="text-danger mr-2" />
                                <span class="text-uppercase font-weight-bold text-dark small"
                                    style="letter-spacing: 1px;">Curator's Note</span>
                            </div>
                            <p class="font-italic text-muted mb-0">
                                This masterpiece represents the pinnacle of contemporary buddhist art, showcasing exquisite detail and spiritual depth.
                            </p>
                            <CIcon name="cil-quote-right" size="4xl" class="position-absolute text-muted"
                                style="right: 20px; bottom: 20px; opacity: 0.1;" />
                        </div>

                        <CButton block :color="isSoldOut || isPreview ? 'secondary' : (isInCart ? 'dark' : 'danger')" size="lg" shape="pill"
                            :disabled="isSoldOut || isPreview"
                            class="font-weight-bold py-3 shadow-sm border-0 d-flex align-items-center justify-content-center btn-cart-action"
                            :style="isSoldOut || isPreview || isInCart ? 'background: #e2e8f0 !important; color: #94a3b8 !important;' : 'background: linear-gradient(90deg, #E55B5B, #ff7675); color: white !important;'"
                            @click="addToCart">
                            <CIcon v-if="!isSoldOut && !isPreview && !isInCart" name="cil-plus" class="mr-2" />
                            <CIcon v-else-if="isSoldOut" name="cil-lock-locked" class="mr-2" />
                            <CIcon v-else-if="isInCart" name="cil-check" class="mr-2" />
                            {{ getButtonText }}
                        </CButton>
                    </CCol>
                </CRow>
            </template>

            <!-- Not Found State -->
            <div v-else class="text-center py-5 mt-5">
                <CIcon name="cil-mood-bad" size="4xl" class="text-muted mb-3" />
                <h2 class="text-dark">Artwork Not Found</h2>
                <p class="text-muted">The artwork you are looking for might have been removed or is currently unavailable.</p>
                <CButton color="danger" variant="outline" shape="pill" class="mt-3 px-4" @click="$router.push({ name: 'Artworks' })">
                    Back to Gallery
                </CButton>
            </div>
        </CContainer>
    </div>
</template>

<script>
import moment from 'moment';

export default {
    name: 'ArtworkDetail',
    data() {
        return {
            loading: true,
            isPreview: false,
            artwork: {}
        }
    },
    computed: {
        isSoldOut() {
            if (!this.artwork || !this.artwork.status || !this.artwork.status.sale) return false;
            return this.getName('en', this.artwork.status.sale) === 'Sold Out';
        },
        isInCart() {
            if (!this.artwork || !this.artwork._id) return false;
            return this.$store.getters['cart/isInCart'](this.artwork._id);
        },
        getButtonText() {
            if (this.isPreview) return 'Disabled in Preview Mode';
            if (this.isSoldOut) return 'Already Sold Out';
            if (this.isInCart) return 'In Collection (Remove?)';
            return 'Add to Collection';
        }
    },
    methods: {
        async fetchArtwork() {
            const id = this.$route.params.id;
            if (id === 'preview') {
                const previewData = sessionStorage.getItem('artwork_preview');
                if (previewData) {
                    this.artwork = JSON.parse(previewData);
                    this.isPreview = true;
                    this.loading = false;
                }
                return;
            }

            this.loading = true;
            try {
                // Use explore action to fetch single artwork by _id in body
                const result = await this.$store.dispatch('artwork/explore', { _id: id });
                if (result) {
                    this.artwork = result;
                }
            } catch (error) {
                console.error('Error fetching artwork details:', error);
            } finally {
                this.loading = false;
            }
        },
        closePreview() {
            this.$router.go(-1);
        },
        addToCart() {
            if (this.isPreview || this.isSoldOut) return;
            
            if (this.isInCart) {
                // Toggle OFF: Remove from cart
                this.$store.dispatch('cart/removeFromCart', this.artwork._id);
                this.$store.commit('dialog/showToast', {
                    title: 'Removed',
                    message: `${this.getName('en', this.artwork)} removed from collection`,
                    variant: 'info'
                });
                return;
            }

            // Toggle ON: Add to cart
            this.$store.dispatch('cart/addToCart', {
                _id: this.artwork._id,
                title: this.getName('en', this.artwork),
                price: this.artwork.price,
                image: this.artwork.image,
                artist: this.artwork.artist ? this.getName('en', this.artwork.artist) : 'N/A'
            });

            this.$store.commit('dialog/showToast', {
                title: 'Success',
                message: `${this.getName('en', this.artwork)} added to collection`,
                variant: 'success'
            });

            // Open the cart sidebar globally via Vuex
            this.$store.dispatch('cart/setShowCart', true);
        },
        getName(lang, item, field = 'title') {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            const dataField = item[field] || item['name'] || '';
            if (typeof dataField === 'string') return dataField;
            
            if (Array.isArray(dataField)) {
                const obj = dataField.find(n => n.key === lang);
                return obj ? obj.value : (dataField[0] ? dataField[0].value : '');
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
        formatDate(date) {
            if (!date) return 'Unknown';
            return moment(date).format('MMMM Do, YYYY');
        },
        getStatusBadgeStyle() {
            const status = this.getName('en', this.artwork.status.approval);
            if (status === 'Approved' || status === 'Success') {
                return 'color: #27ae60; background-color: #eafaf1; letter-spacing: 0.5px;';
            }
            return 'color: #e67e22; background-color: #fff4e6; letter-spacing: 0.5px;';
        }
    },
    mounted() {
        this.fetchArtwork();
    }
}
</script>

<style scoped>
.artwork-detail-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.hover-link:hover {
    color: #E55B5B !important;
}

.artwork-image-container {
    border-radius: 24px;
    overflow: hidden;
    height: 100%;
    min-height: 500px;
}

.cursor-pointer {
    cursor: pointer;
}

/* Preview Banner Styling */
.preview-banner-premium {
    background: linear-gradient(135deg, #1e293b, #334155);
    padding: 1rem 1.75rem;
    border-radius: 16px;
}

.banner-icon-wrapper {
    background: rgba(255, 255, 255, 0.1);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.banner-title {
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.banner-subtitle {
    color: #94a3b8;
    font-size: 0.8rem;
}

.btn-close-preview {
    border: none;
    padding: 0.5rem 1.25rem;
    color: #1e293b !important;
}

.currency-symbol {
    color: #E55B5B;
    opacity: 0.7;
    vertical-align: middle;
}

.main-artwork-img {
    transition: transform 0.5s ease;
}

.artwork-image-container:hover .main-artwork-img {
    transform: scale(1.02);
}

.sold-out-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    z-index: 2;
}

.sold-out-text {
    color: white;
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: 8px;
    border: 4px solid white;
    padding: 1rem 2rem;
    transform: rotate(-15deg);
    text-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.description-container {
    border-left: 3px solid #E55B5B;
    padding-left: 1.5rem;
}
</style>
