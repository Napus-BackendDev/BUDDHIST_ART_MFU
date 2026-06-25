<template>
    <CRow class="mb-4">
        <!-- Total Orders -->
        <CCol sm="6" lg="3" @click="$emit('input', 'All Status')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'All Status' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Total Orders' : 'คำสั่งซื้อทั้งหมด' }}</div>
                        <div class="widget-value text-blue">{{ counts.total }}</div>
                    </div>
                    <div class="icon-wrapper bg-blue-light text-blue">
                        <CIcon name="cil-cart" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Completed Orders -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Completed')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Completed' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Approved' : 'อนุมัติ' }}</div>
                        <div class="widget-value text-green">{{ counts.completed }}</div>
                    </div>
                    <div class="icon-wrapper bg-green-light text-green">
                        <CIcon name="cil-check-circle" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Pending Orders -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Pending')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Pending' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ' }}</div>
                        <div class="widget-value text-orange">{{ counts.pending }}</div>
                    </div>
                    <div class="icon-wrapper bg-orange-light text-orange">
                        <CIcon name="cil-clock" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

        <!-- Artworks Sold -->
        <CCol sm="6" lg="3" @click="$emit('input', 'Completed')" style="cursor: pointer;">
            <CCard :class="['widget-card', { 'active-widget': value === 'Completed' }]">
                <CCardBody class="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <div class="widget-title">{{ $i18n.locale === 'en' ? 'Artworks Sold' : 'งานศิลปะที่ขายออกไปแล้ว' }}</div>
                        <div class="widget-value text-purple">{{ counts.artworksSold }}</div>
                    </div>
                    <div class="icon-wrapper bg-purple-light text-purple">
                        <CIcon name="cil-paint" size="xl" />
                    </div>
                </CCardBody>
            </CCard>
        </CCol>

    </CRow>
</template>

<script>
export default {
    name: 'OrderWidget',
    props: {
        value: {
            type: String,
            default: 'All Status'
        },
        orders: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        counts() {
            const counts = {
                total: this.orders.length,
                completed: 0,
                pending: 0,
                artworksSold: 0
            };

            this.orders.forEach(order => {
                const label = this.getStatusLabel(order);
                if (label === 'Completed') {
                    counts.completed++;
                    counts.artworksSold += (order.artwork ? order.artwork.length : 0);
                }
                else if (label === 'Pending') counts.pending++;
            });

            return counts;
        }
    },
    methods: {
        getStatusLabel(order) {
            if (!order || !order.status) return 'Pending';
            
            let status = '';
            if (typeof order.status === 'string') {
                status = order.status;
            } else if (order.status.title) {
                const enStatus = order.status.title.find(t => t.key === 'en');
                status = enStatus ? enStatus.value : '';
            }

            switch (status) {
                case 'Completed':
                case 'Success':
                case 'Approved':
                    return 'Completed';
                case 'Cancelled':
                case 'Rejected':
                    return 'Cancelled';
                default:
                    return 'Pending';
            }
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
    border-color: #3f6ad8 !important;
    background-color: #f0f4ff !important;
    box-shadow: 0 6px 16px rgba(63, 106, 216, 0.1) !important;
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
    color: #d97706;
}

.bg-red-light {
    background-color: #fff1f0;
}
.text-red {
    color: #e53935;
}

.bg-purple-light {
    background-color: #f7f0ff;
}
.text-purple {
    color: #805ad5;
}
</style>
