<template>
    <CRow class="mb-4">
        <!-- Total Submitted -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Submitted</div>
                        <div class="widget-value">40 <span class="text-muted small">/ 45</span></div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-cloud-upload" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Passed -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Passed</div>
                        <div class="widget-value text-success">28</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-check-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Pending Review -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Pending Review</div>
                        <div class="widget-value text-warning">8</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-clock" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Failed -->
        <CCol sm="6" lg="3">
            <CCard class="widget-card">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Failed</div>
                        <div class="widget-value text-danger">4</div>
                    </div>
                    <div class="icon-wrapper bg-red-light text-red">
                        <CIcon name="cil-x-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'AssignmentWidget'
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
    cursor: default;
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

.bg-blue-light { background-color: #f0f4ff; }
.text-blue { color: #321fdb; }
.bg-green-light { background-color: #ebfcf1; }
.text-green { color: #10b981; }
.bg-orange-light { background-color: #fff6e8; }
.text-orange { color: #f59e0b; }
.bg-red-light { background-color: #fff5f5; }
.text-red { color: #e53e3e; }

.small {
    font-size: 0.9rem;
    font-weight: 500;
}
</style>
