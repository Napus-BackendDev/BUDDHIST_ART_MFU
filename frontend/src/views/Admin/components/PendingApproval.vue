<template>
    <CCard class="pending-card mb-4 mt-2">
        <CCardHeader class="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h4 class="card-title mb-0">Pending Approval</h4>
            <a href="#" class="view-all-link">View All</a>
        </CCardHeader>
        <CCardBody>
            <div class="scrollable-list">
                <!-- List Item 1 -->
                <div class="pending-item">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="image-placeholder"></div>
                        <div class="ml-3">
                            <div class="item-title">Abstract #44</div>
                            <div class="item-subtitle">Mike Smith &bull; 5h ago</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <CButton color="transparent" class="btn-icon p-1 text-success">
                            <CIcon name="cil-check-circle" size="lg" />
                        </CButton>
                        <CButton color="transparent" class="btn-icon p-1 text-danger ml-2">
                            <CIcon name="cil-x-circle" size="lg" />
                        </CButton>
                    </div>
                </div>

                <!-- List Item 2 -->
                <div class="pending-item">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="image-placeholder"></div>
                        <div class="ml-3">
                            <div class="item-title">Urban Chaos</div>
                            <div class="item-subtitle">Sarah Lee &bull; 1d ago</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <CButton color="transparent" class="btn-icon p-1 text-success">
                            <CIcon name="cil-check-circle" size="lg" />
                        </CButton>
                        <CButton color="transparent" class="btn-icon p-1 text-danger ml-2">
                            <CIcon name="cil-x-circle" size="lg" />
                        </CButton>
                    </div>
                </div>

                <!-- List Item 3 -->
                <div class="pending-item">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="image-placeholder"></div>
                        <div class="ml-3">
                            <div class="item-title">Mountain Mist</div>
                            <div class="item-subtitle">John Art &bull; 1d ago</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <CButton color="transparent" class="btn-icon p-1 text-success">
                            <CIcon name="cil-check-circle" size="lg" />
                        </CButton>
                        <CButton color="transparent" class="btn-icon p-1 text-danger ml-2">
                            <CIcon name="cil-x-circle" size="lg" />
                        </CButton>
                    </div>
                </div>

                <!-- List Item 4 -->
                <div class="pending-item">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="image-placeholder"></div>
                        <div class="ml-3">
                            <div class="item-title">Golden Hour</div>
                            <div class="item-subtitle">Emily Rose &bull; 2d ago</div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <CButton color="transparent" class="btn-icon p-1 text-success">
                            <CIcon name="cil-check-circle" size="lg" />
                        </CButton>
                        <CButton color="transparent" class="btn-icon p-1 text-danger ml-2">
                            <CIcon name="cil-x-circle" size="lg" />
                        </CButton>
                    </div>
                </div>
            </div>
        </CCardBody>
    </CCard>
</template>

<script>
export default {
    name: 'PendingApproval'
}
</script>

<style scoped>
.pending-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    height: 100%;
    margin-bottom: 1rem;
}

.card-title {
    font-weight: 700;
    color: #172b4d;
    font-size: 1.35rem;
}

.view-all-link {
    color: #eb6161;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
}

.view-all-link:hover {
    text-decoration: underline;
}


/* Using simple text arrows for scroll arrows, but styling track is enough usually */

.pending-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: #f8f9fa;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.pending-item:last-child {
    margin-bottom: 0;
}

.pending-item:hover {
    background-color: #f1f3f5;
}

.image-placeholder {
    width: 48px;
    height: 48px;
    background-color: #e2e4e8;
    border-radius: 10px;
    flex-shrink: 0;
}

.item-title {
    font-weight: 700;
    color: #172b4d;
    font-size: 1.05rem;
    margin-bottom: 0.15rem;
}

.item-subtitle {
    color: #8c98a9;
    font-size: 0.85rem;
    font-weight: 500;
}

.action-buttons {
    display: flex;
    align-items: center;
}

.btn-icon {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.text-success {
    color: #2e8b57 !important;
    /* using a slightly deeper green */
}

.text-danger {
    color: #dc3545 !important;
}
</style>
