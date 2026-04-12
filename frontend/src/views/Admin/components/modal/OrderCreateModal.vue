<template>
    <CModal 
        title="Create New Order" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="create-order-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-cart" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Create New Order</h5>
                        <p class="text-muted small mb-0">Enter the details below to register a new order.</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2">
            <!-- Customer Info Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Customer Name</label>
                        <CInput 
                            v-model="form.customer" 
                            placeholder="e.g. Alice Johnson" 
                            class="custom-input"
                        />
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Phone Number</label>
                        <CInput 
                            v-model="form.phone" 
                            placeholder="e.g. 081-234-5678" 
                            class="custom-input"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Order Info Row -->
            <CRow>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Purchase Date</label>
                        <div class="input-group-custom">
                            <CInput 
                                type="date"
                                v-model="form.date" 
                                class="custom-input w-100" 
                            />
                        </div>
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="form-group-custom">
                        <label class="form-label">Total Price</label>
                        <div class="input-group-custom">
                            <span class="currency-prefix">฿</span>
                            <CInput 
                                type="number"
                                v-model="form.amount" 
                                placeholder="0.00" 
                                class="custom-input-with-prefix"
                                readonly
                            />
                        </div>
                    </div>
                </CCol>
            </CRow>

            <!-- Address Row -->
            <CRow>
                <CCol md="12">
                    <div class="form-group-custom">
                        <label class="form-label">Delivery Address</label>
                        <CTextarea 
                            v-model="form.address" 
                            placeholder="Street, City, Province, Postal Code..." 
                            rows="3"
                            class="custom-textarea"
                        />
                    </div>
                </CCol>
            </CRow>

            <!-- Artwork Selection Section -->
            <div class="artwork-selection-section mt-3">
                <label class="form-label">Search & Add Artworks</label>
                <div class="search-box-container mb-3">
                    <div class="search-input-wrapper-limited">
                        <CInput 
                            v-model="artworkSearchQuery" 
                            placeholder="Search by artwork title or artist..." 
                            class="custom-input-search"
                            @input="handleArtworkSearch"
                        />
                    </div>
                    
                    <!-- Search Results Dropdown -->
                    <div v-if="searchResults.length > 0" class="search-results-dropdown shadow-lg">
                        <div 
                            v-for="art in searchResults" 
                            :key="art.id" 
                            class="search-result-item d-flex align-items-center p-2"
                            @click="selectArtwork(art)"
                        >
                            <img :src="art.image" class="result-thumb mr-3" />
                            <div class="flex-grow-1">
                                <div class="font-weight-bold text-dark">{{ art.title }}</div>
                                <div class="text-muted small">{{ art.artist }}</div>
                            </div>
                            <CButton color="primary" variant="ghost" size="sm" class="rounded-pill">
                                <CIcon name="cil-plus" />
                            </CButton>
                        </div>
                    </div>
                </div>

                <!-- Selected Artworks List -->
                <div v-if="form.artworks.length > 0" class="selected-artworks-list border rounded p-3 bg-light">
                    <div v-for="(art, index) in form.artworks" :key="index" class="selected-art-item d-flex align-items-center mb-2 last-child-mb-0 bg-white p-2 rounded shadow-sm">
                        <img :src="art.image" class="selected-thumb mr-3" />
                        <div class="flex-grow-1">
                            <div class="font-weight-bold text-dark">{{ art.title }}</div>
                            <div class="text-muted small">{{ art.artist }}</div>
                        </div>
                        <CButton color="danger" variant="ghost" size="sm" @click="removeArtwork(index)">
                            <CIcon name="cil-trash" />
                        </CButton>
                    </div>
                </div>
                <div v-else class="empty-artworks-placeholder text-center py-4 border rounded border-dashed">
                    <CIcon name="cil-image" size="xl" class="text-muted mb-2 d-block mx-auto" />
                    <span class="text-muted">No artworks added yet</span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end align-items-center py-2">
                <CButton 
                    variant="ghost" 
                    @click="$emit('update:show', false)"
                    class="btn-cancel mr-3"
                >
                    Cancel
                </CButton>
                <CButton 
                    color="primary" 
                    @click="handleSave"
                    class="btn-create-order"
                    :disabled="form.artworks.length === 0"
                >
                    Create Order
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'OrderCreateModal',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            artworkSearchQuery: '',
            searchResults: [],
            // Mock Artwork Data for Search
            mockArtworks: [
                { id: 1, title: 'Morning Haze', artist: 'Elena G.', price: 4500, image: 'https://via.placeholder.com/80/2d3748/ffffff?text=MH' },
                { id: 2, title: 'City Lights', artist: 'Davide B.', price: 12500, image: 'https://via.placeholder.com/80/e2e8f0/808080?text=CL' },
                { id: 3, title: 'Ocean Blue', artist: 'Sarah L.', price: 8500, image: 'https://via.placeholder.com/80/cbd5e0/808080?text=OB' },
                { id: 4, title: 'Forest Path', artist: 'Mike R.', price: 3200, image: 'https://via.placeholder.com/80/a0aec0/ffffff?text=FP' },
                { id: 5, title: 'Golden Buddha', artist: 'Ananda S.', price: 15000, image: 'https://via.placeholder.com/80/ecc94b/ffffff?text=GB' },
                { id: 6, title: 'Lotus Serenity', artist: 'Malee W.', price: 5500, image: 'https://via.placeholder.com/80/fbb6ce/ffffff?text=LS' },
                { id: 7, title: 'Deep Meditation', artist: 'Somsak K.', price: 18000, image: 'https://via.placeholder.com/80/4a5568/ffffff?text=DM' },
                { id: 8, title: 'Temple Sunset', artist: 'Elena G.', price: 7200, image: 'https://via.placeholder.com/80/ed8936/ffffff?text=TS' },
                { id: 9, title: 'Abstract Zen', artist: 'Jiro K.', price: 9800, image: 'https://via.placeholder.com/80/2d3748/ffffff?text=AZ' },
                { id: 10, title: 'River of Life', artist: 'Sarah L.', price: 4200, image: 'https://via.placeholder.com/80/4299e1/ffffff?text=RL' },
                { id: 11, title: 'Ancestral Spirit', artist: 'Panya T.', price: 25000, image: 'https://via.placeholder.com/80/744210/ffffff?text=AS' },
                { id: 12, title: 'Ethereal Soul', artist: 'Malee W.', price: 6800, image: 'https://via.placeholder.com/80/9f7aea/ffffff?text=ES' },
                { id: 13, title: 'Wisdom Tree', artist: 'Ananda S.', price: 11000, image: 'https://via.placeholder.com/80/48bb78/ffffff?text=WT' },
                { id: 14, title: 'Sacred Mandala', artist: 'Somsak K.', price: 13500, image: 'https://via.placeholder.com/80/f6ad55/ffffff?text=SM' },
                { id: 15, title: 'Infinity Silence', artist: 'Jiro K.', price: 8900, image: 'https://via.placeholder.com/80/edf2f7/2d3748?text=IS' }
            ],
            form: {
                customer: '',
                phone: '',
                address: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                artworks: []
            }
        }
    },
    watch: {
        'form.artworks': {
            handler(newVal) {
                this.form.amount = newVal.reduce((sum, art) => sum + art.price, 0)
            },
            deep: true
        }
    },
    methods: {
        handleArtworkSearch() {
            if (this.artworkSearchQuery.length < 2) {
                this.searchResults = []
                return
            }
            this.searchResults = this.mockArtworks.filter(art => 
                art.title.toLowerCase().includes(this.artworkSearchQuery.toLowerCase()) ||
                art.artist.toLowerCase().includes(this.artworkSearchQuery.toLowerCase())
            )
        },
        selectArtwork(art) {
            // Check if already added
            if (this.form.artworks.find(a => a.id === art.id)) {
                this.artworkSearchQuery = ''
                this.searchResults = []
                return
            }
            this.form.artworks.push({ ...art })
            this.artworkSearchQuery = ''
            this.searchResults = []
        },
        removeArtwork(index) {
            this.form.artworks.splice(index, 1)
        },
        handleSave() {
            if (!this.form.customer || this.form.artworks.length === 0) {
                alert('Please fill in customer name and add at least one artwork')
                return
            }
            
            this.$emit('save', { ...this.form })
            this.resetForm()
        },
        resetForm() {
            this.form = {
                customer: '',
                phone: '',
                address: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                artworks: []
            }
            this.artworkSearchQuery = ''
            this.searchResults = []
        }
    }
}
</script>

<style scoped>
.form-group-custom {
    margin-bottom: 1.25rem;
}

.form-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
}

.custom-input ::v-deep .form-control,
.custom-input-search ::v-deep .form-control,
.custom-textarea ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 1rem 1.25rem;
    height: auto;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: #f8fafc;
    color: #1e293b;
}

.custom-input ::v-deep .form-control::placeholder,
.custom-textarea ::v-deep .form-control::placeholder {
    color: #94a3b8;
}

.custom-input ::v-deep .form-control:focus,
.custom-input-search ::v-deep .form-control:focus,
.custom-textarea ::v-deep .form-control:focus {
    border-color: #3b82f633;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

.input-group-custom {
    position: relative;
}

.currency-prefix {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 500;
    color: #1e293b;
    z-index: 5;
    font-size: 1.1rem;
    line-height: 1;
}

.custom-input-with-prefix ::v-deep .form-control {
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    padding: 1rem 2.5rem !important;
    height: auto;
    font-size: 1rem;
    background-color: #f8fafc;
}

.custom-input-with-prefix ::v-deep .form-control[readonly] {
    background-color: #f1f5f9 !important;
    cursor: default;
    color: #64748b;
    font-weight: 700;
}

.input-icon-right {
    position: absolute;
    right: 16px;
    color: #64748b;
    width: 18px;
    pointer-events: none;
}

/* Artwork Selection UI */
.search-input-wrapper-limited {
    max-width: 320px;
}

.search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    z-index: 100;
    border-radius: 12px;
    margin-top: 8px;
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
}

.search-result-item {
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f1f5f9;
}

.search-result-item:hover {
    background: #f8fafc;
}

.result-thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
}

.selected-art-item {
    transition: all 0.2s;
    border: 1px solid #f1f5f9;
}

.selected-thumb {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    object-fit: cover;
}

.last-child-mb-0:last-child {
    margin-bottom: 0 !important;
}

.border-dashed {
    border-style: dashed !important;
    border-width: 1px !important;
    border-color: #e2e8f0 !important;
    background-color: #f8fafc;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.empty-artworks-placeholder span {
    color: #94a3b8;
    font-size: 1.1rem;
}

/* Header & Modal Stying */
.icon-square {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-blue-light {
    background-color: #3b82f611;
}

.text-blue {
    color: #3b82f6;
}

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #64748b;
}

::v-deep .modal-content {
    border-radius: 20px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem 2rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.5rem 2.5rem;
}

.btn-cancel {
    color: #94a3b8 !important;
    font-weight: 600;
    font-size: 1rem;
}

.btn-cancel:hover {
    color: #64748b !important;
    background: transparent !important;
}

.btn-create-order {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    border-radius: 30px !important;
    padding: 0.8rem 2.5rem !important;
    font-weight: 600 !important;
    font-size: 1rem;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
}

.btn-create-order:hover {
    background-color: #2563eb !important;
    transform: translateY(-1px);
}
</style>