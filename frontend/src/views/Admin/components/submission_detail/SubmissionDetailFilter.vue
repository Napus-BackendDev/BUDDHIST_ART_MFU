<template>
  <CCard class="mb-4 border-0 shadow-sm admin-filter-card">
    <CCardBody class="p-4">
      <CRow class="align-items-end">
        <!-- Search Field -->
        <CCol lg="3" md="12" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Search Assignments' : 'ค้นหางาน' }}</label>
          <div class="search-field-wrapper">
            <CIcon name="cilMagnifyingGlass" class="search-icon-fixed" />
            <CInput 
              :value="value.search" 
              @input="updateFilter('search', $event)"
              class="m-0 border-0 custom-input-plain"
              :placeholder="$i18n.locale === 'en' ? 'Assignment title...' : 'หัวข้องาน...'" 
            />
          </div>
        </CCol>

        <!-- Status Filter -->
        <CCol lg="2" md="4" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Status' : 'สถานะ' }}</label>
          <CDropdown class="filter-dropdown-small" :caret="false">
            <template #toggler>
              <CButton class="dropdown-trigger-btn-small">
                {{ value.status }}
                <CIcon name="cil-filter" class="filter-icon-small" />
              </CButton>
            </template>
            <CDropdownMenu>
              <CDropdownItem @click="updateFilter('status', 'All Status')">{{ $i18n.locale === 'en' ? 'All Status' : 'สถานะทั้งหมด' }}</CDropdownItem>
              <CDropdownItem @click="updateFilter('status', 'In Progress')">{{ $i18n.locale === 'en' ? 'In Progress' : 'กำลังดำเนินการ' }}</CDropdownItem>
              <CDropdownItem @click="updateFilter('status', 'Closed')">{{ $i18n.locale === 'en' ? 'Closed' : 'ปิดแล้ว' }}</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>

        <!-- Quick Range -->
        <CCol lg="4" md="8" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Quick Range' : 'ช่วงเวลาด่วน' }}</label>
          <CButtonGroup class="w-100 quick-range-group">
            <CButton 
              v-for="range in ['All Time', 'Today', 'This Week', 'Last 30 Days', 'This Year']" 
              :key="range"
              @click="setQuickRange(range)"
              :class="['range-btn', { 'active': value.quickRange === range }]"
            >
              {{ range }}
            </CButton>
          </CButtonGroup>
        </CCol>

        <!-- Time Range -->
        <CCol lg="3" md="12" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Time Range' : 'ช่วงเวลา' }}</label>
          <div class="d-flex align-items-center">
            <div class="date-input-wrapper">
              <CInput 
                :type="formattedStartDate ? 'date' : 'text'"
                placeholder="วัน/เดือน/ปี"
                lang="en-GB"
                :value="formattedStartDate" 
                @focus="$event.target.type = 'date'; if ($event.target.showPicker) $event.target.showPicker();"
                @blur="!$event.target.value && ($event.target.type = 'text')"
                @input="onDateInput('startDate', $event)"
                class="mb-0 custom-date-field" 
              />
              <CIcon name="cil-calendar" class="date-icon-right" />
            </div>
            <span class="mx-2 text-muted">&ndash;</span>
            <div class="date-input-wrapper">
              <CInput 
                :type="formattedEndDate ? 'date' : 'text'"
                placeholder="วัน/เดือน/ปี"
                lang="en-GB"
                :value="formattedEndDate" 
                @focus="$event.target.type = 'date'; if ($event.target.showPicker) $event.target.showPicker();"
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
import { CDropdown, CDropdownMenu, CDropdownItem } from '@coreui/vue';
import moment from 'moment'

export default {
  name: 'SubmissionDetailFilter',
  components: {
    CDropdown,
    CDropdownMenu,
    CDropdownItem
  },
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
        case 'This Week':
          start = moment().startOf('week')
          end = moment().endOf('week')
          break
        case 'Last 30 Days':
          start = moment().subtract(30, 'days').startOf('day')
          end = moment().endOf('day')
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
}

.custom-add-dropdown {
  position: relative !important;
}

.filter-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #a0aec0;
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}

/* Search Field */
.search-field-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #ebedef;
  border-radius: 8px;
  padding: 0 12px;
  height: 42px;
  transition: all 0.2s ease;
}

.search-field-wrapper:focus-within {
  background: #ffffff;
  border-color: #321fdb;
  box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.1);
}

.search-icon-fixed {
  color: #a0aec0;
  width: 16px;
  margin-right: 10px;
}

.custom-input-plain ::v-deep .form-control {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0;
  font-size: 0.9rem;
  height: auto;
  color: #4f5d73;
}

/* Select Buttons (Dropdown Togglers) */
.filter-select-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #ebedef;
  border-radius: 8px;
  padding: 0 16px;
  height: 42px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3b4d6b;
  transition: all 0.2s ease;
  outline: none;
}

.filter-select-btn:hover {
  background: #ffffff;
  border-color: #321fdb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.filter-icon-small {
  width: 12px;
  color: #a0aec0;
}

/* Time Range Group */
.date-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #ebedef;
  border-radius: 8px;
  height: 42px;
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
  right: 8px;
  width: 14px;
  color: #a0aec0;
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
  font-size: 0.8rem;
  font-weight: 500;
  color: #3b4d6b;
  height: 42px;
  text-align: center;
  cursor: pointer;
  padding-left: 4px;
  padding-right: 20px;
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

/* Quick Range ButtonGroup */
.quick-range-group {
  background: #f8f9fa;
  border: 1px solid #ebedef;
  border-radius: 8px !important;
  padding: 3px;
  height: 42px;
}

.range-btn {
  border: none !important;
  background: transparent !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  flex: 1;
  white-space: nowrap;
  height: 100% !important;
  box-shadow: none !important;
  padding: 0 4px !important;
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

::v-deep .dropdown-menu {
  border-radius: 10px !important;
  border: 1px solid #eef0f3 !important;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2) !important;
  padding: 8px !important;
  min-width: 180px !important;
  z-index: 1000 !important;
  transform: none !important;
  top: 100% !important;
  left: 0 !important;
}
</style>
