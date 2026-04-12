<template>
    <div class="user-landing">

        <!-- News Section (Carousel) -->
        <div class="news-section">
            <CCarousel arrows indicators animate height="500px">
                <CCarouselItem v-for="(item, index) in newsItems" :key="item._id">
                    <div class="d-flex align-items-center justify-content-center h-100 news-slide">
                        <CContainer class="d-flex align-items-center h-100">
                            <CRow class="w-100 align-items-center">
                                <CCol md="6" class="text-white text-left pl-5">
                                    <span class="badge badge-pill badge-light text-uppercase px-3 py-2 mb-3"
                                        style="color: #E55B5B; font-weight: bold; letter-spacing: 1px;">{{ item.tag
                                        }}</span>
                                    <h1 class="display-4 font-weight-bold mb-3">{{ item.title }}</h1>
                                    <p class="lead mb-4">{{ item.description }}</p>
                                    <CButton color="light" shape="pill" size="lg"
                                        class="font-weight-bold px-4 text-danger shadow hover-scale" @click="explore(item._id)">
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
                <h1 class="display-3 font-weight-bold mb-4 animate-up" style="color: #2c3e50;">
                    Art that speaks to <span style="color: #E55B5B;">your soul.</span>
                </h1>
                <p class="lead text-muted mb-5 mx-auto animate-up delay-1" style="max-width: 700px;">
                    Discover curated collections from emerging artists worldwide. Reliable shipping, authenticated
                    works, and a seamless buying experience.
                </p>
                <div class="mb-5 animate-up delay-2">
                    <CButton color="danger" size="lg" shape="pill" class="px-5 py-3 mr-3 font-weight-bold shadow-sm"
                        style="background-color: #E55B5B; border: none;" @click="$router.push({ name: 'Artworks' })">Start Collecting
                        <CIcon name="cil-arrow-right" class="ml-2" />
                    </CButton>
                    <CButton color="white" size="lg" shape="pill" class="px-5 py-3 font-weight-bold shadow-sm border"
                        style="color: #2c3e50;" @click="$router.push({ name: 'Artworks' })">View Gallery</CButton>
                </div>

                <!-- Features -->
                <CRow class="mt-5 pt-4 animate-up delay-3">
                    <CCol md="4" class="mb-4">
                        <CCard class="h-100 border-0 shadow-sm py-4 feature-card">
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
                        <CCard class="h-100 border-0 shadow-sm py-4 feature-card">
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
                        <CCard class="h-100 border-0 shadow-sm py-4 feature-card">
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
                <div class="text-center mb-5">
                    <h2 class="display-4 font-weight-bold">Featured Collection</h2>
                    <div class="title-underline mx-auto mt-2"></div>
                </div>

                <div v-if="loading" class="text-center py-5">
                    <CSpinner color="danger" variant="grow" />
                    <p class="mt-3 text-muted">Loading masterpiece collection...</p>
                </div>
                <template v-else>
                    <FilterArtworksHome @category-changed="cat => selectedCategory = cat" />
                    <CardArtworks :artworks="filteredArtworks" />
                    
                    <div v-if="filteredArtworks.length === 0" class="text-center py-5">
                        <CIcon name="cil-search" size="4xl" class="text-muted mb-3" />
                        <p class="text-muted">No artworks found in this category yet.</p>
                    </div>

                    <div class="text-center mt-5">
                        <CButton color="danger" variant="outline" shape="pill" size="lg" class="px-5 font-weight-bold" 
                            @click="$router.push({ name: 'Artworks' })">
                            View All Masterpieces
                        </CButton>
                    </div>
                </template>
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
            loading: true,
            selectedCategory: 'All',
            newsItems: [
                {
                    _id: 1,
                    tag: 'Curated Collection',
                    title: 'Summer Solstice',
                    description: 'Discover exclusive pieces inspired by the warmth and vibrancy of summer. Hand-picked by our expert curators.',
                    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80'
                },
                {
                    _id: 2,
                    tag: 'New Arrivals',
                    title: 'Modern Abstract',
                    description: 'Explore our latest collection of modern abstract art, featuring bold colors and unique shapes.',
                    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80'
                },
                {
                    _id: 3,
                    tag: 'Featured Artist',
                    title: 'Somsak Chaiya',
                    description: 'A deep dive into the traditional Buddhist art techniques preserved by Master Somsak.',
                    image: 'https://images.unsplash.com/photo-1599809272520-27f91079da99?ixlib=rb-1.2.1&auto=format&fit=crop&w=1502&q=80'
                }
            ]
        }
    },
    computed: {
        allArtworks() {
            return this.$store.getters['artwork/artworks'] || [];
        },
        filteredArtworks() {
            // Only show approved artworks on home side
            let result = this.allArtworks.filter(art => {
                const status = this.getStatusLabel(art);
                return ['Approved', 'Success'].includes(status);
            });

            // Category Filter
            if (this.selectedCategory !== 'All') {
                result = result.filter(art => {
                    if (!art.category) return false;
                    const catName = this.getName('en', art.category);
                    return catName === this.selectedCategory;
                });
            }
            
            // Limit to 6 on home page
            return result.slice(0, 6);
        }
    },
    methods: {
        async fetchArtworks() {
            this.loading = true;
            try {
                await this.$store.dispatch('artwork/get');
            } catch (error) {
                console.error('Error fetching home artworks:', error);
            } finally {
                this.loading = false;
            }
        },
        getStatusLabel(art) {
            if (!art || !art.status || !art.status.approval) return 'Pending';
            return this.getName('en', art.status.approval);
        },
        getName(lang, item, field = 'title') {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            const dataField = item[field] || item['name'] || '';
            if (typeof dataField === 'string' && dataField) return dataField;
            
            if (Array.isArray(dataField)) {
                const obj = dataField.find(n => n.key === lang);
                return obj ? obj.value : (dataField[0] ? dataField[0].value : '');
            }
            return '';
        },
        explore(id) {
            if (id) {
                this.$router.push({ name: 'Artworks' });
            }
        }
    },
    mounted() {
        this.fetchArtworks();
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
    background: linear-gradient(to bottom, #FFFFFF 0%, #FFF5F5 100%);
    min-height: 80vh;
}

.feature-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
}

.featured-section {
    background-color: #f8f9fa;
}

.news-section {
    position: relative;
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    padding: 0;
}

.image-card {
    width: 400px;
    height: 400px;
    background-size: cover;
    background-position: center;
    border-radius: 20px;
}

.title-underline {
    width: 80px;
    height: 4px;
    background: #E55B5B;
    border-radius: 2px;
}

.animate-up {
    animation: fadeInUp 0.8s ease backwards;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
