<template>
  <CCard class="mb-4 border-0 shadow-sm admin-filter-card">
    <CCardBody class="p-4">
      <CRow class="align-items-end">
        <!-- Search Field -->
        <CCol lg="6" md="12" class="mb-3 mb-lg-0">
          <label for="user-filter-search" class="filter-label">{{ $i18n.locale === 'en' ? 'Search Users' : 'ค้นหาผู้ใช้งาน' }}</label>
          <div class="search-field-wrapper">
            <CIcon name="cilMagnifyingGlass" class="search-icon-fixed" />
            <CInput id="user-filter-search"
              :value="value.search"
              @input="updateFilter('search', $event)"
              class="m-0 border-0 custom-input-plain"
              :placeholder="$i18n.locale === 'en' ? 'Name, Email or Student ID...' : 'ชื่อ อีเมล หรือรหัสนักศึกษา...'"
            />
          </div>
        </CCol>

        <!-- Role Filter -->
        <CCol lg="3" md="6" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Role' : 'บทบาท' }}</label>
          <CDropdown :key="value.role + '_' + $i18n.locale" :caret="false" class="w-100 custom-add-dropdown">
            <template #toggler>
              <CButton type="button" class="filter-select-btn shadow-none">
                <span class="text-truncate mr-2">{{ getSelectedRoleLabel }}</span>
                <CIcon name="cil-user" class="filter-icon-small" />
              </CButton>
            </template>
            <div class="w-100 shadow-sm border-0 mt-1">
              <CDropdownItem @click="updateFilter('role', 'All Roles')">{{ $i18n.locale === 'en' ? 'All Roles' : 'บทบาททั้งหมด' }}</CDropdownItem>
              <CDropdownItem v-for="r in roles" :key="r._id || r.nameEn" @click="updateFilter('role', r.nameEn || r.name)">
                {{ r.name }}
              </CDropdownItem>
              <CDropdownItem v-if="roles.length === 0" disabled class="small text-muted">{{ $i18n.locale === 'en' ? 'No Roles Available' : 'ไม่มีบทบาท' }}</CDropdownItem>
            </div>
          </CDropdown>
        </CCol>

        <!-- Status Filter -->
        <CCol lg="3" md="6" class="mb-3 mb-lg-0">
          <label class="filter-label">{{ $i18n.locale === 'en' ? 'Status' : 'สถานะ' }}</label>
          <CDropdown :key="value.status + '_' + $i18n.locale" :caret="false" class="w-100 custom-add-dropdown">
            <template #toggler>
              <CButton type="button" class="filter-select-btn shadow-none">
                <span class="text-truncate mr-2">{{ getSelectedStatusLabel }}</span>
                <CIcon name="cil-filter" class="filter-icon-small" />
              </CButton>
            </template>
            <div class="w-100 shadow-sm border-0 mt-1">
              <CDropdownItem @click="updateFilter('status', 'All Status')">{{ $i18n.locale === 'en' ? 'All Status' : 'สถานะทั้งหมด' }}</CDropdownItem>
              <CDropdownItem v-for="s in statuses" :key="s._id || s.nameEn" @click="updateFilter('status', s.nameEn || s.name)">
                {{ s.name }}
              </CDropdownItem>
              <CDropdownItem v-if="statuses.length === 0" disabled class="small text-muted">{{ $i18n.locale === 'en' ? 'No Status Available' : 'ไม่มีสถานะ' }}</CDropdownItem>
            </div>
          </CDropdown>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'UserFilter',
  props: {
    value: {
      type: Object,
      required: true
    },
    roles: {
      type: Array,
      default: () => []
    },
    statuses: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    getSelectedRoleLabel() {
      if (!this.value.role || this.value.role === 'All Roles') {
        return this.$i18n.locale === 'en' ? 'All Roles' : 'บทบาททั้งหมด';
      }
      const valLower = String(this.value.role).trim().toLowerCase();
      const role = this.roles.find(r =>
        (r.nameEn && r.nameEn.toLowerCase() === valLower) ||
        String(r._id) === this.value.role ||
        (r.name && r.name.toLowerCase() === valLower)
      );
      if (role) {
        return role.name;
      }
      if (valLower === 'admin' || valLower === 'ผู้ดูแลระบบ') {
        return this.$i18n.locale === 'en' ? 'Admin' : 'ผู้ดูแลระบบ';
      }
      if (valLower === 'artist' || valLower === 'ศิลปิน') {
        return this.$i18n.locale === 'en' ? 'Artist' : 'ศิลปิน';
      }
      if (valLower === 'customer' || valLower === 'user' || valLower === 'ลูกค้า') {
        return this.$i18n.locale === 'en' ? 'Customer' : 'ลูกค้า';
      }
      return this.value.role;
    },
    getSelectedStatusLabel() {
      if (!this.value.status || this.value.status === 'All Status') {
        return this.$i18n.locale === 'en' ? 'All Status' : 'สถานะทั้งหมด';
      }
      const valLower = String(this.value.status).trim().toLowerCase();
      const status = this.statuses.find(s =>
        (s.nameEn && s.nameEn.toLowerCase() === valLower) ||
        String(s._id) === this.value.status ||
        (s.name && s.name.toLowerCase() === valLower) ||
        (s.code && s.code.toLowerCase() === valLower)
      );
      if (status) {
        return status.name;
      }
      if (valLower.includes('newstudent') || valLower.includes('new_student') || valLower.includes('ผู้เรียนใหม่')) {
        return this.$i18n.locale === 'en' ? 'NewStudent' : 'ผู้เรียนใหม่';
      }
      if (valLower.includes('oldstudent') || valLower.includes('old_student') || valLower.includes('ผู้เรียนเก่า')) {
        return this.$i18n.locale === 'en' ? 'OldStudent' : 'ผู้เรียนเก่า';
      }
      return this.value.status;
    }
  },
  methods: {
    updateFilter(key, val) {
      const newFilters = { ...this.value, [key]: val };
      this.$emit('input', newFilters);
    }
  }
}
</script>

<style scoped>
.admin-filter-card {
  position: relative !important;
  z-index: 5 !important; /* Above table, below modals */
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

.search-field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  height: 42px;
  padding: 0 12px;
  transition: all 0.2s;
}

.search-field-wrapper:focus-within {
  border-color: #321fdb;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(50, 31, 219, 0.1);
}

.search-icon-fixed {
  color: #8c98a9;
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.custom-input-plain {
  flex-grow: 1;
}

::v-deep .custom-input-plain .form-group {
  margin-bottom: 0 !important;
}

::v-deep .custom-input-plain .form-control {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  height: auto !important;
  font-size: 0.9rem;
  color: #2c3e50;
  box-shadow: none !important;
}

.filter-select-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 42px;
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #44546d;
  transition: all 0.2s;
  outline: none !important;
}

.filter-select-btn:hover {
  background-color: #f1f3f5;
  border-color: #cbd5e0;
}

.filter-icon-small {
  width: 14px;
  height: 14px;
  color: #8a93a2;
}

.btn-primary-premium {
  background-color: #321fdb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  height: 42px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(50, 31, 219, 0.2);
}

.btn-primary-premium:hover {
  background-color: #2c1bbd;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(50, 31, 219, 0.3);
}

.btn-export-soft {
  background-color: #f0f2f5;
  color: #4f5d73;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  height: 42px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-export-soft:hover {
  background-color: #e4e7eb;
  color: #2c3e50;
}

::v-deep .dropdown-menu {
  border-radius: 10px !important;
  border: 1px solid #eef0f3 !important;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2) !important;
  padding: 8px !important;
  min-width: 180px !important;
  z-index: 1000 !important; /* Above table, below modals */
  transform: none !important; /* Prevent CoreUI from shifting it weirdly */
  top: 100% !important;
  left: 0 !important;
}
</style>
