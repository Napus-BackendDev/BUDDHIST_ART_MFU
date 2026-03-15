<template>
    <CRow class="mb-4">
        <!-- Total Artworks -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card" @click="$emit('filter-status', 'All')">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Artworks</div>
                        <div class="widget-value">458</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-paint" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Completed -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card" @click="$emit('filter-status', 'Completed')">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Completed</div>
                        <div class="widget-value">312</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-check-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Pending -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card" @click="$emit('filter-status', 'Pending')">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Pending</div>
                        <div class="widget-value">124</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-clock" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Update Status -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card" @click="$emit('filter-status', 'Update')">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Update</div>
                        <div class="widget-value">22</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-sync" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'ArtworkWidget'
}
</script>

<style scoped>
.widget-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
    height: 100%;
    margin-bottom: 0;
    cursor: pointer;
    user-select: none;
}

.widget-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.widget-title {
    color: #6b778c;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
}

.widget-value {
    color: #172b4d;
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
}

.icon-wrapper {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Custom Colors for Icons */
.bg-blue-light {
    background-color: #f0f4ff;
}
.text-blue {
    color: #3b82f6;
}

.bg-green-light {
    background-color: #ebfcf1;
}
.text-green {
    color: #10b981;
}

.bg-orange-light {
    background-color: #fff6e8;
}
.text-orange {
    color: #f59e0b;
}

.bg-purple-light {
    background-color: #f5f3ff;
}
.text-purple {
    color: #8b5cf6;
}
</style>
