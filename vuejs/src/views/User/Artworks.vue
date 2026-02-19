<template>
    <div class="artworks-page bg-white min-vh-100">
        <div class="artworks-page bg-white min-vh-100">
            <!-- Page Header -->
            <div class="py-5">
                <CContainer class="text-center">
                    <h1 class="display-4 font-weight-bold mb-3"
                        style="color: #1a202c; font-family: 'Playfair Display', serif;">Explore Artworks</h1>
                    <p class="text-muted mx-auto" style="max-width: 600px;">
                        Discover a curated selection of contemporary art from emerging and established artists
                        worldwide.
                    </p>
                </CContainer>
            </div>

            <CContainer class="pb-5">
                <!-- Filter Bar -->
                <CCard class="p-3 shadow-sm border-0 mb-5">
                    <CRow class="align-items-center">
                        <CCol md="5" class="mb-3 mb-md-0">
                            <CInput placeholder="Search by artwork or artist..."
                                class="border-0 bg-light pl-0 mb-0 h-100 input-field"
                                style="border-radius: 8px; height: 45px;" v-model="searchQuery">
                                <template #prepend-content>
                                    <CIcon name="cil-search" class="text-muted" />
                                </template>
                            </CInput>
                        </CCol>
                        <CCol md="7" class="d-flex justify-content-md-end flex-wrap gap-2">
                            <div class="d-inline-block mr-2" style="width: 150px;">
                                <CSelect :options="categories" :value.sync="selectedCategory" placeholder="Category"
                                    class="mb-0 border-0 bg-light" style="border-radius: 8px; height: 45px;" />
                            </div>
                            <div class="d-inline-block mr-2" style="width: 150px;">
                                <CSelect :options="['All Prices', 'Under $500', '$500 - $1000', 'Over $1000']"
                                    placeholder="Price" class="mb-0 border-0 bg-light"
                                    style="border-radius: 8px; height: 45px;" />
                            </div>
                            <div class="d-inline-block" style="width: 150px;">
                                <CSelect :options="['Newest', 'Oldest', 'Price: Low to High', 'Price: High to Low']"
                                    placeholder="Sort By" class="mb-0 border-0 bg-light"
                                    style="border-radius: 8px; height: 45px;" />
                            </div>
                        </CCol>
                    </CRow>
                </CCard>

                <!-- Artwork Grid -->
                <CRow>
                    <CCol md="4" class="mb-4" v-for="(art, index) in filteredArtworks" :key="index">
                        <CCard class="h-100 border shadow-sm artwork-card cursor-pointer"
                            style="border-radius: 16px; overflow: hidden; border-color: #e2e8f0 !important;"
                            @click="goToDetail(art.id)">
                            <div class="card-img-wrapper position-relative" style="height: 380px;">
                                <div class="position-absolute top-0 left-0 m-3 px-3 py-1 bg-white rounded-pill shadow-sm text-uppercase font-weight-bold"
                                    style="font-size: 0.7rem; letter-spacing: 1px; z-index: 1; color: #4a5568;">
                                    {{ art.category }}
                                </div>
                                <div class="card-img-bg h-100 w-100" :style="{ backgroundImage: `url(${art.image})` }">
                                </div>
                            </div>
                            <div class="card-body p-3 bg-white border-top position-relative">
                                <h5 class="font-weight-bold mb-1 text-dark">{{ art.title }}</h5>
                                <p class="text-muted small mb-2">by {{ art.artist }}</p>
                                <h5 class="font-weight-bold text-danger">{{ art.price }}</h5>

                                <!-- Hover Add Button -->
                                <div class="add-cart-btn shadow-sm" @click.stop="addToCart(art)">
                                    <CIcon name="cil-plus" size="lg" />
                                </div>
                            </div>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Artworks',
    data() {
        return {
            searchQuery: '',
            categories: ['All', 'Painting', 'Digital', 'Sculpture', 'Drawing', 'Photography'],
            selectedCategory: 'All',
            artworks: [
                {
                    id: 1,
                    category: 'Drawing',
                    title: 'The Sketch',
                    artist: 'Arthur Pen',
                    price: '$280',
                    image: 'https://images.unsplash.com/photo-1627916962770-3882aee0287d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 2,
                    category: 'Painting',
                    title: 'Mist & Mountains',
                    artist: 'Li Wei',
                    price: '$600',
                    image: 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 3,
                    category: 'Digital',
                    title: 'Surreal Mindscape',
                    artist: 'Davide V',
                    price: '$550',
                    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 4,
                    category: 'Painting',
                    title: 'Abstract Harmonies',
                    artist: 'Elena Void',
                    price: '$450',
                    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 5,
                    category: 'Sculpture',
                    title: 'White Silence',
                    artist: 'Sarah Stone',
                    price: '$890',
                    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 6,
                    category: 'Drawing',
                    title: 'Charcoal Study',
                    artist: 'David Sketch',
                    price: '$150',
                    image: 'https://images.unsplash.com/photo-1627916962770-3882aee0287d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 7,
                    category: 'Painting',
                    title: 'Red Emotion',
                    artist: 'Elena Void',
                    price: '$500',
                    image: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 8,
                    category: 'Digital',
                    title: 'Neon Nights',
                    artist: 'Cyber Artist',
                    price: '$280',
                    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 9,
                    category: 'Photography',
                    title: 'Urban Solitude',
                    artist: 'Lens Master',
                    price: '$220',
                    image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                }
            ]
        }
    },
    computed: {
        filteredArtworks() {
            if (this.selectedCategory === 'All') {
                return this.artworks;
            }
            return this.artworks.filter(art => art.category === this.selectedCategory);
        }
    },
    methods: {
        goToDetail(id) {
            this.$router.push(`/artwork/${id}`);
        },
        addToCart(art) {
            this.$store.dispatch('cart/addToCart', art);
            this.$root.$emit('bv::show::toast', 'added-to-cart-toast'); // Or simple alert/console for now if specific toaster not set up

            // CoreUI v3 Toaster usage (assuming plugin installed) or just simple alert for finding
            this.$store.commit('dialog/showToast', {
                title: 'Success',
                message: `${art.title} added to cart`,
                variant: 'success'
            });
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

/* Custom Input Styles */
::v-deep .input-group-text {
    background-color: #f8f9fa;
    /* bg-light */
    border: none;
    border-radius: 8px 0 0 8px;
    padding-left: 15px;
}

::v-deep .input-field {
    background-color: #f8f9fa;
    /* bg-light */
    border: none;
    border-radius: 0 8px 8px 0;
}

::v-deep .input-field:focus {
    box-shadow: none;
    background-color: #f8f9fa;
}
</style>
