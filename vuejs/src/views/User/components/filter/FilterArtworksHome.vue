<template>
    <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap">
        <h2 class="font-weight-bold display-4 mb-3 mb-md-0" style="color: #2c3e50;">Featured Collection</h2>
        <div class="filter-buttons">
            <CButton v-for="cat in categories" :key="cat" shape="pill" variant="outline"
                :color="selectedCategory === cat ? 'danger' : 'secondary'" class="m-1 font-weight-bold border-0 px-4"
                :class="{ 'bg-danger text-white': selectedCategory === cat, 'bg-light text-muted': selectedCategory !== cat }"
                @click="selectedCategory = cat">
                {{ cat }}
            </CButton>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FilterArtworksHome',
    data() {
        return {
            categories: ['All', 'Painting', 'Digital', 'Sculpture', 'Drawing'],
            selectedCategory: 'All',
        }
    },
    watch: {
        selectedCategory(newVal) {
            this.$emit('category-changed', newVal);
        }
    }
}
</script>