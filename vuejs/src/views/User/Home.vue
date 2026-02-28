<template>
    <div class="user-landing">

        <!-- News Section (Carousel) -->
        <!-- Ideally this would be a separate component, but putting here for simplicity as per previous request -->
        <div class="news-section">
            <CCarousel arrows indicators animate height="500px">
                <CCarouselItem v-for="(item, index) in newsItems" :key="index">
                    <div class="d-flex align-items-center justify-content-center h-100 news-slide">
                        <CContainer class="d-flex align-items-center h-100">
                            <CRow class="w-100 align-items-center">
                                <CCol md="6" class="text-white text-left pl-5">
                                    <span class="badge badge-pill badge-light text-uppercase px-3 py-2 mb-3"
                                        style="color: #E55B5B; font-weight: bold; letter-spacing: 1px;">{{ item.tag
                                        }}</span>
                                    <h1 class="display-3 font-weight-bold mb-3">{{ item.title }}</h1>
                                    <p class="lead mb-4">{{ item.description }}</p>
                                    <CButton color="light" shape="pill" size="lg"
                                        class="font-weight-bold px-4 text-danger" @click="explore(item.id)">
                                        Explore Collection
                                        <CIcon name="cil-arrow-right" class="ml-2" />
                                    </CButton>
                                </CCol>
                                <CCol md="6" class="d-flex justify-content-center">
                                    <div class="image-card shadow-lg"
                                        :style="{ backgroundImage: `url(${item.image})` }"></div>
                                </CCol>
                            </CRow>
                        </CContainer>
                    </div>
                </CCarouselItem>
            </CCarousel>
        </div>

        <!-- Home Section (Hero) -->
        <div class="home-section d-flex align-items-center justify-content-center text-center">
            <CContainer>
                <h1 class="display-3 font-weight-bold mb-4" style="color: #2c3e50;">
                    Art that speaks to <span style="color: #E55B5B;">your soul.</span>
                </h1>
                <p class="lead text-muted mb-5 mx-auto" style="max-width: 700px;">
                    Discover curated collections from emerging artists worldwide. Reliable shipping, authenticated
                    works, and a seamless buying experience.
                </p>
                <div class="mb-5">
                    <CButton color="danger" size="lg" shape="pill" class="px-5 py-3 mr-3 font-weight-bold shadow-sm"
                        style="background-color: #E55B5B; border: none;">Start Collecting
                        <CIcon name="cil-arrow-right" class="ml-2" />
                    </CButton>
                    <CButton color="white" size="lg" shape="pill" class="px-5 py-3 font-weight-bold shadow-sm"
                        style="color: #2c3e50;">View Gallery</CButton>
                </div>

                <!-- Features -->
                <CRow class="mt-5 pt-4">
                    <CCol md="4" class="mb-4">
                        <CCard class="h-100 border-0 shadow-sm py-4">
                            <CCardBody>
                                <div class="mb-3 text-warning">
                                    <CIcon name="cil-shield-alt" size="3xl" />
                                </div>
                                <h5 class="font-weight-bold">Authenticity Guaranteed</h5>
                                <p class="text-muted small mt-2">Every piece is verified and comes with a certificate of
                                    authenticity.</p>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md="4" class="mb-4">
                        <CCard class="h-100 border-0 shadow-sm py-4">
                            <CCardBody>
                                <div class="mb-3 text-danger">
                                    <CIcon name="cil-truck" size="3xl" />
                                </div>
                                <h5 class="font-weight-bold">Global Secure Shipping</h5>
                                <p class="text-muted small mt-2">Fully insured shipping to over 100 countries worldwide.
                                </p>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md="4" class="mb-4">
                        <CCard class="h-100 border-0 shadow-sm py-4">
                            <CCardBody>
                                <div class="mb-3 text-success">
                                    <CIcon name="cil-loop-circular" size="3xl" />
                                </div>
                                <h5 class="font-weight-bold">Easy Returns</h5>
                                <p class="text-muted small mt-2">30-day return policy if the artwork doesn't fit your
                                    space perfectly.</p>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>

        <!-- Featured Collection Section -->
        <div class="featured-section py-5">
            <CContainer>
                <FilterArtworksHome @category-changed="cat => selectedCategory = cat" />

                <CardArtworks :artworks="filteredArtworks" />
            </CContainer>
        </div>


    </div>
</template>

<script>
import CardArtworks from './components/card/CardArtworks.vue'
import FilterArtworksHome from './components/filter/FilterArtworksHome.vue'
export default {
    name: 'UserIndex',
    components: {
        CardArtworks,
        FilterArtworksHome
    },
    data() {
        return {
            selectedCategory: 'All',
            artworks: [
                {
                    id: 101,
                    category: 'Painting',
                    title: 'Abstract Harmonies',
                    artist: 'Elena Void',
                    price: '$450',
                    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 102,
                    category: 'Digital',
                    title: 'Geometric Dreams',
                    artist: 'Marcus Lines',
                    price: '$320',
                    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 103,
                    category: 'Sculpture',
                    title: 'White Silence',
                    artist: 'Sarah Stone',
                    price: '$890',
                    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                // Add more if needed, but 3 is good for row
                {
                    id: 104,
                    category: 'Drawing',
                    title: 'Charcoal Study',
                    artist: 'David Sketch',
                    price: '$150',
                    image: 'https://images.unsplash.com/photo-1627916962770-3882aee0287d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 105,
                    category: 'Painting',
                    title: 'Red Emotion',
                    artist: 'Elena Void',
                    price: '$500',
                    image: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 106,
                    category: 'Digital',
                    title: 'Neon Nights',
                    artist: 'Cyber Artist',
                    price: '$280',
                    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                }
            ],
            newsItems: [
                {
                    id: 1,
                    tag: 'Curated Collection',
                    title: 'Summer Solstice',
                    description: 'Discover exclusive pieces inspired by the warmth and vibrancy of summer. Hand-picked by our expert curators.',
                    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80'
                },
                {
                    id: 2,
                    tag: 'New Arrivals',
                    title: 'Modern Abstract',
                    description: 'Explore our latest collection of modern abstract art, featuring bold colors and unique shapes.',
                    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80'
                },
                {
                    id: 3,
                    tag: 'Featured Artist',
                    title: 'Somsak Chaiya',
                    description: 'A deep dive into the traditional Buddhist art techniques preserved by Master Somsak.',
                    image: 'https://images.unsplash.com/photo-1599809272520-27f91079da99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80'
                }
            ]
        }
    },
    computed: {
        filteredArtworks() {
            if (this.selectedCategory === 'All') {
                return this.artworks.slice(0, 6);
            }
            return this.artworks.filter(art => art.category === this.selectedCategory);
        }
    },
    methods: {
        explore(id) {
            if (id) {
                this.$router.push({ name: 'ArtworkDetail', params: { id: id } });
            }
        }
    }
}
</script>

<style scoped>
.user-landing {
    background-color: #fff;
    overflow-x: hidden;
}

.home-section {
    padding: 6rem 0;
    /* Light warm gradient */
    background: linear-gradient(to bottom, #FFFFFF 0%, #FFF5F5 100%);
    min-height: 80vh;
    /* Adjust as needed */
}

/* Enhancing Card Hover */
.home-section .card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.home-section .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
}



/* Featured Section Styles */
.featured-section {
    background-color: #f8f9fa;
    /* Slight off-white to distinguish from hero */
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

/* News Section Styles */
.news-section {
    position: relative;
    /* Use the reddish gradient from the design */
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    padding: 4rem 0;
}

.news-slide {
    width: 100%;
}

.image-card {
    width: 400px;
    height: 400px;
    background-size: cover;
    background-position: center;
    border-radius: 20px;
    transition: transform 0.3s;
}

.image-card:hover {
    transform: scale(1.02);
}

/* Customize Carousel Indicators/Arrows if needed to match design perfectly */
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

::v-deep .carousel-control-prev-icon,
::v-deep .carousel-control-next-icon {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    padding: 25px;
    background-size: 50% 50%;
}

::v-deep .carousel-indicators li {
    background-color: rgba(255, 255, 255, 0.5);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin: 0 5px;
}

::v-deep .carousel-indicators .active {
    background-color: #fff;
    width: 25px;
    border-radius: 10px;
}

.cursor-pointer {
    cursor: pointer;
}
</style>
