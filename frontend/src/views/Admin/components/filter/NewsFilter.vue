<template>
    <CCard class="mb-4 border-0 shadow-sm admin-filter-card">
        <CCardBody class="p-4">
            <CRow class="align-items-end">
                <!-- Search Field -->
                <CCol lg="4" md="12" class="mb-3 mb-lg-0">
                    <label for="news-filter-search" class="filter-label">{{ $i18n.locale === 'en' ? 'Search News' : 'ค้นหาข่าวสาร' }}</label>
                    <div class="search-field-wrapper">
                        <CIcon name="cilMagnifyingGlass" class="search-icon-fixed" />
                        <CInput id="news-filter-search"
                            :value="value.search"
                            @input="updateFilter('search', $event)"
                            class="m-0 border-0 custom-input-plain"
                            :placeholder="$i18n.locale === 'en' ? 'Title, Content...' : 'หัวข้อ, เนื้อหา...'"
                        />
                    </div>
                </CCol>

                <!-- Quick Range -->
                <CCol lg="4" md="12" class="mb-3 mb-lg-0">
                    <label class="filter-label">{{ $i18n.locale === 'en' ? 'Quick Range' : 'ช่วงเวลาด่วน' }}</label>
                    <CButtonGroup class="w-100 quick-range-group">
                        <CButton
                            v-for="range in [ 'All Time' , 'Today', 'This Month', 'This Year']"
                            :key="range"
                            @click="setQuickRange(range)"
                            :class="['range-btn', { 'active': value.quickRange === range }]"
                        >
                            {{ getQuickRangeLabel(range) }}
                        </CButton>
                    </CButtonGroup>
                </CCol>

                <!-- Time Range -->
                <CCol lg="4" md="12" class="mb-3 mb-lg-0">
                    <label class="filter-label">{{ $i18n.locale === 'en' ? 'Time Range' : 'ช่วงเวลา' }}</label>
                    <div class="date-range-group d-flex align-items-center">
                        <div class="date-input-wrapper">
                            <CInput
                                :type="formattedStartDate ? 'date' : 'text'"
                                :aria-label="$i18n.locale === 'en' ? 'Start date' : 'วันที่เริ่มต้น'"
                                :placeholder="$i18n.locale === 'en' ? 'dd/mm/yyyy' : 'วัน/เดือน/ปี'"
                                lang="en-GB"
                                :value="formattedStartDate"
                                @focus="$event.target.type = 'date'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                                @blur="!$event.target.value && ($event.target.type = 'text')"
                                @input="onDateInput('startDate', $event)"
                                class="mb-0 custom-date-field"
                            />
                            <CIcon name="cil-calendar" class="date-icon-right" />
                        </div>
                        <span class="date-range-separator mx-2 text-muted" aria-hidden="true">&ndash;</span>
                        <div class="date-input-wrapper">
                            <CInput
                                :type="formattedEndDate ? 'date' : 'text'"
                                :aria-label="$i18n.locale === 'en' ? 'End date' : 'วันที่สิ้นสุด'"
                                :placeholder="$i18n.locale === 'en' ? 'dd/mm/yyyy' : 'วัน/เดือน/ปี'"
                                lang="en-GB"
                                :value="formattedEndDate"
                                @focus="$event.target.type = 'date'; if ($event.target.showPicker && navigator.userActivation && navigator.userActivation.isActive) $event.target.showPicker();"
                                @blur="!$event.target.value && ($event.target.type = 'text')"
                                @input="onDateInput('endDate', $event)"
                                class="mb-0 custom-date-field"
                            />
                            <CIcon name="cil-calendar" class="date-icon-right" />
                        </div>
                    </div>
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
</template>

<script>
import moment from 'moment'

export default {
    name: 'NewsFilter',
    props: {
        value: {
            type: Object,
            required: true
        }
    },
    computed: {
        formattedStartDate() {
            return this.value.startDate ? moment(this.value.startDate).format('YYYY-MM-DD') : ''
        },
        formattedEndDate() {
            return this.value.endDate ? moment(this.value.endDate).format('YYYY-MM-DD') : ''
        }
    },
    methods: {
        getQuickRangeLabel(range) {
            if (range === 'All Time') {
                return this.$i18n.locale === 'en' ? 'All Time' : 'ทั้งหมด';
            }
            if (range === 'Today') {
                return this.$i18n.locale === 'en' ? 'Today' : 'วันนี้';
            }
            if (range === 'This Month') {
                return this.$i18n.locale === 'en' ? 'This Month' : 'เดือนนี้';
            }
            if (range === 'This Year') {
                return this.$i18n.locale === 'en' ? 'This Year' : 'ปีนี้';
            }
            return range;
        },
        getName(lang, field) {
            if (!field) return 'N/A';
            if (typeof field === 'string') return field;
            if (Array.isArray(field)) {
                const obj = field.find(f => f.key === lang) || field[0];
                return obj ? obj.value : 'N/A';
            }
            return 'N/A';
        },
        updateFilter(key, val) {
            const newFilters = { ...this.value, [key]: val }
            this.$emit('input', newFilters)
        },
        onDateInput(type, val) {
            const dateVal = val ? moment(val).toDate() : null
            const newFilters = {
                ...this.value,
                [type]: dateVal,
                quickRange: 'Custom'
            }
            this.$emit('input', newFilters)
        },
        setQuickRange(rangeType) {
            let start = null
            let end = null

            switch (rangeType) {
                case 'Today':
                    start = moment().startOf('day')
                    end = moment().endOf('day')
                    break
                case 'This Month':
                    start = moment().startOf('month')
                    end = moment().endOf('month')
                    break
                case 'This Year':
                    start = moment().startOf('year')
                    end = moment().endOf('year')
                    break
                case 'All Time':
                default:
                    start = null
                    end = null
                    break
            }

            const newFilters = {
                ...this.value,
                quickRange: rangeType,
                startDate: start ? start.toDate() : null,
                endDate: end ? end.toDate() : null
            }
            this.$emit('input', newFilters)
        }
    }
}
</script>

<style scoped>
.admin-filter-card {
    position: relative !important;
    z-index: 5 !important;
    overflow: visible !important;
    border-radius: 12px;
}

.filter-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #4f5d73;
    margin-bottom: 8px;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.search-field-wrapper {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0 12px;
    min-height: 44px;
    transition: all 0.2s ease;
}

.search-field-wrapper:focus-within {
    background: #ffffff;
    border-color: #321fdb;
    box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.1);
}

.search-icon-fixed {
    color: #8c98a9;
    width: 16px;
    margin-right: 10px;
}

.custom-input-plain ::v-deep .form-group {
    margin-bottom: 0 !important;
}

.custom-input-plain ::v-deep .form-control {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    font-size: 0.9rem;
    height: auto !important;
    color: #2c3e50;
}

.date-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    min-height: 44px;
    transition: all 0.2s ease;
    overflow: hidden;
}

.date-input-wrapper:focus-within {
    background: #ffffff;
    border-color: #321fdb;
    box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.1);
}

.date-icon-right {
    position: absolute;
    right: 12px;
    width: 16px;
    color: #8a93a2;
    pointer-events: none;
    z-index: 2;
}

.custom-date-field {
    width: 100%;
    margin-bottom: 0 !important;
}

.custom-date-field ::v-deep .form-control {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    font-size: 0.85rem;
    font-weight: 500;
    color: #3b4d6b;
    height: 44px;
    text-align: center;
    cursor: pointer;
    padding-left: 36px;
    padding-right: 36px;
}

.custom-date-field ::v-deep .form-control::-webkit-calendar-picker-indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

.quick-range-group {
    background: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 8px !important;
    padding: 3px;
    min-height: 44px;
    height: auto;
}

.range-btn {
    border: none !important;
    background: transparent !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
    flex: 1;
    white-space: nowrap;
    min-height: 36px;
    box-shadow: none !important;
}

.range-btn:hover {
    color: #3b4d6b !important;
    background: rgba(0, 0, 0, 0.03) !important;
}

.range-btn.active {
    background: #ffffff !important;
    color: #321fdb !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

@media (max-width: 991.98px) {
    .quick-range-group {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
        width: 100%;
    }

    .range-btn {
        width: 100%;
        min-height: 44px;
        margin: 0 !important;
        border-radius: 6px !important;
    }
}

@media (max-width: 575.98px) {
    .admin-filter-card ::v-deep .card-body {
        padding: 1rem !important;
    }

    .quick-range-group {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .date-range-group {
        flex-direction: column;
        align-items: stretch !important;
        gap: 8px;
    }

    .date-input-wrapper {
        flex: 0 0 auto;
        width: 100%;
    }

    .date-range-separator {
        display: none;
    }
}
</style>
