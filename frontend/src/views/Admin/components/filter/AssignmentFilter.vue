<template>
  <CCard class="mb-4 border-0 shadow-sm admin-filter-card">
    <CCardBody class="p-4">
      <CRow class="align-items-end">
        <!-- Search Field -->
        <CCol lg="3" md="12" class="mb-3 mb-lg-0">
          <label for="assignment-student-search" class="filter-label">{{ $i18n.locale === 'en' ? 'Search Students' : 'ค้นหานักศึกษา' }}</label>
          <div class="search-field-wrapper">
            <CIcon name="cilMagnifyingGlass" class="search-icon-fixed" />
            <CInput 
              id="assignment-student-search" :value="value.search"
              @input="updateFilter('search', $event)"
              class="m-0 border-0 custom-input-plain"
              :placeholder="$i18n.locale === 'en' ? 'Name or ID...' : 'ชื่อ หรือรหัส...'" 
            />
          </div>
        </CCol>

        <!-- Status Filter -->
        <CCol lg="2" md="6" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Status' : 'สถานะ' }}</label>
          <CDropdown :key="value.status + '_' + $i18n.locale" :caret="false" class="w-100 custom-add-dropdown">
            <template #toggler>
              <CButton type="button" class="filter-select-btn">
                <span class="text-truncate mr-2">{{ getStatusLabel(value.status) }}</span>
                <CIcon name="cil-filter" class="filter-icon-small" />
              </CButton>
            </template>
            <div class="w-100 shadow-sm border-0 mt-1">
            <CDropdownItem @click="updateFilter('status', 'All Statuses')">{{ $i18n.locale === 'en' ? 'All Statuses' : 'สถานะทั้งหมด' }}</CDropdownItem>
            <CDropdownItem @click="updateFilter('status', 'Passed')">{{ $i18n.locale === 'en' ? 'Passed' : 'ผ่าน' }}</CDropdownItem>
            <CDropdownItem @click="updateFilter('status', 'Pending')">{{ $i18n.locale === 'en' ? 'Pending' : 'รอตรวจ' }}</CDropdownItem>
            <CDropdownItem @click="updateFilter('status', 'Fail')">{{ $i18n.locale === 'en' ? 'Fail' : 'ไม่ผ่าน' }}</CDropdownItem>
            </div>
          </CDropdown>
        </CCol>

        <!-- Deadline Filter -->
        <CCol lg="2" md="6" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Deadline' : 'เส้นตาย' }}</label>
          <CDropdown :key="value.deadline + '_' + $i18n.locale" :caret="false" class="w-100 custom-add-dropdown">
            <template #toggler>
              <CButton type="button" class="filter-select-btn">
                <span class="text-truncate mr-2">{{ getDeadlineLabel(value.deadline) }}</span>
                <CIcon name="cil-clock" class="filter-icon-small" />
              </CButton>
            </template>
            <div class="w-100 shadow-sm border-0 mt-1">
            <CDropdownItem @click="updateFilter('deadline', 'Any Deadline')">{{ $i18n.locale === 'en' ? 'Any Deadline' : 'ไม่จำกัดเวลา' }}</CDropdownItem>
            <CDropdownItem @click="updateFilter('deadline', 'On Time')">{{ $i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา' }}</CDropdownItem>
            <CDropdownItem @click="updateFilter('deadline', 'Late')">{{ $i18n.locale === 'en' ? 'Late' : 'สาย' }}</CDropdownItem>
            </div>
          </CDropdown>
        </CCol>

        <!-- Quick Range -->
        <CCol lg="3" md="12" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Submission period' : 'ช่วงเวลาส่งงาน' }}</label>
          <CButtonGroup class="w-100 quick-range-group">
            <CButton 
              v-for="range in [ 'All Time' , 'Today', 'This Week', 'This Month']" 
              :key="range"
              @click="setQuickRange(range)"
              :class="['range-btn', { 'active': value.quickRange === range }]"
            >
              {{ getQuickRangeLabel(range) }}
            </CButton>
          </CButtonGroup>
        </CCol>

        <!-- Time Range -->
        <CCol lg="2" md="12" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Time Range' : 'ช่วงเวลา' }}</label>
          <div class="d-flex align-items-center">
            <div class="date-input-wrapper">
              <CInput 
                :type="formattedStartDate ? 'date' : 'text'"
                :placeholder="$i18n.locale === 'en' ? 'dd/mm/yyyy' : 'วัน/เดือน/ปี'"
                lang="en-GB"
                :aria-label="$i18n.locale === 'en' ? 'Start date' : 'วันที่เริ่มต้น'" :value="formattedStartDate"
                @focus="$event.target.type = 'date'; if ($event.target.showPicker) $event.target.showPicker();"
                @blur="!$event.target.value && ($event.target.type = 'text')"
                @input="onDateInput('startDate', $event)"
                class="mb-0 custom-date-field" 
              />
              <CIcon name="cil-calendar" class="date-icon-right" />
            </div>
            <span class="mx-1 text-muted">&ndash;</span>
            <div class="date-input-wrapper">
              <CInput 
                :type="formattedEndDate ? 'date' : 'text'"
                :placeholder="$i18n.locale === 'en' ? 'dd/mm/yyyy' : 'วัน/เดือน/ปี'"
                lang="en-GB"
                :aria-label="$i18n.locale === 'en' ? 'End date' : 'วันที่สิ้นสุด'" :value="formattedEndDate"
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
import moment from 'moment'

export default {
  name: 'AssignmentFilter',
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
    getStatusLabel(status) {
      if (status === 'All Statuses') {
        return this.$i18n.locale === 'en' ? 'All Statuses' : 'สถานะทั้งหมด';
      }
      if (status === 'Passed') {
        return this.$i18n.locale === 'en' ? 'Passed' : 'ผ่าน';
      }
      if (status === 'Pending') {
        return this.$i18n.locale === 'en' ? 'Pending' : 'รอตรวจ';
      }
      if (status === 'Fail') {
        return this.$i18n.locale === 'en' ? 'Fail' : 'ไม่ผ่าน';
      }
      return status;
    },
    getDeadlineLabel(deadline) {
      if (deadline === 'Any Deadline') {
        return this.$i18n.locale === 'en' ? 'Any Deadline' : 'ไม่จำกัดเวลา';
      }
      if (deadline === 'On Time') {
        return this.$i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา';
      }
      if (deadline === 'Late') {
        return this.$i18n.locale === 'en' ? 'Late' : 'สาย';
      }
      return deadline;
    },
    getQuickRangeLabel(range) {
      if (range === 'All Time') {
        return this.$i18n.locale === 'en' ? 'All Time' : 'ทั้งหมด';
      }
      if (range === 'Today') {
        return this.$i18n.locale === 'en' ? 'Today' : 'วันนี้';
      }
      if (range === 'This Week') {
        return this.$i18n.locale === 'en' ? 'This Week' : 'สัปดาห์นี้';
      }
      if (range === 'This Month') {
        return this.$i18n.locale === 'en' ? 'This Month' : 'เดือนนี้';
      }
      return range;
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
        case 'This Week':
          start = moment().startOf('week')
          end = moment().endOf('week')
          break
        case 'This Month':
          start = moment().startOf('month')
          end = moment().endOf('month')
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

.custom-add-dropdown {
  position: relative !important;
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

/* Search Field */
.search-field-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
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

/* Select Buttons (Dropdown Togglers) */
.filter-select-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 16px;
  height: 42px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #44546d;
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
  color: #8a93a2;
}

/* Time Range Group */
.date-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
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
  height: 42px;
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

/* Quick Range ButtonGroup */
.quick-range-group {
  background: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px !important;
  padding: 3px;
  height: 42px;
}

.range-btn {
  border: none !important;
  background: transparent !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  flex: 1;
  white-space: nowrap;
  height: 100% !important;
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
