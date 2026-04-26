<template>
   <CRow class="mb-4">
        <!-- Total News -->
        <CCol sm="6" lg="4">
            <CCard class="widget-card h-100">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total News</div>
                        <div class="widget-value text-blue">{{ counts.total }}</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-newspaper" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Total Views -->
        <CCol sm="6" lg="4">
            <CCard class="widget-card h-100">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Views</div>
                        <div class="widget-value text-green">{{ counts.views }}</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-eye" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Categories -->
        <CCol sm="6" lg="4">
            <CCard class="widget-card h-100">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">News Categories</div>
                        <div class="widget-value text-orange">{{ counts.categories }}</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-tags" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'NewsWidget',
    props: {
        value: {
            type: String,
            default: 'All Status'
        },
        items: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        counts() {
            const counts = {
                total: this.items.length,
                views: 0,
                categories: 0
            };

            const uniqueCats = new Set();
            this.items.forEach(item => {
                counts.views += (item.views || 0);
                if (item.category && item.category._id) {
                    uniqueCats.add(item.category._id);
                }
            });
            counts.categories = uniqueCats.size;

            return counts;
        }
    }
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

.active-widget {
    border-color: #3b82f6 !important;
    background-color: #f0f4ff !important;
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.1) !important;
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
.text-blue { color: #3b82f6; }
.bg-green-light { background-color: #ebfcf1; }
.text-green { color: #10b981; }
.bg-orange-light { background-color: #fff6e8; }
.text-orange { color: #f59e0b; }
</style>
