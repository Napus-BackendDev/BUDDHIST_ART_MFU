<template>
    <div v-if="artworks.length > 0">
        <CRow>
            <CCol md="4" class="mb-4" v-for="(art, index) in artworks" :key="index">
                <CCard class="h-100 border-0 shadow-sm artwork-card cursor-pointer"
                    style="border-radius: 20px; overflow: hidden;" @click="getDetail(art.id)">
                    <div class="card-img-wrapper position-relative" style="height: 400px;">
                        <div class="position-absolute top-0 left-0 m-4 px-3 py-1 bg-light rounded-pill shadow-sm text-uppercase font-weight-bold"
                            style="font-size: 0.75rem; letter-spacing: 1px; z-index: 1;">
                            {{ art.category }}
                        </div>
                        <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: `url(${art.image})` }">
                        </div>
                    </div>
                    <CCardBody class="p-4 bg-white position-relative">
                        <h4 class="font-weight-bold mb-1" style="color: #1a202c;">{{ art.title }}</h4>
                        <p class="text-muted mb-3">by {{ art.artist }}</p>
                        <h4 class="font-weight-bold" style="color: #E55B5B;">{{ art.price }}</h4>

                        <!-- Hover Add Button -->
                        <div class="add-cart-btn shadow-sm" @click.stop="addToCart(art)">
                            <CIcon name="cil-plus" size="lg" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
    <div v-else class="text-center py-5">
        <CIcon name="cil-image-broken" size="3xl" class="text-muted mb-3" />
        <h4 class="text-muted">No artworks found.</h4>
        <p class="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'CardArtworks',
    props: {
        artworks: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        ...mapGetters('cart', ['cartItems', 'cartTotal', 'cartCount'])
    },
    methods: {
        getDetail(id) {
            this.$router.push(`/artworks/${id}`);
        },
        addToCart(art) {
            this.$store.dispatch('cart/addToCart', art);
        }
    }
}
</script>

<style scoped>
.artworks-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.artwork-card {
    transition: transform 0.3s ease;
}

.artwork-card:hover {
    transform: translateY(-5px);
}

.card-img-bg {
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
}

.artwork-card:hover .card-img-bg {
    transform: scale(1.1);
}

.add-cart-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 20px;
    top: 20px;
    bottom: auto;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
    color: #2c3e50;
    border: 1px solid #edf2f7;
    z-index: 2;
}

.add-cart-btn:hover {
    background-color: #E55B5B;
    color: white;
    border-color: #E55B5B;
    box-shadow: 0 4px 6px rgba(229, 91, 91, 0.3);
}

.artwork-card:hover .add-cart-btn {
    opacity: 1;
    transform: translateY(0);
}

.cursor-pointer {
    cursor: pointer;
}
</style>