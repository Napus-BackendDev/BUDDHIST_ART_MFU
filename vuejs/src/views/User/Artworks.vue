<template>
    <div class="artworks-page bg-white min-vh-100">
        <div class="artworks-page bg-white min-vh-100">
            <!-- Page Header -->
            <CContainer>
                <PageHeader title="Explore Artworks"
                    description="Discover a curated selection of contemporary art from emerging and established artists worldwide."
                    titleFontFamily="'Playfair Display', serif" />
            </CContainer>

            <CContainer class="pb-5">
                <FilterArtworks @category-changed="cat => selectedCategory = cat" />
                <ArtworkCard :artworks="filteredArtworks" />
            </CContainer>
        </div>
    </div>
</template>

<script>
import ArtworkCard from './components/card/CardArtworks.vue'
import FilterArtworks from './components/filter/FilterArtworks.vue'
import PageHeader from './components/Util/Header.vue'
export default {
    name: 'Artworks',
    components: {
        ArtworkCard,
        FilterArtworks,
        PageHeader
    },
    data() {
        return {
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
            let result = this.artworks;

            // Search Filter
            if (this.filters.searchQuery) {
                const query = this.filters.searchQuery.toLowerCase();
                result = result.filter(art =>
                    art.title.toLowerCase().includes(query) ||
                    art.artist.toLowerCase().includes(query)
                );
            }

            // Category Filter
            if (this.filters.category && this.filters.category !== 'All Categories') {
                result = result.filter(art => art.category === this.filters.category);
            }

            // Price Filter
            if (this.filters.price && this.filters.price !== 'All Prices') {
                result = result.filter(art => {
                    const price = parseFloat(art.price.replace('$', '').replace(',', ''));
                    if (this.filters.price === 'Under $500') return price < 500;
                    if (this.filters.price === '$500 - $1000') return price >= 500 && price <= 1000;
                    if (this.filters.price === 'Over $1000') return price > 1000;
                    return true;
                });
            }

            // Sort
            if (this.filters.sort) {
                result = [...result].sort((a, b) => {
                    const priceA = parseFloat(a.price.replace('$', '').replace(',', ''));
                    const priceB = parseFloat(b.price.replace('$', '').replace(',', ''));

                    if (this.filters.sort === 'Price: Low to High') return priceA - priceB;
                    if (this.filters.sort === 'Price: High to Low') return priceB - priceA;
                    if (this.filters.sort === 'Newest') return b.id - a.id;
                    if (this.filters.sort === 'Oldest') return a.id - b.id;
                    return 0;
                });
            }

            return result;
        }
    },
    methods: {
        handleFilterUpdate(newFilters) {
            this.filters = newFilters;
        },
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
