<template>
    <div>
        <!-- Top Header & Actions Section -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <!-- Left: Title & Subtitle -->
            <div class="d-flex align-items-center">
                <div>
                    <h3 class="font-weight-bold m-0" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Certifications' : 'ใบรับรอง' }}</h3>
                    <p class="text-muted mt-1 mb-0 font-weight-bold">{{ $i18n.locale === 'en' ? 'Manage and view all learner certificates' : 'จัดการและดูใบรับรองผู้เรียนทั้งหมด' }}</p>
                </div>
            </div>

            <!-- Right: Search & Create Button -->
            <div class="d-flex align-items-center">
                <div class="search-wrapper mr-3">
                    <CIcon name="cilMagnifyingGlass" class="search-icon" />
                    <CInput class="m-0 custom-search-cinput" :placeholder="$i18n.locale === 'en' ? 'Search certifications...' : 'ค้นหาใบรับรอง...'" />
                </div>
                <CButton class="add-btn d-flex align-items-center" @click="createCertification">
                    <CIcon name="cil-plus" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Create Certification' : 'สร้างใบรับรอง' }}
                </CButton>
            </div>
        </div>

        <!-- DataTable Component -->
        <CertificationTable @view="handleView" @edit="handleEdit" @delete="handleDelete" />
    </div>
</template>

<script>
import CertificationTable from './components/table/CertificationTable.vue'

export default {
    name: 'Certification',
    components: {
        CertificationTable
    },
    methods: {
        createCertification() {
            this.$router.push({ name: 'Create Certification' })
        },
        handleView(item) {
            console.log('View Certificate:', item)
        },
        handleEdit(item) {
            console.log('Edit Certificate:', item)
        },
        handleDelete(item) {
            console.log('Delete Certificate:', item)
        }
    }
}
</script>

<style scoped>
/* Search Bar */
.search-wrapper {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    width: 300px;
}

.search-wrapper:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
    margin-right: 12px;
}

/* Custom CInput overrides */
.custom-search-cinput {
    flex-grow: 1;
}

::v-deep .custom-search-cinput .form-group {
    margin-bottom: 0 !important;
}

::v-deep .custom-search-cinput .form-control {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #172b4d;
    box-shadow: none;
    padding: 0;
}

::v-deep .custom-search-cinput .form-control::placeholder {
    color: #a0aec0;
}

/* Add Button */
.add-btn {
    background-color: #2c3e50;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 0 20px;
    height: 48px;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 4px 6px rgba(44, 62, 80, 0.1);
    transition: all 0.2s ease-in-out;
}

.add-btn:hover {
    background-color: #1a252f;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(44, 62, 80, 0.15);
}
</style>
