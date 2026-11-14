<template>
  <div class="roles-management-page">
    <HeaderHero
      :title="locale === 'en' ? 'Roles & Permissions' : 'จัดการบทบาทและสิทธิ์การเข้าถึง'"
      :description="locale === 'en'
        ? 'Manage access permissions across every Admin page in a single comparison matrix.'
        : 'กำหนดและเปรียบเทียบสิทธิ์การเข้าถึงทุกเมนูหลังบ้านของแต่ละบทบาทในตารางเดียว'"
      :createButtonText="locale === 'en' ? 'Create Role' : 'สร้างบทบาทใหม่'"
      icon="cil-shield-alt"
      themeColor="red"
      :showCreateButton="canEditRoles"
      @create="openCreateModal"
    />

    <div v-if="!canEditRoles" class="view-only-banner mb-3" role="note">
      <CIcon name="cil-lock-locked" class="mr-2" />
      <span>
        {{ locale === 'en'
          ? 'View-Only access: you can inspect the permission matrix, but creating, editing, or deleting roles is disabled.'
          : 'สิทธิ์ดูอย่างเดียว (View Only): สามารถดูตารางสิทธิ์ของทุกบทบาทได้ แต่ไม่สามารถสร้าง แก้ไข หรือลบได้' }}
      </span>
    </div>

    <div v-if="statusMessage" class="alert alert-success d-flex align-items-center justify-content-between mb-3" role="status">
      <span>
        <CIcon name="cil-check" class="mr-2" />
        {{ statusMessage }}
      </span>
      <button type="button" class="close" aria-label="Close" @click="statusMessage = ''">&times;</button>
    </div>

    <div v-if="actionError" class="inline-error mb-3 d-flex align-items-center justify-content-between" role="alert">
      <span>
        <CIcon name="cil-warning" class="mr-2" />
        {{ actionError }}
      </span>
      <button type="button" class="close text-danger" aria-label="Close" @click="actionError = ''">&times;</button>
    </div>

    <!-- Single-Page Matrix Workspace -->
    <CCard class="roles-shell border-0 mb-4">
      <div v-if="loading" class="p-4">
        <div class="skeleton-line wide"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>

      <div v-else-if="loadError" class="inline-error m-4" role="alert">
        <CIcon name="cil-warning" class="mr-2" />
        {{ loadError }}
        <CButton color="light" size="sm" class="ml-3 font-weight-bold" @click="fetchData">
          {{ locale === 'en' ? 'Retry' : 'ลองใหม่' }}
        </CButton>
      </div>

      <div v-else class="p-4">
        <div class="matrix-topbar mb-3">
          <div>
            <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
              <h2 class="pane-title mb-0">
                {{ locale === 'en' ? 'Permission Matrix' : 'ตารางกำหนดสิทธิ์รายหน้า (Permission Matrix)' }}
              </h2>
              <span class="role-count-pill">
                {{ draftRoles.length }} {{ locale === 'en' ? 'roles' : 'บทบาท' }}
              </span>
            </div>
            <p class="text-muted small mb-0">
              {{ locale === 'en'
                ? 'Click None, View, or Edit directly inside any cell, then click Save Changes. Admin always remains full Edit.'
                : 'กดเลือก ปิด / ดู / แก้ไข ในตารางได้โดยตรง แล้วกด "บันทึกการเปลี่ยนแปลง" ด้านขวา (Admin ถูกล็อกแก้ไขได้ทุกหน้าเสมอ)' }}
            </p>
          </div>

          <div class="d-flex align-items-center flex-wrap gap-2">
            <div class="legend-group" aria-hidden="true">
              <span class="legend-chip level-none">{{ levelLabel('none') }}</span>
              <span class="legend-chip level-view">{{ levelLabel('view') }}</span>
              <span class="legend-chip level-edit">{{ levelLabel('edit') }}</span>
            </div>

            <template v-if="canEditRoles && dirtyRoleIds.length > 0">
              <CButton color="light" size="sm" class="font-weight-bold" :disabled="savingBatch" @click="discardChanges">
                {{ locale === 'en' ? 'Reset' : 'คืนค่าเดิม' }}
              </CButton>
              <CButton
                color="danger"
                size="sm"
                class="btn-save-primary font-weight-bold px-3"
                :disabled="savingBatch"
                @click="saveAllDirty"
              >
                <CIcon name="cil-save" size="sm" class="mr-1" />
                {{ savingBatch
                  ? (locale === 'en' ? 'Saving...' : 'กำลังบันทึก...')
                  : (locale === 'en'
                    ? `Save Changes (${dirtyRoleIds.length})`
                    : `บันทึกการเปลี่ยนแปลง (${dirtyRoleIds.length})`) }}
              </CButton>
            </template>
          </div>
        </div>

        <div class="matrix-scroll-wrap">
          <table class="single-matrix-table">
            <thead>
              <tr>
                <th class="sticky-module-col">
                  <div class="module-col-heading">
                    {{ locale === 'en' ? 'Admin Page / Module' : 'เมนู / หน้าจัดการ' }}
                  </div>
                </th>
                <th
                  v-for="role in draftRoles"
                  :key="role._id"
                  class="role-col-header"
                  :class="{
                    'is-admin-col': isAdminRole(role),
                    'is-dirty-col': isRoleDirty(role._id)
                  }"
                >
                  <div class="role-col-top">
                    <div class="role-col-title-row">
                      <span class="role-col-name">{{ roleTitleDisplay(role) }}</span>
                      <span v-if="role.isSystem" class="badge-system">
                        <CIcon name="cil-lock-locked" size="sm" class="mr-1" />
                        {{ locale === 'en' ? 'System' : 'ระบบ' }}
                      </span>
                      <span v-else class="badge-custom">
                        {{ locale === 'en' ? 'Custom' : 'กำหนดเอง' }}
                      </span>
                      <span v-if="isRoleDirty(role._id)" class="badge-dirty">
                        {{ locale === 'en' ? 'Edited' : 'รอเซฟ' }}
                      </span>
                    </div>

                    <div v-if="roleSubtitleDisplay(role)" class="role-col-sub">
                      {{ roleSubtitleDisplay(role) }}
                    </div>

                    <div v-if="canEditRoles" class="role-col-actions">
                      <template v-if="confirmDeleteId === role._id">
                        <button
                          type="button"
                          class="mini-action-btn confirm-danger"
                          :disabled="deletingId === role._id"
                          @click="confirmDeleteRole(role)"
                        >
                          {{ deletingId === role._id
                            ? (locale === 'en' ? 'Deleting...' : 'กำลังลบ...')
                            : (locale === 'en' ? 'Confirm Delete' : 'ยืนยันลบ') }}
                        </button>
                        <button
                          type="button"
                          class="mini-action-btn neutral"
                          :disabled="deletingId === role._id"
                          @click="confirmDeleteId = null"
                        >
                          {{ locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
                        </button>
                      </template>
                      <template v-else>
                        <button
                          type="button"
                          class="mini-action-btn neutral"
                          :title="locale === 'en' ? 'Edit role name & description' : 'แก้ไขชื่อและคำอธิบาย'"
                          @click="startMetaEdit(role)"
                        >
                          <CIcon name="cil-pencil" size="sm" />
                        </button>

                        <button
                          v-if="!role.isSystem"
                          type="button"
                          class="mini-action-btn danger"
                          :title="locale === 'en' ? 'Delete role' : 'ลบบทบาท'"
                          @click="confirmDeleteId = role._id"
                        >
                          <CIcon name="cil-trash" size="sm" />
                        </button>
                      </template>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tab in adminTabs" :key="tab.key">
                <th scope="row" class="sticky-module-col module-row-cell">
                  <div class="module-name">{{ locale === 'en' ? tab.en : tab.th }}</div>
                  <div class="module-desc">{{ locale === 'en' ? tab.descEn : tab.descTh }}</div>
                </th>
                <td
                  v-for="role in draftRoles"
                  :key="`${tab.key}-${role._id}`"
                  class="matrix-cell"
                  :class="{
                    'is-admin-col': isAdminRole(role),
                    'is-dirty-col': isRoleDirty(role._id)
                  }"
                >
                  <div v-if="isAdminRole(role)" class="admin-locked-pill">
                    <CIcon name="cil-lock-locked" size="sm" class="mr-1" />
                    {{ locale === 'en' ? 'Full Edit' : 'แก้ไขได้' }}
                  </div>
                  <div
                    v-else
                    class="level-selector"
                    role="radiogroup"
                    :aria-label="`${roleTitleDisplay(role)} - ${locale === 'en' ? tab.en : tab.th}`"
                  >
                    <button
                      v-for="lvl in levels"
                      :key="lvl"
                      type="button"
                      class="level-pill"
                      :class="[
                        `level-${lvl}`,
                        { active: (role.permissions[tab.key] || 'none') === lvl }
                      ]"
                      :disabled="!canEditRoles"
                      :aria-pressed="(role.permissions[tab.key] || 'none') === lvl"
                      @click="setCellPermission(role._id, tab.key, lvl)"
                    >
                      {{ shortLevelLabel(lvl) }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CCard>

    <!-- Create Role Modal -->
    <CModal
      :show.sync="showCreateModal"
      :title="locale === 'en' ? 'Create Custom Role' : 'สร้างบทบาทเจ้าหน้าที่ใหม่'"
      centered
      :fade="false"
      class="admin-modal role-form-modal"
    >
      <div v-if="createError" class="inline-error mb-3" role="alert">
        <CIcon name="cil-warning" class="mr-2" />
        {{ createError }}
      </div>
      <div class="form-group mb-3">
        <label class="form-label font-weight-bold small">
          {{ locale === 'en' ? 'Role Name (EN)' : 'ชื่อบทบาท (อังกฤษ)' }} *
        </label>
        <input
          v-model.trim="newRoleForm.titleEn"
          type="text"
          class="form-control"
          :placeholder="locale === 'en' ? 'e.g. Coordinator' : 'เช่น Coordinator'"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label font-weight-bold small">
          {{ locale === 'en' ? 'Role Name (TH)' : 'ชื่อบทบาท (ไทย)' }} *
        </label>
        <input
          v-model.trim="newRoleForm.titleTh"
          type="text"
          class="form-control"
          :placeholder="locale === 'en' ? 'e.g. ผู้ประสานงาน' : 'เช่น ผู้ประสานงาน'"
        />
      </div>
      <div class="form-group mb-3">
        <label class="form-label font-weight-bold small">
          {{ locale === 'en' ? 'Description' : 'คำอธิบายสั้นๆ' }}
        </label>
        <input
          v-model.trim="newRoleForm.desc"
          type="text"
          class="form-control"
          :placeholder="locale === 'en' ? 'Optional responsibility note' : 'ระบุหน้าที่โดยย่อ (ถ้ามี)'"
        />
      </div>
      <div class="form-group mb-1">
        <label class="form-label font-weight-bold small">
          {{ locale === 'en' ? 'Initial Access Preset' : 'สิทธิ์เริ่มต้น' }}
        </label>
        <select v-model="newRoleForm.preset" class="form-control">
          <option value="none">{{ locale === 'en' ? 'All None (Start Blank)' : 'ปิดทั้งหมด (กำหนดเองทีหลัง)' }}</option>
          <option value="submissions-view">{{ locale === 'en' ? 'Submissions View-Only' : 'ดูการส่งผลงานอย่างเดียว' }}</option>
          <option value="all-view">{{ locale === 'en' ? 'All Sections View-Only' : 'ดูได้ทุกหน้า (View Only)' }}</option>
          <option value="all-edit">{{ locale === 'en' ? 'All Sections Edit' : 'แก้ไขได้ทุกหน้า' }}</option>
        </select>
      </div>
      <template #footer>
        <CButton color="light" :disabled="creating" @click="showCreateModal = false">
          {{ locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton
          color="danger"
          class="btn-save-primary font-weight-bold px-4"
          :disabled="creating"
          @click="createNewRole"
        >
          <CIcon name="cil-plus" size="sm" class="mr-1" />
          {{ creating
            ? (locale === 'en' ? 'Creating...' : 'กำลังสร้าง...')
            : (locale === 'en' ? 'Add Role Column' : 'เพิ่มบทบาทลงตาราง') }}
        </CButton>
      </template>
    </CModal>

    <!-- Edit Role Details Modal -->
    <CModal
      :show="Boolean(editingMetaRole)"
      :title="editingMetaRole
        ? (locale === 'en'
          ? `Edit Details: ${roleTitleDisplay(editingMetaRole)}`
          : `แก้ไขชื่อ/คำอธิบาย: ${roleTitleDisplay(editingMetaRole)}`)
        : ''"
      centered
      :fade="false"
      class="admin-modal role-form-modal"
      @update:show="val => { if (!val) cancelMetaEdit() }"
    >
      <template v-if="editingMetaRole">
        <p v-if="editingMetaRole.isSystem" class="text-muted small mb-3">
          {{ locale === 'en'
            ? 'Core system English key is locked; Thai label and description can still be customized.'
            : 'ชื่อภาษาอังกฤษของบทบาทหลักถูกล็อกไว้เพื่อความปลอดภัย สามารถแก้ไขชื่อไทยและคำอธิบายได้' }}
        </p>
        <div v-if="metaError" class="inline-error mb-3" role="alert">
          <CIcon name="cil-warning" class="mr-2" />
          {{ metaError }}
        </div>
        <div class="form-group mb-3">
          <label class="form-label font-weight-bold small">{{ locale === 'en' ? 'Name (EN)' : 'ชื่อ (EN)' }}</label>
          <input
            v-model.trim="metaForm.titleEn"
            type="text"
            class="form-control"
            :disabled="editingMetaRole.isSystem"
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label font-weight-bold small">{{ locale === 'en' ? 'Name (TH)' : 'ชื่อ (TH)' }}</label>
          <input v-model.trim="metaForm.titleTh" type="text" class="form-control" />
        </div>
        <div class="form-group mb-3">
          <label class="form-label font-weight-bold small">{{ locale === 'en' ? 'Description (EN)' : 'คำอธิบาย (EN)' }}</label>
          <input v-model.trim="metaForm.descEn" type="text" class="form-control" />
        </div>
        <div class="form-group mb-1">
          <label class="form-label font-weight-bold small">{{ locale === 'en' ? 'Description (TH)' : 'คำอธิบาย (TH)' }}</label>
          <input v-model.trim="metaForm.descTh" type="text" class="form-control" />
        </div>
      </template>
      <template #footer>
        <CButton color="light" :disabled="savingMeta" @click="cancelMetaEdit">
          {{ locale === 'en' ? 'Cancel' : 'ยกเลิก' }}
        </CButton>
        <CButton
          color="danger"
          class="btn-save-primary font-weight-bold px-3"
          :disabled="savingMeta"
          @click="saveMetaEdit"
        >
          {{ savingMeta
            ? (locale === 'en' ? 'Saving...' : 'กำลังบันทึก...')
            : (locale === 'en' ? 'Save Details' : 'บันทึกข้อมูลบทบาท') }}
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import HeaderHero from './components/HeaderHero.vue';
import {
  ADMIN_TABS,
  PERMISSION_LEVELS,
  buildDefaultPermissions,
  extractRoleTitleEn,
  hasTabPermission,
  isAdminRoleName,
  normalizePermissions,
} from '@/utils/permissions';

export default {
  name: 'RolesManagement',
  components: { HeaderHero },
  data() {
    return {
      loading: false,
      loadError: '',
      actionError: '',
      statusMessage: '',
      savingBatch: false,
      creating: false,
      savingMeta: false,
      deletingId: null,
      confirmDeleteId: null,
      showCreateModal: false,
      createError: '',
      newRoleForm: {
        titleEn: '',
        titleTh: '',
        desc: '',
        preset: 'submissions-view',
      },
      editingMetaRoleId: null,
      metaError: '',
      metaForm: {
        titleEn: '',
        titleTh: '',
        descEn: '',
        descTh: '',
      },
      draftRoles: [],
    };
  },
  computed: {
    ...mapGetters({
      rawRoles: 'setting/roles/item',
    }),
    locale() {
      return this.$i18n.locale === 'en' ? 'en' : 'th';
    },
    adminTabs() {
      return ADMIN_TABS;
    },
    levels() {
      return PERMISSION_LEVELS;
    },
    canEditRoles() {
      return hasTabPermission(this, 'roles', 'edit');
    },
    baselineRoles() {
      const list = Array.isArray(this.rawRoles) ? this.rawRoles : [];
      const orderRank = (role) => {
        const en = extractRoleTitleEn(role).toLowerCase();
        if (en === 'admin') return 0;
        if (en === 'reviewer') return 1;
        if (en === 'curator') return 2;
        if (en === 'artist') return 3;
        if (en === 'customer') return 4;
        return role.isSystem ? 5 : 6;
      };
      return [...list]
        .sort((a, b) => orderRank(a) - orderRank(b))
        .map(role => ({
          ...role,
          permissions: normalizePermissions(role.permissions, role),
        }));
    },
    dirtyRoleIds() {
      return this.draftRoles
        .filter(draft => {
          const orig = this.baselineRoles.find(r => r._id === draft._id);
          if (!orig) return false;
          return this.adminTabs.some(tab => (draft.permissions[tab.key] || 'none') !== (orig.permissions[tab.key] || 'none'));
        })
        .map(r => r._id);
    },
    editingMetaRole() {
      if (!this.editingMetaRoleId) return null;
      return this.draftRoles.find(r => r._id === this.editingMetaRoleId) || null;
    },
  },
  watch: {
    baselineRoles: {
      immediate: true,
      handler(next) {
        this.draftRoles = next.map(r => ({
          ...r,
          permissions: { ...r.permissions },
        }));
      },
    },
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.loadError = '';
      try {
        await this.$store.dispatch('setting/roles/config', {});
      } catch (err) {
        this.loadError = this.locale === 'en'
          ? 'Unable to load roles. Please try again.'
          : 'ไม่สามารถโหลดรายการบทบาทได้ กรุณาลองใหม่';
      } finally {
        this.loading = false;
      }
    },
    isAdminRole(role) {
      return isAdminRoleName(extractRoleTitleEn(role));
    },
    isRoleDirty(roleId) {
      return this.dirtyRoleIds.includes(roleId);
    },
    langValue(entries, key) {
      if (!Array.isArray(entries)) return '';
      const found = entries.find(item => item && item.key === key);
      return found && found.value ? String(found.value).trim() : '';
    },
    roleTitleDisplay(role) {
      if (!role) return '';
      return this.langValue(role.title, this.locale)
        || this.langValue(role.title, 'en')
        || this.langValue(role.title, 'th')
        || 'Role';
    },
    roleSubtitleDisplay(role) {
      if (!role) return '';
      const otherKey = this.locale === 'en' ? 'th' : 'en';
      return this.langValue(role.title, otherKey);
    },
    levelLabel(level) {
      if (this.locale === 'en') {
        if (level === 'edit') return 'Edit';
        if (level === 'view') return 'View Only';
        return 'None';
      }
      if (level === 'edit') return 'แก้ไขได้';
      if (level === 'view') return 'ดูอย่างเดียว';
      return 'ปิด';
    },
    shortLevelLabel(level) {
      if (this.locale === 'en') {
        if (level === 'edit') return 'Edit';
        if (level === 'view') return 'View';
        return 'None';
      }
      if (level === 'edit') return 'แก้';
      if (level === 'view') return 'ดู';
      return 'ปิด';
    },
    setCellPermission(roleId, tabKey, level) {
      if (!this.canEditRoles) return;
      const target = this.draftRoles.find(r => r._id === roleId);
      if (!target || this.isAdminRole(target)) return;
      this.statusMessage = '';
      this.actionError = '';
      this.$set(target.permissions, tabKey, level);
    },
    discardChanges() {
      this.statusMessage = '';
      this.actionError = '';
      this.draftRoles = this.baselineRoles.map(r => ({
        ...r,
        permissions: { ...r.permissions },
      }));
    },
    async saveAllDirty() {
      if (!this.canEditRoles || this.savingBatch || this.dirtyRoleIds.length === 0) return;
      this.savingBatch = true;
      this.actionError = '';
      this.statusMessage = '';
      try {
        for (const roleId of this.dirtyRoleIds) {
          const role = this.draftRoles.find(r => r._id === roleId);
          if (!role) continue;
          await this.$store.dispatch('setting/roles/update', {
            _id: role._id,
            title: role.title,
            description: role.description || [],
            permissions: normalizePermissions(role.permissions, role),
          });
        }
        const savedCount = this.dirtyRoleIds.length;
        await this.fetchData();
        this.statusMessage = this.locale === 'en'
          ? `Saved permissions for ${savedCount} role(s).`
          : `บันทึกสิทธิ์เรียบร้อยแล้ว (${savedCount} บทบาท)`;
      } catch (err) {
        this.actionError = this.translateApiError(
          err,
          'Failed to save role permissions.',
          'ไม่สามารถบันทึกสิทธิ์ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง'
        );
      } finally {
        this.savingBatch = false;
      }
    },
    openCreateModal() {
      if (!this.canEditRoles) return;
      this.showCreateModal = true;
      this.createError = '';
      this.editingMetaRoleId = null;
      this.newRoleForm = {
        titleEn: '',
        titleTh: '',
        desc: '',
        preset: 'submissions-view',
      };
    },
    buildPresetPermissions(preset) {
      if (preset === 'all-view') return buildDefaultPermissions('view');
      if (preset === 'all-edit') return buildDefaultPermissions('edit');
      if (preset === 'submissions-view') {
        const base = buildDefaultPermissions('none');
        base.submissions = 'view';
        return base;
      }
      return buildDefaultPermissions('none');
    },
    async createNewRole() {
      if (!this.canEditRoles || this.creating) return;
      this.createError = '';
      if (!this.newRoleForm.titleEn && !this.newRoleForm.titleTh) {
        this.createError = this.locale === 'en'
          ? 'Please enter at least one role name.'
          : 'กรุณาระบุชื่อบทบาทอย่างน้อย 1 ภาษา';
        return;
      }

      const title = [];
      if (this.newRoleForm.titleEn) title.push({ key: 'en', value: this.newRoleForm.titleEn });
      if (this.newRoleForm.titleTh) title.push({ key: 'th', value: this.newRoleForm.titleTh });

      const description = this.newRoleForm.desc
        ? [{ key: this.locale, value: this.newRoleForm.desc }]
        : [];

      this.creating = true;
      try {
        await this.$store.dispatch('setting/roles/create', {
          title,
          description,
          permissions: this.buildPresetPermissions(this.newRoleForm.preset),
        });
        this.showCreateModal = false;
        await this.fetchData();
        this.statusMessage = this.locale === 'en'
          ? 'Custom role added to the permission matrix.'
          : 'เพิ่มบทบาทใหม่เข้าสู่ตารางสิทธิ์เรียบร้อยแล้ว';
      } catch (err) {
        this.createError = this.translateApiError(
          err,
          'Failed to create role.',
          'ไม่สามารถสร้างบทบาทได้ กรุณาตรวจสอบชื่อซ้ำ'
        );
      } finally {
        this.creating = false;
      }
    },
    startMetaEdit(role) {
      this.showCreateModal = false;
      this.confirmDeleteId = null;
      this.metaError = '';
      this.editingMetaRoleId = role._id;
      this.metaForm = {
        titleEn: this.langValue(role.title, 'en'),
        titleTh: this.langValue(role.title, 'th'),
        descEn: this.langValue(role.description, 'en'),
        descTh: this.langValue(role.description, 'th'),
      };
    },
    cancelMetaEdit() {
      this.editingMetaRoleId = null;
      this.metaError = '';
    },
    async saveMetaEdit() {
      if (!this.canEditRoles || !this.editingMetaRole || this.savingMeta) return;
      this.metaError = '';
      if (!this.metaForm.titleEn && !this.metaForm.titleTh) {
        this.metaError = this.locale === 'en'
          ? 'Please provide at least one role name.'
          : 'กรุณาระบุชื่อบทบาทอย่างน้อย 1 ภาษา';
        return;
      }

      const title = [];
      if (this.metaForm.titleEn) title.push({ key: 'en', value: this.metaForm.titleEn });
      if (this.metaForm.titleTh) title.push({ key: 'th', value: this.metaForm.titleTh });

      const description = [];
      if (this.metaForm.descEn) description.push({ key: 'en', value: this.metaForm.descEn });
      if (this.metaForm.descTh) description.push({ key: 'th', value: this.metaForm.descTh });

      this.savingMeta = true;
      try {
        await this.$store.dispatch('setting/roles/update', {
          _id: this.editingMetaRole._id,
          title,
          description,
          permissions: normalizePermissions(this.editingMetaRole.permissions, this.editingMetaRole),
        });
        this.editingMetaRoleId = null;
        await this.fetchData();
        this.statusMessage = this.locale === 'en'
          ? 'Role details updated.'
          : 'อัปเดตข้อมูลบทบาทเรียบร้อยแล้ว';
      } catch (err) {
        this.metaError = this.translateApiError(
          err,
          'Failed to update role details.',
          'ไม่สามารถแก้ไขข้อมูลบทบาทได้'
        );
      } finally {
        this.savingMeta = false;
      }
    },
    async confirmDeleteRole(role) {
      if (!this.canEditRoles || !role || role.isSystem || this.deletingId) return;
      this.actionError = '';
      this.statusMessage = '';
      this.deletingId = role._id;
      try {
        await this.$store.dispatch('setting/roles/remove', { _id: role._id });
        this.confirmDeleteId = null;
        await this.fetchData();
        this.statusMessage = this.locale === 'en'
          ? `Deleted role "${this.roleTitleDisplay(role)}".`
          : `ลบบทบาท "${this.roleTitleDisplay(role)}" เรียบร้อยแล้ว`;
      } catch (err) {
        this.confirmDeleteId = null;
        this.actionError = this.translateApiError(
          err,
          'Failed to delete role.',
          'ไม่สามารถลบบทบาทได้'
        );
      } finally {
        this.deletingId = null;
      }
    },
    translateApiError(err, fallbackEn, fallbackTh) {
      const msg = err?.response?.data?.message || '';
      if (/assigned to existing users/i.test(msg)) {
        return this.locale === 'en'
          ? 'This role is currently assigned to existing users. Reassign those users first.'
          : 'ไม่สามารถลบบทบาทนี้ได้ เนื่องจากยังมีผู้ใช้งานถือบทบาทนี้อยู่';
      }
      if (/system role cannot be deleted/i.test(msg)) {
        return this.locale === 'en'
          ? 'Core system roles cannot be deleted.'
          : 'ไม่สามารถลบบทบาทหลักของระบบได้';
      }
      if (/already exists|duplicated/i.test(msg)) {
        return this.locale === 'en'
          ? 'A role with this name already exists.'
          : 'มีชื่อบทบาทนี้อยู่ในระบบแล้ว';
      }
      return this.locale === 'en' ? (msg || fallbackEn) : fallbackTh;
    },
  },
};
</script>

<style scoped>
.roles-shell {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.view-only-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  font-weight: 600;
  font-size: 0.9rem;
}

.pane-title {
  font-size: 1.12rem;
  font-weight: 700;
  color: #1f2937;
}

.role-count-pill {
  padding: 3px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.8rem;
}

.matrix-topbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 14px;
}

.legend-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 4px 10px;
}

.legend-chip {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
}

.legend-chip.level-none {
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.legend-chip.level-view {
  background: #2563eb;
  color: #ffffff;
}

.legend-chip.level-edit {
  background: #059669;
  color: #ffffff;
}

.matrix-scroll-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow-x: auto;
  background: #ffffff;
}

.single-matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 780px;
}

.single-matrix-table thead th {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  vertical-align: top;
  padding: 12px 10px;
}

.single-matrix-table tbody th,
.single-matrix-table tbody td {
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  padding: 11px 10px;
}

.single-matrix-table tbody tr:last-child th,
.single-matrix-table tbody tr:last-child td {
  border-bottom: 0;
}

.single-matrix-table tbody tr:hover td,
.single-matrix-table tbody tr:hover th.module-row-cell {
  background-color: #fafbfc;
}

.sticky-module-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #ffffff;
  min-width: 205px;
  width: 215px;
  text-align: left;
  border-right: 1px solid #e5e7eb;
}

thead th.sticky-module-col {
  z-index: 3;
  background: #f8fafc;
}

.module-col-heading {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #475569;
}

.module-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #111827;
}

.module-desc {
  font-size: 0.76rem;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.35;
}

.role-col-header {
  min-width: 132px;
  text-align: center;
  border-left: 1px solid #f1f5f9;
}

.role-col-header.is-admin-col {
  background: #fff8f8 !important;
}

.role-col-header.is-dirty-col,
.matrix-cell.is-dirty-col {
  background: #fffef5 !important;
}

.matrix-cell.is-admin-col {
  background: #fffafa;
}

.role-col-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.role-col-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

.role-col-name {
  font-size: 0.94rem;
  font-weight: 700;
  color: #111827;
}

.role-col-sub {
  font-size: 0.76rem;
  color: #64748b;
}

.badge-system {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 0.68rem;
  font-weight: 700;
}

.badge-custom {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 700;
}

.badge-dirty {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.68rem;
  font-weight: 700;
}

.role-col-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.mini-action-btn {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 3px 7px;
  line-height: 1.3;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s ease;
}

.mini-action-btn:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
  color: #0f172a;
}

.mini-action-btn.danger {
  color: #b91c1c;
  border-color: #fecaca;
}

.mini-action-btn.danger:hover {
  background: #fef2f2;
}

.mini-action-btn.confirm-danger {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
}

.matrix-cell {
  text-align: center;
  border-left: 1px solid #f1f5f9;
}

.admin-locked-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-size: 0.76rem;
  font-weight: 700;
}

.level-selector {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}

.level-pill {
  border: 0;
  background: transparent;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.level-pill.active.level-none {
  background: #ffffff;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.level-pill.active.level-view {
  background: #2563eb;
  color: #ffffff;
}

.level-pill.active.level-edit {
  background: #059669;
  color: #ffffff;
}

.level-pill:disabled {
  cursor: not-allowed;
  opacity: 0.82;
}

.inline-error {
  padding: 12px 14px;
  border-radius: 8px;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  font-size: 0.88rem;
  font-weight: 600;
}

.btn-save-primary {
  background-color: #8c1515 !important;
  border-color: #8c1515 !important;
}

.skeleton-line {
  height: 18px;
  width: 70%;
  margin: 14px 0;
  border-radius: 8px;
  background: #f1f5f9;
}

.skeleton-line.wide {
  width: 90%;
  height: 28px;
}

.gap-2 {
  gap: 0.5rem;
}

::v-deep .role-form-modal .modal-dialog {
  max-width: 520px;
}

::v-deep .role-form-modal .modal-content {
  background-color: #ffffff;
}
</style>
