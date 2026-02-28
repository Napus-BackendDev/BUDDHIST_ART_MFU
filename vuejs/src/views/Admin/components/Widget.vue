<template>
    <CRow class="mb-4">
        <!-- Total Active Orders -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Active Orders</div>
                        <div class="widget-value">124</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-cart" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Pending Artworks -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Pending Artworks</div>
                        <div class="widget-value">15</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-clock" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Today's Submissions -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Today's Submissions</div>
                        <div class="widget-value">8</div>
                    </div>
                    <div class="icon-wrapper bg-purple-light text-purple">
                        <!-- Using cloud-upload or arrow-top -->
                        <CIcon name="cil-cloud-upload" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Total Artists -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Artists</div>
                        <div class="widget-value">450</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-people" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>

</script>

<style scoped>
.widget-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
    height: 100%;
    margin-bottom: 0;
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
    color: #3f6ad8;
}

.bg-orange-light {
    background-color: #fff6e8;
}

.text-orange {
    color: #d97706;
    /* slightly darker orange for contrast */
}

.bg-purple-light {
    background-color: #f5f0ff;
}

.text-purple {
    color: #8b5cf6;
}

.bg-green-light {
    background-color: #ebfcf1;
}

.text-green {
    color: #10b981;
}
</style>
