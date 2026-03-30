<template>
    <CRow class="mb-4">
        <!-- Total Artworks -->
        <CCol sm="6" lg="3" @click="$emit('input', 'All Status')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'All Status' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Total Artwork</div>
                        <div class="widget-value text-blue">{{ counts.total }}</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-paint" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Approved -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Approved')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Approved' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Approved</div>
                        <div class="widget-value text-green">{{ counts.approved }}</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-check-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Pending -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Pending')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Pending' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Pending</div>
                        <div class="widget-value text-orange">{{ counts.pending }}</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-clock" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Rejected -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Rejected')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Rejected' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">Rejected</div>
                        <div class="widget-value text-red">{{ counts.rejected }}</div>
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
    name: 'ArtworkWidget',
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
                approved: 0,
                pending: 0,
                rejected: 0
            };

            this.items.forEach(item => {
                const label = this.getStatusLabel(item);
                if (label === 'Approved') counts.approved++;
                else if (label === 'Pending') counts.pending++;
                else if (label === 'Rejected') counts.rejected++;
            });

            return counts;
        }
    },
    methods: {
        getStatusLabel(item) {
            if (!item || !item.status || !item.status.approval) return 'Pending';
            
            const approval = item.status.approval;
            let status = '';
            
            if (typeof approval === 'string') {
                status = approval;
            } else if (approval.title && Array.isArray(approval.title)) {
                const enStatus = approval.title.find(t => t.key === 'en');
                status = enStatus ? enStatus.value : (approval.title[0] ? approval.title[0].value : '');
            } else if (approval.name) {
                status = approval.name;
            }

            // Normalize
            if (status === 'Approved' || status === 'Success') return 'Approved';
            if (status === 'Rejected' || status === 'Cancelled') return 'Rejected';
            if (status === 'Pending') return 'Pending';
            
            return 'Pending'; // Default
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

.bg-red-light {
    background-color: #fff1f0;
}
.text-red {
    color: #e53935;
}
</style>
