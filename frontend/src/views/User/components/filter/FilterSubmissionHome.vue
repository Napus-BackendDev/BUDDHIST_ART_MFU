<template>
    <div class="filter-header d-flex justify-content-between align-items-center mb-5 flex-wrap">
        <h2 class="font-weight-bold mb-3 mb-md-0 section-title" style="color: #2c3e50;">Submission Collection</h2>
        
        <div class="filter-selection" style="min-width: 220px;">
            <CDropdown :caret="false" class="premium-dropdown shadow-sm w-100">
                <template #toggler>
                    <button type="button" class="premium-toggle-btn d-flex align-items-center px-4 py-2 border-0 bg-white shadow-sm w-100 h-100">
                        <CIcon name="cil-filter" class="mr-3 text-danger" />
                        <div class="text-left mr-4">
                            <span class="d-block text-muted x-small text-uppercase font-weight-bold letter-spacing-1">Category</span>
                            <span class="d-block font-weight-bold text-dark">{{ selectedCategory }}</span>
                        </div>
                        <CIcon name="cil-chevron-bottom" size="sm" class="text-muted ml-auto" />
                    </button>
                </template>
                <CDropdownMenu class="w-100 border-0 shadow-lg mt-2 py-2" style="border-radius: 12px; z-index: 1050;">
                    <CDropdownItem 
                        v-for="cat in categories" 
                        :key="cat" 
                        @click="selectedCategory = cat"
                        class="px-4 py-2 font-weight-bold"
                        :class="{ 'text-danger bg-light-red': selectedCategory === cat }"
                    >
                        {{ cat }}
                    </CDropdownItem>
                </CDropdownMenu>
            </CDropdown>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FilterArtworksHome',
    data() {
        return {
            apiCategories: [],
            selectedCategory: 'All',
        }
    },
    computed: {
        categories() {
            // Map API categories to their names and prepend 'All'
            const mapped = this.apiCategories
                .map(cat => this.getName('en', cat))
                .filter(name => name && name !== 'N/A');
            return ['All', ...mapped];
        }
    },
    methods: {
        async fetchCategories() {
            try {
                // Correctly call with method: 'get' as required by the api service
                const data = await this.$store.dispatch('artwork/category', { method: 'get', data: {} });
                if (data) {
                    this.apiCategories = data;
                }
            } catch (error) {
                console.error('Error fetching home categories:', error);
            }
        },
        getName(lang, item) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            // Check for title or name field (multi-language search)
            const field = item.title || item.name || '';
            if (typeof field === 'string' && field) return field;
            
            if (Array.isArray(field)) {
                const obj = field.find(n => n.key === lang);
                return obj ? obj.value : (field[0] ? field[0].value : 'N/A');
            }
            return '';
        }
    },
    watch: {
        selectedCategory(newVal) {
            this.$emit('category-changed', newVal);
        }
    },
    mounted() {
        this.fetchCategories();
    }
}
</script>

<style scoped>
.section-title {
    position: relative;
    padding-left: 15px;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 30px;
    background: #E55B5B;
    border-radius: 2px;
}

.premium-dropdown {
    border-radius: 12px;
}

.premium-toggle-btn {
    border-radius: 12px;
    transition: all 0.2s ease;
    cursor: pointer;
    min-height: 58px;
    outline: none !important;
}

.premium-toggle-btn:hover {
    background-color: #f8fafc !important;
}

.x-small {
    font-size: 0.65rem;
}

.letter-spacing-1 {
    letter-spacing: 1px;
}

.bg-light-red {
    background-color: rgba(229, 91, 91, 0.05);
}

.dropdown-item {
    cursor: pointer;
    transition: all 0.2s ease;
}

.dropdown-item:hover {
    background-color: #f8fafc;
    color: #E55B5B;
    padding-left: 1.7rem !important;
}

/* Ensure dropdown appears above other content */
::v-deep .dropdown-toggle {
    display: block;
    width: 100%;
    padding: 0;
}
</style>