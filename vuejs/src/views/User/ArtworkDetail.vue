<template>
    <div class="artwork-detail-page bg-white min-vh-100">
        <CContainer class="py-5">
            <!-- Back Button -->
            <div class="mb-4">
                <CLink @click="$router.push({ name: 'Artworks' })"
                    class="text-muted text-decoration-none d-inline-flex align-items-center hover-link cursor-pointer">
                    <CIcon name="cil-arrow-left" class="mr-2" /> Back to Gallery
                </CLink>
            </div>

            <CRow>
                <!-- Image Section -->
                <CCol lg="6" class="mb-4 mb-lg-0">
                    <div class="artwork-image-container shadow-sm">
                        <img :src="artwork.image" alt="Artwork" class="img-fluid w-100 h-100"
                            style="object-fit: cover; border-radius: 24px;">
                    </div>
                </CCol>

                <!-- Details Section -->
                <CCol lg="6" class="pl-lg-5">
                    <div class="d-flex align-items-center mb-3">
                        <CBadge color="light" class="text-uppercase px-3 py-2 mr-2 font-weight-bold"
                            style="color: #6c757d; background-color: #f1f3f5; letter-spacing: 0.5px;">{{
                                artwork.category }}</CBadge>
                        <CBadge class="text-uppercase px-3 py-2 font-weight-bold"
                            style="color: #e67e22; background-color: #fff4e6; letter-spacing: 0.5px;">The Work of the
                            Generation</CBadge>
                    </div>

                    <h1 class="font-weight-bold display-4 mb-2 text-dark">{{ artwork.title }}</h1>
                    <p class="h5 text-muted mb-4">by {{ artwork.artist }}</p>

                    <h2 class="text-danger font-weight-bold mb-4 display-5" style="color: #E55B5B !important;">{{
                        artwork.price }}</h2>

                    <p class="text-muted mb-5" style="line-height: 1.6;">
                        {{ artwork.description }}
                    </p>

                    <!-- Specs Grid -->
                    <CRow class="mb-5">
                        <CCol md="6" class="mb-4">
                            <div class="d-flex align-items-center">
                                <div class="icon-box mr-3 bg-light text-danger rounded-circle d-flex align-items-center justify-content-center"
                                    style="width: 50px; height: 50px;">
                                    <CIcon name="cil-fullscreen" size="lg" />
                                </div>
                                <div>
                                    <div class="text-uppercase text-muted small font-weight-bold"
                                        style="font-size: 0.7rem; letter-spacing: 1px;">Size</div>
                                    <div class="font-weight-bold text-dark">{{ artwork.dimensions }}</div>
                                </div>
                            </div>
                        </CCol>
                        <CCol md="6" class="mb-4">
                            <div class="d-flex align-items-center">
                                <div class="icon-box mr-3 bg-light text-warning rounded-circle d-flex align-items-center justify-content-center"
                                    style="width: 50px; height: 50px;">
                                    <CIcon name="cil-brush" size="lg" />
                                </div>
                                <div>
                                    <div class="text-uppercase text-muted small font-weight-bold"
                                        style="font-size: 0.7rem; letter-spacing: 1px;">Technique</div>
                                    <div class="font-weight-bold text-dark">{{ artwork.medium }}</div>
                                </div>
                            </div>
                        </CCol>
                        <CCol md="12">
                            <div class="d-flex align-items-center">
                                <div class="icon-box mr-3 bg-light text-info rounded-circle d-flex align-items-center justify-content-center"
                                    style="width: 50px; height: 50px;">
                                    <CIcon name="cil-layers" size="lg" />
                                </div>
                                <div>
                                    <div class="text-uppercase text-muted small font-weight-bold"
                                        style="font-size: 0.7rem; letter-spacing: 1px;">Presentation</div>
                                    <div class="font-weight-bold text-dark">Gallery Wrapped Canvas</div>
                                </div>
                            </div>
                        </CCol>
                    </CRow>

                    <!-- Artist Concept -->
                    <div class="bg-light p-4 rounded-lg mb-5 position-relative" style="border-radius: 16px;">
                        <div class="d-flex align-items-center mb-2">
                            <CIcon name="cil-star" class="text-danger mr-2" />
                            <span class="text-uppercase font-weight-bold text-dark small"
                                style="letter-spacing: 1px;">Artist's Concept</span>
                        </div>
                        <p class="font-italic text-muted mb-0">
                            "This piece explores the balance between chaos and order, using color blocks to create a
                            harmonious yet dynamic composition."
                        </p>
                        <CIcon name="cil-quote-right" size="4xl" class="position-absolute text-muted"
                            style="right: 20px; bottom: 20px; opacity: 0.1;" />
                    </div>

                    <CButton block color="danger" size="lg" shape="pill"
                        class="font-weight-bold py-3 shadow-sm border-0 d-flex align-items-center justify-content-center"
                        style="background: linear-gradient(90deg, #E55B5B, #ff7675);" @click="addToCart">
                        <CIcon name="cil-plus" class="mr-2" /> Add to Collection
                    </CButton>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'ArtworkDetail',
    data() {
        return {
            // Mock Data - in real app would fetch based on ID
            artwork: {
                id: 1,
                title: 'Abstract Harmonies',
                artist: 'Elena Void',
                price: '$450',
                category: 'Painting',
                description: 'A vibrant exploration of color and form, this piece captures the chaotic beauty of urban life through abstract expressionism. The textured layers of acrylic paint create a depth that draws the viewer in.',
                dimensions: '60 x 80 cm',
                medium: 'Acrylic on Canvas',
                year: '2023',
                image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
            }
        }
    },
    methods: {
        addToCart() {
            this.$store.dispatch('cart/addToCart', this.artwork);

            // Show success notification
            this.$store.commit('dialog/showToast', {
                title: 'Success',
                message: `${this.artwork.title} added to cart`,
                variant: 'success'
            });

            // Optional: Redirect to cart or stay on page
            // this.$router.push('/cart'); 
        }
    },
    mounted() {
        // this.fetchArtwork(this.$route.params.id)
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
</style>
