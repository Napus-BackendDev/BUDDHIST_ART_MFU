<template>
    <CCard class="chart-card mb-4 mt-2">
        <CCardBody>
            <CRow class="mb-4 align-items-center">
                <CCol sm="5">
                    <h4 id="traffic" class="card-title mb-0">{{ $i18n.locale === 'en' ? 'Order Analytics' : 'การวิเคราะห์คำสั่งซื้อ' }}</h4>
                </CCol>
                <CCol sm="7" class="d-flex justify-content-end mt-3 mt-sm-0">
                    <div class="btn-group-wrapper">
                        <CButtonGroup class="custom-btn-group">
                            <CButton color="transparent" :class="{ active: selectedPeriod === 'Day' }"
                                @click="selectedPeriod = 'Day'">{{ $i18n.locale === 'en' ? 'Day' : 'วัน' }}</CButton>
                            <CButton color="transparent" :class="{ active: selectedPeriod === 'Month' }"
                                @click="selectedPeriod = 'Month'">{{ $i18n.locale === 'en' ? 'Month' : 'เดือน' }}</CButton>
                            <CButton color="transparent" :class="{ active: selectedPeriod === 'Year' }"
                                @click="selectedPeriod = 'Year'">{{ $i18n.locale === 'en' ? 'Year' : 'ปี' }}</CButton>
                        </CButtonGroup>
                    </div>
                </CCol>
            </CRow>
            <CChartLine :datasets="defaultDatasets" :options="defaultOptions" :labels="labels"
                style="height: 350px; margin-top: 20px;" />
        </CCardBody>
    </CCard>
</template>

<script>
import { CChartLine } from '@coreui/vue-chartjs'
import { mapState } from 'vuex'

export default {
    name: 'LineCharts',
    components: {
        CChartLine
    },
    data() {
        return {
            selectedPeriod: 'Year', // Default to year since we have real data for it
            labels: [],
            defaultDatasets: [
                {
                    label: 'Orders',
                    backgroundColor: 'rgba(235, 97, 97, 0.05)',
                    borderColor: '#eb6161',
                    pointHoverBackgroundColor: '#eb6161',
                    borderWidth: 2,
                    data: []
                }
            ]
        }
    },
    watch: {
        selectedPeriod() {
            this.updateChartData();
        },
        stats: {
            deep: true,
            handler() {
                this.updateChartData();
            }
        },
        '$i18n.locale'() {
            this.updateChartData();
        }
    },
    computed: {
        ...mapState('dashboard', ['stats']),
        defaultOptions() {
            return {
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            drawOnChartArea: false,
                            drawBorder: false,
                            display: false
                        },
                        ticks: {
                            fontColor: '#97a0ac',
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 5,
                            stepSize: 15,
                            max: 80,
                            fontColor: '#97a0ac',
                            padding: 10
                        },
                        gridLines: {
                            display: true,
                            color: '#f0f1f5',
                            borderDash: [5, 5],
                            drawBorder: false,
                        }
                    }]
                },
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 10,
                        hoverRadius: 4,
                        hoverBorderWidth: 3
                    },
                    line: {
                        tension: 0.4
                    }
                },
                tooltips: {
                    backgroundColor: '#172b4d',
                    titleFontColor: '#fff',
                    bodyFontColor: '#fff',
                    cornerRadius: 4,
                    displayColors: false,
                    intersect: false,
                    mode: 'index'
                }
            }
        }
    },
    methods: {
        updateChartData() {
            // Use real order data from backend if available
            const analytics = this.stats && this.stats.charts && this.stats.charts.orderAnalytics 
                ? this.stats.charts.orderAnalytics 
                : null;

            // Translate dataset label
            if (this.defaultDatasets && this.defaultDatasets[0]) {
                this.defaultDatasets[0].label = this.$i18n.locale === 'en' ? 'Orders' : 'คำสั่งซื้อ';
            }

            if (this.selectedPeriod === 'Month') {
                // Determine days in current month to format labels correctly (default 31)
                const now = new Date();
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const dayLabelText = this.$i18n.locale === 'en' ? 'Day' : 'วันที่';
                
                this.labels = Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    if (day === 1 || day % 3 === 0 || day === daysInMonth) {
                        return `${dayLabelText} ${day}`;
                    }
                    return '';
                });

                if (analytics && analytics.month) {
                    this.defaultDatasets[0].data = analytics.month.slice(0, daysInMonth);
                } else {
                    this.defaultDatasets[0].data = Array.from({ length: daysInMonth }, () => 0);
                }

            } else if (this.selectedPeriod === 'Day') {
                // Labels for 24 hours in a day
                this.labels = Array.from({ length: 24 }, (_, i) => {
                    if (i % 3 === 0) return `${i}:00`;
                    return '';
                });

                if (analytics && analytics.day) {
                    this.defaultDatasets[0].data = analytics.day;
                } else {
                    this.defaultDatasets[0].data = Array.from({ length: 24 }, () => 0);
                }

            } else if (this.selectedPeriod === 'Year') {
                // Labels for 12 months
                this.labels = this.$i18n.locale === 'en'
                    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    : ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

                if (analytics && analytics.year) {
                    this.defaultDatasets[0].data = analytics.year;
                } else {
                    this.defaultDatasets[0].data = Array.from({ length: 12 }, () => 0);
                }
            }

            // Force chart update by slightly mutating the dataset reference
            this.defaultDatasets = [...this.defaultDatasets];
        }
    },
    created() {
        this.updateChartData();
    }
}
</script>

<style scoped>
.chart-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.card-title {
    font-weight: 700;
    color: #172b4d;
    font-size: 1.3rem;
}

.btn-group-wrapper {
    background-color: #f4f5f7;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
}

.custom-btn-group .btn {
    border: none;
    color: #6b778c;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.4rem 1.25rem;
    border-radius: 6px;
    box-shadow: none;
    transition: all 0.2s ease;
}

.custom-btn-group .btn.active {
    background-color: #ffffff !important;
    color: #172b4d !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.custom-btn-group .btn:focus {
    box-shadow: none !important;
    outline: none !important;
}

.custom-btn-group .btn:hover:not(.active) {
    color: #172b4d;
}
</style>
