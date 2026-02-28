<template>
    <CCard class="p-3 shadow-sm border-0 mb-5">
        <CRow class="align-items-center">
            <CCol md="5" class="mb-3 mb-md-0">
                <CInput placeholder="Search by artwork or artist..."
                    class="border-0 bg-light pl-0 mb-0 h-100 input-field" style="border-radius: 8px; height: 45px;"
                    v-model="searchQuery">
                    <template #prepend-content>
                        <CIcon name="cil-search" class="text-muted" />
                    </template>
                </CInput>
            </CCol>
            <CCol md="7" class="d-flex justify-content-md-end flex-wrap gap-2">
                <div class="d-inline-block mr-2" style="width: 150px;">
                    <CSelect :options="categories" :value.sync="selectedCategory" class="mb-0 border-0 bg-light"
                        style="border-radius: 8px; height: 45px;" />
                </div>
                <div class="d-inline-block mr-2" style="width: 150px;">
                    <CSelect :options="prices" :value.sync="selectedPrice" class="mb-0 border-0 bg-light"
                        style="border-radius: 8px; height: 45px;" />
                </div>
                <div class="d-inline-block" style="width: 180px;">
                    <CSelect :options="sorts" :value.sync="selectedSort" class="mb-0 border-0 bg-light"
                        style="border-radius: 8px; height: 45px;" />
                </div>
            </CCol>
        </CRow>
    </CCard>
</template>

<script>
export default {
    name: 'FilterArtworks',
    data() {
        return {
            searchQuery: '',
            selectedCategory: 'All Categories',
            selectedPrice: 'All Prices',
            selectedSort: 'Newest',
            categories: [
                { value: 'All Categories', label: 'All Categories' },
                { value: 'Painting', label: 'Painting' },
                { value: 'Digital', label: 'Digital' },
                { value: 'Sculpture', label: 'Sculpture' },
                { value: 'Drawing', label: 'Drawing' },
                { value: 'Photography', label: 'Photography' }
            ],
            prices: [
                { value: 'All Prices', label: 'All Prices' },
                { value: 'Under $500', label: 'Under $500' },
                { value: '$500 - $1000', label: '$500 - $1000' },
                { value: 'Over $1000', label: 'Over $1000' }
            ],
            sorts: [
                { value: 'Newest', label: 'Newest' },
                { value: 'Oldest', label: 'Oldest' },
                { value: 'Price: Low to High', label: 'Price: Low to High' },
                { value: 'Price: High to Low', label: 'Price: High to Low' }
            ]
        }
    },
    watch: {
        searchQuery() { this.emitUpdate(); },
        selectedCategory() { this.emitUpdate(); },
        selectedPrice() { this.emitUpdate(); },
        selectedSort() { this.emitUpdate(); }
    },
    methods: {
        emitUpdate() {
            this.$emit('filter-update', {
                searchQuery: this.searchQuery,
                category: this.selectedCategory,
                price: this.selectedPrice,
                sort: this.selectedSort
            });
        }
    }
}
</script>

<style scoped>
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