<template>
    <CCard class="chart-card mb-4 mt-2">
        <CCardBody>
            <CRow class="mb-4 align-items-center">
                <CCol sm="5">
                    <h4 id="traffic" class="card-title mb-0">Order Analytics</h4>
                </CCol>
                <CCol sm="7" class="d-flex justify-content-end mt-3 mt-sm-0">
                    <div class="btn-group-wrapper">
                        <CButtonGroup class="custom-btn-group">
                            <CButton color="transparent" :class="{ active: selectedPeriod === 'Day' }"
                                @click="selectedPeriod = 'Day'">Day</CButton>
                            <CButton color="transparent" :class="{ active: selectedPeriod === 'Month' }"
                                @click="selectedPeriod = 'Month'">Month</CButton>
                            <CButton color="transparent" :class="{ active: selectedPeriod === 'Year' }"
                                @click="selectedPeriod = 'Year'">Year</CButton>
                        </CButtonGroup>
                    </div>
                </CCol>
            </CRow>
            <CChartLine :datasets="datasets" :options="defaultOptions" :labels="chartLabels"
                style="height: 350px; margin-top: 20px;" />
        </CCardBody>
    </CCard>
</template>

<script>
import { CChartLine } from '@coreui/vue-chartjs'
import { mapState } from 'vuex';
import moment from 'moment';

export default {
    name: 'LineCharts',
    components: {
        CChartLine
    },
    data() {
        return {
            selectedPeriod: 'Month'
        }
    },
    computed: {
        ...mapState('dashboard', ['stats', 'loading']),
        chartData() {
            if (this.selectedPeriod === 'Month' && this.stats.charts.orders && this.stats.charts.orders.length > 0) {
                return {
                    labels: this.stats.charts.orders.map(o => moment(o._id).format('D MMM')),
                    data: this.stats.charts.orders.map(o => o.count)
                };
            }
            
            // Fallback/Default mock logic for Day/Year or if Month has no data yet
            let labels = [];
            let data = [];

            if (this.selectedPeriod === 'Month') {
                labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
                data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50));
            } else if (this.selectedPeriod === 'Day') {
                labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
                data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 40) + 10);
            } else if (this.selectedPeriod === 'Year') {
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 20);
            }

            return { labels, data };
        },
        chartLabels() {
            return this.chartData.labels;
        },
        datasets() {
            return [
                {
                    label: 'Orders',
                    backgroundColor: 'rgba(235, 97, 97, 0.05)',
                    borderColor: '#eb6161',
                    pointHoverBackgroundColor: '#eb6161',
                    borderWidth: 2,
                    data: this.chartData.data
                }
            ];
        },
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
                            autoSkip: true,
                            maxTicksLimit: 12,
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
