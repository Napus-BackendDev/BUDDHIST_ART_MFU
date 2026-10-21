<template>
  <div class="system-settings-page">
    <!-- Header Hero -->
    <HeaderHero 
      :title="locale === 'en' ? 'System Settings' : 'ตั้งค่าระบบ'" 
      :description="locale === 'en' ? 'Manage system groups, workflow statuses, and artwork categories from one unified dashboard.' : 'จัดการกลุ่ม สถานะการทำงาน และหมวดหมู่ผลงานศิลปะจากหน้าเดียว'" 
      icon="cil-settings" 
      themeColor="red" 
      :showCreateButton="false" 
    />


    <!-- Main Workspace Container -->
    <CCard class="settings-shell border-0 mb-4">
      <!-- Tabs Navigation -->
      <div class="settings-nav-header">
        <div class="tab-pill-group" role="tablist">
          <button 
            type="button" 
            class="tab-pill-btn" 
            :class="{ active: activeTab === 'groups' }" 
            role="tab" 
            :aria-selected="activeTab === 'groups'" 
            @click="activeTab = 'groups'"
          >
            <CIcon name="cil-layers" class="mr-2" />
            <span>{{ locale === 'en' ? 'Groups & Workflow Statuses' : 'กลุ่มและสถานะการทำงาน' }}</span>
            <span class="tab-count-badge">{{ groups.length }}</span>
          </button>
          <button 
            type="button" 
            class="tab-pill-btn" 
            :class="{ active: activeTab === 'categories' }" 
            role="tab" 
            :aria-selected="activeTab === 'categories'" 
            @click="activeTab = 'categories'"
          >
            <CIcon name="cil-paint" class="mr-2" />
            <span>{{ locale === 'en' ? 'Artwork Categories' : 'หมวดหมู่ผลงานศิลปะ' }}</span>
            <span class="tab-count-badge">{{ categories.length }}</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="settings-loading p-4" aria-live="polite">
        <div class="skeleton-line wide"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="settings-error m-4" role="alert">
        <CIcon name="cil-warning" class="mr-2" />
        {{ loadError }}
        <CButton color="light" size="sm" class="ml-3 font-weight-bold" @click="loadAll">
          {{ locale === 'en' ? 'Retry' : 'ลองใหม่' }}
        </CButton>
      </div>

      <!-- Tab Content Area -->
      <template v-else>
        <!-- TAB 1: Groups & Statuses Workspace -->
        <div v-if="activeTab === 'groups'" class="group-workspace">
          <!-- Left Pane: Groups -->
          <section class="group-pane" aria-labelledby="groups-heading">
            <div class="pane-heading">
              <div>
                <h2 id="groups-heading" class="pane-title">{{ locale === 'en' ? 'Groups' : 'กลุ่มการทำงาน' }}</h2>
                <span class="pane-subtitle">{{ groups.length }} {{ locale === 'en' ? 'groups' : 'รายการ' }}</span>
              </div>
              <CButton class="btn-action-primary-sm" @click="openCreate('group')">
                <CIcon name="cil-plus" class="mr-1" />
                {{ locale === 'en' ? 'Add Group' : 'เพิ่มกลุ่ม' }}
              </CButton>
            </div>

            <!-- Search Groups -->
            <div class="custom-search-wrap">
              <CIcon name="cilMagnifyingGlass" class="search-icon" />
              <input 
                v-model="groupSearch" 
                class="search-input"
                :placeholder="locale === 'en' ? 'Search groups...' : 'ค้นหากลุ่ม...'" 
                :aria-label="locale === 'en' ? 'Search groups' : 'ค้นหากลุ่ม'" 
              />
            </div>

            <!-- Groups List -->
            <div v-if="filteredGroups.length" class="group-list" role="listbox" :aria-label="locale === 'en' ? 'Groups' : 'รายการกลุ่ม'">
              <div 
                v-for="group in filteredGroups" 
                :key="group._id" 
                class="group-item" 
                :class="{ selected: selectedGroupId === group._id }" 
                role="option" 
                tabindex="0" 
                :aria-selected="selectedGroupId === group._id" 
                @click="selectedGroupId = group._id" 
                @keydown.enter="selectedGroupId = group._id" 
                @keydown.space.prevent="selectedGroupId = group._id"
              >
                <div class="group-icon-badge">
                  <CIcon name="cil-folder" />
                </div>
                <div class="group-copy">
                  <div class="group-title">{{ displayName(group) }}</div>
                  <div class="group-meta">
                    <span class="code-tag">{{ group.code || '—' }}</span>
                    <span class="status-counter-tag">{{ groupStatusCount(group._id) }} {{ locale === 'en' ? 'statuses' : 'สถานะ' }}</span>
                  </div>
                </div>
                <div class="group-actions">
                  <button 
                    type="button" 
                    class="action-btn icon-edit" 
                    :title="locale === 'en' ? 'Edit group' : 'แก้ไขกลุ่ม'" 
                    @click.stop="openEdit('group', group)"
                  >
                    <CIcon name="cil-pencil" />
                  </button>
                  <button 
                    type="button" 
                    class="action-btn icon-trash ml-1" 
                    :title="locale === 'en' ? 'Delete group' : 'ลบกลุ่ม'" 
                    @click.stop="askDelete('group', group)"
                  >
                    <CIcon name="cil-trash" />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <CIcon name="cil-folder-open" class="empty-icon" />
              <p class="empty-text">{{ locale === 'en' ? 'No groups found.' : 'ไม่พบกลุ่ม' }}</p>
            </div>
          </section>

          <!-- Right Pane: Statuses in Selected Group -->
          <section class="status-pane" aria-labelledby="statuses-heading">
            <div class="pane-heading">
              <div>
                <h2 id="statuses-heading" class="pane-title">
                  {{ selectedGroup ? displayName(selectedGroup) : (locale === 'en' ? 'Statuses' : 'สถานะ') }}
                </h2>
                <span class="pane-subtitle">
                  {{ selectedGroup ? (locale === 'en' ? 'Workflow statuses belonging to this group' : 'สถานะการทำงานภายในกลุ่มนี้') : (locale === 'en' ? 'Select a group to begin' : 'เลือกกลุ่มจากด้านซ้ายเพื่อดูสถานะ') }}
                </span>
              </div>
              <CButton v-if="selectedGroup" class="btn-action-primary-sm" @click="openCreate('status')">
                <CIcon name="cil-plus" class="mr-1" />
                {{ locale === 'en' ? 'Add Status' : 'เพิ่มสถานะ' }}
              </CButton>
            </div>

            <div v-if="selectedGroup" class="custom-search-wrap">
              <CIcon name="cilMagnifyingGlass" class="search-icon" />
              <input 
                v-model="statusSearch" 
                class="search-input"
                :placeholder="locale === 'en' ? 'Search statuses in this group...' : 'ค้นหาสถานะในกลุ่มนี้...'" 
                :aria-label="locale === 'en' ? 'Search statuses' : 'ค้นหาสถานะ'" 
              />
            </div>

            <!-- Status List -->
            <div v-if="selectedGroup && filteredStatuses.length" class="status-list">
              <div v-for="status in filteredStatuses" :key="status._id" class="status-row">
                <div class="status-indicator-dot" :class="getStatusDotClass(status)"></div>
                <div class="status-copy">
                  <div class="d-flex align-items-center flex-wrap">
                    <span class="status-name mr-2">{{ displayName(status) }}</span>
                    <span class="code-tag">{{ status.code || '—' }}</span>
                  </div>
                  <small v-if="descriptionName(status)" class="status-desc">{{ descriptionName(status) }}</small>
                </div>
                <div class="row-actions">
                  <button 
                    type="button" 
                    class="action-btn icon-edit" 
                    :title="locale === 'en' ? 'Edit status' : 'แก้ไขสถานะ'" 
                    @click="openEdit('status', status)"
                  >
                    <CIcon name="cil-pencil" />
                  </button>
                  <button 
                    type="button" 
                    class="action-btn icon-trash ml-1" 
                    :title="locale === 'en' ? 'Delete status' : 'ลบสถานะ'" 
                    @click="askDelete('status', status)"
                  >
                    <CIcon name="cil-trash" />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <CIcon name="cil-task" class="empty-icon" />
              <p class="empty-text">
                {{ selectedGroup ? (locale === 'en' ? 'No statuses in this group yet.' : 'กลุ่มนี้ยังไม่มีรายการสถานะ') : (locale === 'en' ? 'Choose a group on the left.' : 'กรุณาเลือกกลุ่มจากด้านซ้าย') }}
              </p>
              <CButton v-if="selectedGroup" class="btn-action-primary-sm" @click="openCreate('status')">
                <CIcon name="cil-plus" class="mr-1" />
                {{ locale === 'en' ? 'Create first status' : 'สร้างสถานะแรก' }}
              </CButton>
            </div>
          </section>
        </div>

        <!-- TAB 2: Artwork Categories Workspace -->
        <div v-else class="categories-workspace">
          <div class="pane-heading categories-heading">
            <div>
              <h2 class="pane-title">{{ locale === 'en' ? 'Artwork Categories' : 'หมวดหมู่ผลงานศิลปะ' }}</h2>
              <span class="pane-subtitle">{{ locale === 'en' ? 'Category names are displayed on public catalogues and filters.' : 'ชื่อหมวดหมู่นี้จะแสดงในแคตตาล็อกผลงานและตัวกรองสำหรับประชาชน' }}</span>
            </div>
            <CButton class="btn-action-primary-sm" @click="openCreate('category')">
              <CIcon name="cil-plus" class="mr-1" />
              {{ locale === 'en' ? 'Add Category' : 'เพิ่มหมวดหมู่' }}
            </CButton>
          </div>

          <!-- Search Category -->
          <div class="custom-search-wrap category-search mb-3">
            <CIcon name="cilMagnifyingGlass" class="search-icon" />
            <input 
              v-model="categorySearch" 
              class="search-input"
              :placeholder="locale === 'en' ? 'Search categories by Thai, English or code...' : 'ค้นหาตามชื่อไทย, อังกฤษ หรือรหัส...'" 
              :aria-label="locale === 'en' ? 'Search categories' : 'ค้นหาหมวดหมู่'" 
            />
          </div>

          <!-- Category Data Table -->
          <div v-if="filteredCategories.length" class="category-table-card">
            <table class="table custom-table mb-0">
              <thead>
                <tr>
                  <th style="width: 32%;">{{ locale === 'en' ? 'Thai Name' : 'ชื่อภาษาไทย' }}</th>
                  <th style="width: 32%;">{{ locale === 'en' ? 'English Name' : 'ชื่อภาษาอังกฤษ' }}</th>
                  <th style="width: 22%;">{{ locale === 'en' ? 'Code' : 'รหัสระบบ' }}</th>
                  <th class="text-right" style="width: 14%;">{{ locale === 'en' ? 'Actions' : 'การจัดการ' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in filteredCategories" :key="category._id">
                  <td>
                    <div class="font-weight-bold text-dark-blue">{{ nameFor(category, 'th') || '—' }}</div>
                  </td>
                  <td>
                    <div class="text-muted-dark">{{ nameFor(category, 'en') || '—' }}</div>
                  </td>
                  <td>
                    <span class="code-badge-pill">{{ category.code || '—' }}</span>
                  </td>
                  <td class="text-right">
                    <button 
                      type="button" 
                      class="action-btn icon-edit" 
                      :title="locale === 'en' ? 'Edit category' : 'แก้ไขหมวดหมู่'" 
                      @click="openEdit('category', category)"
                    >
                      <CIcon name="cil-pencil" size="lg" />
                    </button>
                    <button 
                      type="button" 
                      class="action-btn icon-trash ml-2" 
                      :title="locale === 'en' ? 'Delete category' : 'ลบหมวดหมู่'" 
                      @click="askDelete('category', category)"
                    >
                      <CIcon name="cil-trash" size="lg" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <CIcon name="cil-paint" class="empty-icon" />
            <p class="empty-text">{{ locale === 'en' ? 'No categories found.' : 'ไม่พบหมวดหมู่ผลงาน' }}</p>
          </div>
        </div>
      </template>
    </CCard>

    <!-- Create / Edit Form Modal -->
    <CModal :show.sync="formModal" :title="modalTitle" centered class="admin-modal" size="lg">
      <div class="modal-form p-3">
        <div v-if="formError" class="inline-error mb-3" role="alert">
          <CIcon name="cil-warning" class="mr-2" />
          {{ formError }}
        </div>

        <div v-if="formType === 'status'" class="form-group mb-3">
          <label for="settings-workflow-group" class="form-label-custom">{{ locale === 'en' ? 'Workflow Group' : 'กลุ่มการทำงาน' }} <span class="required">*</span></label>
          <select id="settings-workflow-group" v-model="form.group" class="form-control custom-select-field">
            <option value="" disabled>{{ locale === 'en' ? 'Select workflow group' : 'เลือกกลุ่มการทำงาน' }}</option>
            <option v-for="group in groups" :key="group._id" :value="group._id">{{ displayName(group) }}</option>
          </select>
        </div>

        <div v-if="editingId" class="readonly-code-box mb-3">
          <span class="code-label">CODE:</span>
          <span class="code-badge-pill">{{ editingCode }}</span>
          <small class="text-muted ml-2">{{ locale === 'en' ? '(System identity cannot be modified)' : '(รหัสระบบไม่สามารถแก้ไขได้)' }}</small>
        </div>

        <div class="row">
          <div class="col-md-6 form-group mb-3">
            <label for="settings-name-th" class="form-label-custom">{{ locale === 'en' ? 'Thai Name' : 'ชื่อภาษาไทย' }} <span class="required">*</span></label>
            <input id="settings-name-th"
              v-model.trim="form.title.th" 
              class="form-control custom-input-field" 
              :class="{ 'is-invalid': touched && !form.title.th }" 
              @blur="touched = true" 
              :placeholder="locale === 'en' ? 'e.g. ภาพจิตรกรรม' : 'เช่น ภาพจิตรกรรม'"
            />
            <small v-if="touched && !form.title.th" class="field-error">{{ locale === 'en' ? 'Thai name is required.' : 'กรุณาระบุชื่อภาษาไทย' }}</small>
          </div>
          <div class="col-md-6 form-group mb-3">
            <label for="settings-name-en" class="form-label-custom">{{ locale === 'en' ? 'English Name' : 'ชื่อภาษาอังกฤษ' }} <span class="required">*</span></label>
            <input id="settings-name-en"
              v-model.trim="form.title.en" 
              class="form-control custom-input-field" 
              :class="{ 'is-invalid': touched && !form.title.en }" 
              @blur="touched = true" 
              :placeholder="locale === 'en' ? 'e.g. Painting' : 'เช่น Painting'"
            />
            <small v-if="touched && !form.title.en" class="field-error">{{ locale === 'en' ? 'English name is required.' : 'กรุณาระบุชื่อภาษาอังกฤษ' }}</small>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 form-group mb-3">
            <label for="settings-description-th" class="form-label-custom">{{ locale === 'en' ? 'Thai Description' : 'คำอธิบายภาษาไทย' }}</label>
            <textarea id="settings-description-th"
              v-model.trim="form.description.th" 
              class="form-control custom-textarea-field" 
              rows="3"
              :placeholder="locale === 'en' ? 'Optional description...' : 'คำอธิบายเพิ่มเติม (ไม่บังคับ)...'"
            ></textarea>
          </div>
          <div class="col-md-6 form-group mb-3">
            <label for="settings-description-en" class="form-label-custom">{{ locale === 'en' ? 'English Description' : 'คำอธิบายภาษาอังกฤษ' }}</label>
            <textarea id="settings-description-en"
              v-model.trim="form.description.en" 
              class="form-control custom-textarea-field" 
              rows="3"
              :placeholder="locale === 'en' ? 'Optional description...' : 'คำอธิบายเพิ่มเติม (ไม่บังคับ)...'"
            ></textarea>
          </div>
        </div>
      </div>

      <template #footer>
        <CButton color="secondary" variant="outline" class="px-4 font-weight-bold" :disabled="saving" @click="formModal = false">
          {{ locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton 
          color="primary" 
          class="px-4 font-weight-bold btn-save-primary" 
          :disabled="saving || !form.title.th || !form.title.en || (formType === 'status' && !form.group)" 
          @click="saveForm"
        >
          <CIcon v-if="saving" name="cil-reload" class="mr-2 spinner-animation" />
          {{ saving ? (locale === 'en' ? 'Saving...' : 'กำลังบันทึก...') : (locale === 'en' ? 'Save Changes' : 'บันทึกข้อมูล') }}
        </CButton>
      </template>
    </CModal>

    <!-- Delete Confirmation Modal -->
    <CModal :show.sync="deleteModal" :title="locale === 'en' ? 'Delete Setting Item' : 'ยืนยันการลบข้อมูลตั้งค่า'" centered class="admin-modal" color="danger">
      <div class="delete-dialog p-3">
        <div class="delete-warning-banner mb-3">
          <CIcon name="cil-warning" class="warning-icon mr-2" />
          <div>
            <strong>{{ locale === 'en' ? 'Please review before deleting.' : 'กรุณาตรวจสอบก่อนลบข้อมูล' }}</strong>
            <p class="m-0">{{ locale === 'en' ? 'This action cannot be undone.' : 'การดำเนินการนี้ไม่สามารถย้อนกลับได้' }}</p>
          </div>
        </div>

        <p class="mb-3">
          {{ locale === 'en' ? 'You are deleting:' : 'คุณกำลังจะลบรายการ:' }} 
          <strong class="text-danger">{{ deleteItem ? displayName(deleteItem) : '' }}</strong>
        </p>

        <div v-if="impact && impact.totalReferences" class="impact-box mb-3">
          <strong>{{ impact.totalReferences }} {{ locale === 'en' ? 'references will be affected:' : 'รายการที่ใช้อ้างอิงอยู่จะได้รับผลกระทบ:' }}</strong>
          <ul class="mt-2 mb-0">
            <li v-for="item in impact.references" :key="item.collection + item.field">
              {{ item.count }} · {{ item.collection }} · {{ item.field }}
            </li>
          </ul>
        </div>

        <div v-if="impact && impact.protected" class="inline-error mb-3">
          {{ locale === 'en' ? 'Core system statuses cannot be deleted. You may edit their names instead.' : 'ไม่สามารถลบสถานะหลักของระบบได้ คุณสามารถแก้ไขชื่อแทนได้' }}
        </div>

        <div v-if="impact && impact.requiresReplacement && !impact.protected" class="form-group mb-3">
          <label for="settings-replacement" class="form-label-custom">{{ locale === 'en' ? 'Move references to replacement' : 'ย้ายรายการอ้างอิงไปยังรายการใหม่' }} <span class="required">*</span></label>
          <select id="settings-replacement" v-model="replacementId" class="form-control custom-select-field">
            <option value="" disabled>{{ locale === 'en' ? 'Select replacement item' : 'เลือกข้อมูลทดแทน' }}</option>
            <option v-for="item in replacementOptions" :key="item._id" :value="item._id">{{ displayName(item) }}</option>
          </select>
        </div>
      </div>

      <template #footer>
        <CButton color="secondary" variant="outline" class="px-4 font-weight-bold" :disabled="deleting" @click="deleteModal = false">
          {{ locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton 
          color="danger" 
          class="px-4 font-weight-bold" 
          :disabled="deleting || (impact && impact.protected) || (impact && impact.requiresReplacement && !replacementId)" 
          @click="confirmDelete"
        >
          <CIcon v-if="deleting" name="cil-reload" class="mr-2 spinner-animation" />
          {{ deleting ? (locale === 'en' ? 'Deleting...' : 'กำลังลบ...') : (locale === 'en' ? 'Delete Permanently' : 'ยืนยันการลบ') }}
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import Service from '@/service/api.js';
import HeaderHero from './components/HeaderHero.vue';

const localized = value => {
  const list = Array.isArray(value) ? value : [];
  return { 
    th: (list.find(item => item.key === 'th') || {}).value || '', 
    en: (list.find(item => item.key === 'en') || {}).value || '' 
  };
};

export default {
  name: 'SystemSettings',
  components: {
    HeaderHero
  },
  data() { 
    return { 
      activeTab: 'groups', 
      groups: [], 
      statuses: [], 
      categories: [], 
      selectedGroupId: '', 
      groupSearch: '', 
      statusSearch: '', 
      categorySearch: '', 
      loading: true, 
      loadError: '', 
      formModal: false, 
      formType: '', 
      editingId: '', 
      editingCode: '', 
      formError: '', 
      saving: false, 
      touched: false, 
      form: this.emptyForm(), 
      deleteModal: false, 
      deleteType: '', 
      deleteItem: null, 
      impact: null, 
      replacementId: '', 
      deleting: false 
    }; 
  },
  computed: {
    locale() { return this.$i18n.locale === 'en' ? 'en' : 'th'; },
    selectedGroup() { return this.groups.find(item => item._id === this.selectedGroupId) || null; },
    filteredGroups() { 
      const q = this.groupSearch.toLowerCase(); 
      return this.groups.filter(item => this.matchesSearch(item, q));
    },
    filteredStatuses() { 
      const q = this.statusSearch.toLowerCase(); 
      return this.statuses.filter(item => String(item.group && item.group._id || item.group) === String(this.selectedGroupId)).filter(item => this.matchesSearch(item, q));
    },
    filteredCategories() { 
      const q = this.categorySearch.toLowerCase(); 
      return this.categories.filter(item => this.matchesSearch(item, q));
    },
    modalTitle() { 
      const names = { group: ['Group', 'กลุ่มการทำงาน'], status: ['Status', 'สถานะการทำงาน'], category: ['Category', 'หมวดหมู่ผลงาน'] }; 
      const name = names[this.formType] || names.group; 
      return this.editingId ? (this.locale === 'en' ? `Edit ${name[0]}` : `แก้ไข${name[1]}`) : (this.locale === 'en' ? `Add ${name[0]}` : `เพิ่ม${name[1]}`); 
    },
    replacementOptions() { 
      const list = this.deleteType === 'group' ? this.groups : this.deleteType === 'status' ? this.statuses : this.categories; 
      return list.filter(item => !this.deleteItem || item._id !== this.deleteItem._id).filter(item => this.deleteType !== 'status' || String(item.group && item.group._id || item.group) === String(this.deleteItem && this.deleteItem.group && (this.deleteItem.group._id || this.deleteItem.group))); 
    }
  },
  created() { 
    this.loadAll(); 
  },
  methods: {
    matchesSearch(item, query) {
      return [item.code, this.nameFor(item, 'th'), this.nameFor(item, 'en')].some(value => String(value || '').toLowerCase().includes(query));
    },
    emptyForm() { 
      return { title: { th: '', en: '' }, description: { th: '', en: '' }, group: '' }; 
    },
    displayName(item) { 
      return this.nameFor(item, this.locale) || this.nameFor(item, this.locale === 'en' ? 'th' : 'en') || '—'; 
    },
    nameFor(item, key) { 
      const list = item && (item.title || item.name); 
      if (typeof list === 'string') return list; 
      return localized(list)[key]; 
    },
    descriptionName(item) { 
      return localized(item && item.description)[this.locale]; 
    },
    groupStatusCount(id) { 
      return this.statuses.filter(item => String(item.group && item.group._id || item.group) === String(id)).length; 
    },
    getStatusDotClass(status) {
      const code = String(status.code || '').toUpperCase();
      if (code.includes('APPROV') || code.includes('PASS') || code.includes('SUCCESS') || code.includes('COMPLETE')) return 'dot-green';
      if (code.includes('REJECT') || code.includes('FAIL') || code.includes('CANCEL')) return 'dot-red';
      if (code.includes('PENDING') || code.includes('WAIT')) return 'dot-orange';
      return 'dot-blue';
    },
    async loadAll() { 
      this.loading = true; 
      this.loadError = ''; 
      try { 
        const results = await Promise.all([
          this.$store.dispatch('setting/groups/get'), 
          this.$store.dispatch('setting/status/get'), 
          this.$store.dispatch('artwork/category', { method: 'get' })
        ]); 
        this.groups = results[0] || []; 
        this.statuses = results[1] || []; 
        this.categories = results[2] || []; 
        if (!this.selectedGroupId || !this.groups.some(item => item._id === this.selectedGroupId)) {
          this.selectedGroupId = this.groups[0] ? this.groups[0]._id : ''; 
        }
      } catch (error) { 
        this.loadError = this.locale === 'en' ? 'Unable to load settings. Please try again.' : 'โหลดข้อมูลตั้งค่าไม่สำเร็จ กรุณาลองใหม่'; 
      } finally { 
        this.loading = false; 
      } 
    },
    openCreate(type) { 
      this.formType = type; 
      this.editingId = ''; 
      this.editingCode = ''; 
      this.form = this.emptyForm(); 
      this.form.group = type === 'status' ? this.selectedGroupId : ''; 
      this.formError = ''; 
      this.touched = false; 
      this.formModal = true; 
    },
    openEdit(type, item) { 
      this.formType = type; 
      this.editingId = item._id; 
      this.editingCode = item.code || ''; 
      this.form = { 
        title: localized(item.title), 
        description: localized(item.description), 
        group: item.group && item.group._id || item.group || '' 
      }; 
      this.formError = ''; 
      this.touched = false; 
      this.formModal = true; 
    },
    payload() { 
      const payload = { 
        title: [{ key: 'th', value: this.form.title.th }, { key: 'en', value: this.form.title.en }], 
        description: [{ key: 'th', value: this.form.description.th }, { key: 'en', value: this.form.description.en }] 
      }; 
      if (this.editingId) payload._id = this.editingId; 
      if (this.formType === 'status') payload.group = this.form.group; 
      return payload; 
    },
    async saveForm() { 
      this.touched = true; 
      if (!this.form.title.th || !this.form.title.en || (this.formType === 'status' && !this.form.group)) return; 
      this.saving = true; 
      this.formError = ''; 
      try { 
        const payload = this.payload(); 
        if (this.formType === 'group') await Service.settings(this.editingId ? 'put' : 'post', 'group', payload); 
        else if (this.formType === 'status') await Service.settings(this.editingId ? 'put' : 'post', 'status', payload); 
        else await Service.categorySettings(this.editingId ? 'put' : 'post', payload); 
        this.formModal = false; 
        this.toast(this.locale === 'en' ? 'Saved successfully.' : 'บันทึกข้อมูลเรียบร้อยแล้ว', 'success'); 
        await this.loadAll(); 
      } catch (error) { 
        this.formError = this.errorMessage(error); 
      } finally { 
        this.saving = false; 
      } 
    },
    async askDelete(type, item) { 
      this.deleteType = type; 
      this.deleteItem = item; 
      this.replacementId = ''; 
      this.impact = null; 
      try { 
        const response = type === 'category' ? await Service.categorySettings('impact', { id: item._id }) : await Service.settings('impact', type, { id: item._id }); 
        this.impact = response.data.data; 
        this.deleteModal = true; 
      } catch (error) { 
        this.toast(this.errorMessage(error), 'danger'); 
      } 
    },
    async confirmDelete() { 
      if (!this.deleteItem || (this.impact && this.impact.protected) || (this.impact && this.impact.requiresReplacement && !this.replacementId)) return; 
      this.deleting = true; 
      try { 
        const payload = { id: this.deleteItem._id }; 
        if (this.replacementId) payload.replacementId = this.replacementId; 
        if (this.deleteType === 'category') await Service.categorySettings('delete', payload); 
        else await Service.settings('delete', this.deleteType, payload); 
        this.deleteModal = false; 
        this.toast(this.locale === 'en' ? 'Deleted successfully.' : 'ลบข้อมูลเรียบร้อยแล้ว', 'success'); 
        await this.loadAll(); 
      } catch (error) { 
        this.toast(this.errorMessage(error), 'danger'); 
      } finally { 
        this.deleting = false; 
      } 
    },
    errorMessage(error) { 
      return error && error.response && error.response.data && error.response.data.message || (this.locale === 'en' ? 'Request failed. Please try again.' : 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่'); 
    },
    toast(message, variant) { 
      this.$store.commit('dialog/showToast', { 
        title: variant === 'success' ? (this.locale === 'en' ? 'Success' : 'สำเร็จ') : (this.locale === 'en' ? 'Error' : 'ผิดพลาด'), 
        message, 
        variant 
      }); 
    }
  }
};
</script>

<style scoped>
.system-settings-page {
  color: #172b4d;
}

/* KPI Widget Card Style (Identical to UserWidget / OrderWidget / ArtworkWidget) */
.widget-card {
  border-radius: 12px;
  border: 1px solid #eef0f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  height: 100%;
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
  background: #ffffff;
}

.widget-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.active-widget {
  border-color: #321fdb !important;
  background-color: #f0f4ff !important;
  box-shadow: 0 6px 16px rgba(50, 31, 219, 0.1) !important;
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

/* Standard Widget Color Tokens */
.bg-blue-light { background-color: #f0f4ff; }
.text-blue { color: #321fdb; }

.bg-info-soft { background-color: #e0faff; }
.text-info { color: #00b8d9 !important; }

.bg-green-light { background-color: #ebfcf1; }
.text-green { color: #10b981; }

.bg-yellow-light { background-color: #fffbeb; }
.text-warning { color: #d97706 !important; }

.text-primary { color: #321fdb !important; }
.text-success { color: #10b981 !important; }

/* Main Shell & Tab Header */
.settings-shell {
  background: #ffffff;
  border: 1px solid #eef0f3 !important;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.settings-nav-header {
  padding: 16px 20px 0;
  border-bottom: 1px solid #f0f1f5;
  background: #fafbfc;
}

.tab-pill-group {
  display: flex;
  gap: 8px;
}

.tab-pill-btn {
  border: none;
  background: transparent;
  padding: 12px 20px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #64748b;
  border-bottom: 3px solid transparent;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill-btn:hover {
  color: #8c1515;
  background: rgba(255, 255, 255, 0.8);
}

.tab-pill-btn.active {
  color: #8c1515;
  border-bottom-color: #8c1515;
  background: #ffffff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.tab-count-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 800;
  border-radius: 50px;
  background: #f1f5f9;
  color: #475569;
}

.tab-pill-btn.active .tab-count-badge {
  background: #fff1f0;
  color: #8c1515;
}

/* Pane Headings */
.pane-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.pane-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #172b4d;
  margin: 0 0 2px;
}

.pane-subtitle {
  font-size: 0.82rem;
  color: #64748b;
}

.btn-action-primary-sm {
  background: #8c1515 !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 700 !important;
  font-size: 0.82rem !important;
  border-radius: 50px !important;
  padding: 0.45rem 1rem !important;
  display: inline-flex !important;
  align-items: center !important;
  box-shadow: 0 2px 6px rgba(140, 21, 21, 0.2) !important;
  transition: all 0.2s ease !important;
}

.btn-action-primary-sm:hover {
  background: #6e1010 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(140, 21, 21, 0.3) !important;
}

/* Custom Search Box */
.custom-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.custom-search-wrap:focus-within {
  background: #ffffff;
  border-color: #8c1515;
  box-shadow: 0 0 0 3px rgba(140, 21, 21, 0.08);
}

.search-icon {
  color: #94a3b8;
  width: 16px;
  height: 16px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.88rem;
  color: #1e293b;
}

/* Workspaces */
.group-workspace {
  display: grid;
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.45fr);
  min-height: 520px;
}

.group-pane {
  border-right: 1px solid #f0f1f5;
  padding: 24px;
  background: #ffffff;
}

.status-pane {
  padding: 24px;
  background: #fafbfc;
}

.categories-workspace {
  padding: 24px;
  background: #ffffff;
}

/* Group List */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 12px 14px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.group-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateX(2px);
}

.group-item.selected {
  border-color: #8c1515 !important;
  border-left-width: 4px !important;
  background: #fffaf9 !important;
  box-shadow: 0 4px 12px rgba(140, 21, 21, 0.06);
}

.group-icon-badge {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #8c1515;
  background: #fff1f0;
  flex: 0 0 36px;
}

.group-item.selected .group-icon-badge {
  background: #8c1515;
  color: #ffffff;
}

.group-copy {
  min-width: 0;
  flex: 1;
}

.group-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.code-tag {
  font-family: var(--app-font-family);
  font-size: 0.72rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.status-counter-tag {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
}

.group-actions {
  display: flex;
  align-items: center;
}

/* Status Rows */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #eef0f3;
  border-radius: 10px;
  padding: 14px 18px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.status-row:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.status-indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex: 0 0 12px;
}

.dot-green { background: #10b981; box-shadow: 0 0 0 4px #ecfdf5; }
.dot-red { background: #ef4444; box-shadow: 0 0 0 4px #fef2f2; }
.dot-orange { background: #f59e0b; box-shadow: 0 0 0 4px #fffbeb; }
.dot-blue { background: #3b82f6; box-shadow: 0 0 0 4px #eff6ff; }

.status-copy {
  flex: 1;
  min-width: 0;
}

.status-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.status-desc {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
}

.row-actions {
  display: flex;
  align-items: center;
}

/* Category Table */
.category-search {
  max-width: 450px;
}

.category-table-card {
  border: 1px solid #eef0f3;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.text-dark-blue {
  color: #172b4d !important;
}

.text-muted-dark {
  color: #4a5568 !important;
  font-size: 0.9rem;
}

.code-badge-pill {
  font-family: var(--app-font-family);
  font-size: 0.78rem;
  font-weight: 700;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

/* Empty State */
.empty-state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-align: center;
  padding: 32px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #64748b;
}

/* Form Styles */
.form-label-custom {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-weight: 700;
  font-size: 0.85rem;
}

.required {
  color: #e53e3e;
}

.custom-input-field,
.custom-select-field,
.custom-textarea-field {
  border: 1px solid #d8dee8;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  transition: all 0.2s ease;
}

.custom-input-field:focus,
.custom-select-field:focus,
.custom-textarea-field:focus {
  border-color: #8c1515;
  box-shadow: 0 0 0 3px rgba(140, 21, 21, 0.1);
  background: #ffffff;
}

.readonly-code-box {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.code-label {
  font-weight: 800;
  font-size: 0.78rem;
  color: #64748b;
  margin-right: 8px;
}

.btn-save-primary {
  background-color: #8c1515 !important;
  border-color: #8c1515 !important;
}

.btn-save-primary:hover {
  background-color: #6e1010 !important;
  border-color: #6e1010 !important;
}

/* Errors and Warnings */
.inline-error {
  padding: 12px 14px;
  border-radius: 8px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  font-size: 0.88rem;
  font-weight: 600;
}

.field-error {
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 4px;
  display: block;
}

.delete-warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  color: #991b1b;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
}

.warning-icon {
  width: 24px;
  height: 24px;
  color: #dc2626;
  flex: 0 0 24px;
}

.impact-box {
  padding: 14px;
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
  border-radius: 8px;
}

.impact-box ul {
  padding-left: 20px;
  color: #78350f;
  font-size: 0.84rem;
}

/* Skeletons & Animation */
.settings-loading .skeleton-line {
  height: 18px;
  width: 70%;
  margin: 16px 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #ffffff 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: skeleton 1.2s infinite;
}

.settings-loading .skeleton-line.wide {
  width: 90%;
  height: 32px;
}

.spinner-animation {
  animation: spin 1s linear infinite;
}

@keyframes skeleton {
  to { background-position: -200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .group-workspace {
    grid-template-columns: 1fr;
  }
  .group-pane {
    border-right: none;
    border-bottom: 1px solid #f0f1f5;
  }
}
</style>
