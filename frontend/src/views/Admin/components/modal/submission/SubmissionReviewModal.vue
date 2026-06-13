<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="review-artwork-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-magnifying-glass" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Submission Review' : 'ตรวจสอบผลงานที่ส่ง' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Review and provide feedback for this submission.' : 'ตรวจสอบและประเมินผลงานการส่งงานนี้' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-4 py-3" v-if="artwork">
            <div class="artwork-detail-container">
                <!-- 1) Image Section -->
                <div class="view-section mb-4 text-center">
                    <div class="artwork-image-view rounded-xl overflow-hidden shadow-sm border mx-auto">
                        <img 
                            :src="artwork.preview" 
                            class="w-100 h-100 object-fit-contain bg-white" 
                            :alt="artwork.title_en"
                        />
                    </div>
                </div>

                <!-- 2) Status Section -->
                <div class="view-section mb-4">
                    <div class="d-flex flex-wrap align-items-center justify-content-center gap-4 status-container-stacked">
                        <div class="status-item text-center px-3">
                            <label class="view-label-center">{{ $i18n.locale === 'en' ? 'Submission Status' : 'สถานะการส่งงาน' }}</label>
                            <CBadge :class="['status-badge-lg px-4 py-2', getStatusBadge(artwork.status).class]">
                                <CIcon :name="getStatusBadge(artwork.status).icon" size="sm" class="status-icon-lg" />
                                {{ $i18n.locale === 'en' ? artwork.status : (artwork.status === 'Approved' || artwork.status === 'Passed' ? 'ผ่าน/อนุมัติ' : artwork.status === 'Rejected' || artwork.status === 'Fail' ? 'ไม่ผ่าน' : 'รอการตรวจสอบ') }}
                            </CBadge>
                        </div>
                        <div class="status-item text-center px-3 border-left-light">
                            <label class="view-label-center">{{ $i18n.locale === 'en' ? 'Deadline Progress' : 'ความตรงต่อเวลา' }}</label>
                            <CBadge :class="['status-badge-lg px-4 py-2', artwork.on_time ? 'status-completed' : 'status-cancelled']">
                                <CIcon :name="artwork.on_time ? 'cil-check-circle' : 'cil-warning'" size="sm" class="status-icon-lg" />
                                {{ artwork.on_time ? ($i18n.locale === 'en' ? 'On Time' : 'ตรงเวลา') : ($i18n.locale === 'en' ? 'Late' : 'ส่งช้า') }}
                            </CBadge>
                        </div>
                    </div>
                </div>

                <hr class="my-4 opacity-5">

                <!-- 3) Artwork Title (TH, EN) -->
                <div class="row mb-4">
                    <div class="col-md-6 mb-3 mb-md-0">
                        <div class="view-section">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Artwork Title (Thai)' : 'ชื่อผลงาน (ภาษาไทย)' }}</label>
                            <h2 class="view-value-title font-weight-bold mb-0 text-dark">{{ artwork.title_th || 'N/A' }}</h2>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="view-section">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Artwork Title (English)' : 'ชื่อผลงาน (ภาษาอังกฤษ)' }}</label>
                            <h2 class="view-value-title font-weight-bold mb-0 text-muted">{{ artwork.title_en || 'N/A' }}</h2>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <!-- 4) Artist -->
                    <div class="col-md-6 mb-4">
                        <div class="view-section">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Artist' : 'ศิลปิน' }}</label>
                            <div class="d-flex align-items-center">
                                <div class="artist-avatar-md mr-3" :style="{ backgroundColor: getAvatarColor(artwork.artist_name) }">
                                    {{ getInitials(artwork.artist_name) }}
                                </div>
                                <div class="view-value">
                                    <div class="font-weight-bold text-dark h5 mb-0">
                                        {{ artwork.artist_name }}
                                    </div>
                                    <div class="small text-muted">{{ $i18n.locale === 'en' ? 'Student ID' : 'รหัสนักศึกษา' }}: {{ artwork.student_id }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5) Category -->
                    <div class="col-md-6 mb-4">
                        <div class="view-section">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Category' : 'หมวดหมู่' }}</label>
                            <div class="view-value font-weight-bold text-dark h5">
                                {{ $i18n.locale === 'en' ? artwork.category : (artwork.category === 'Painting' ? 'จิตรกรรม' : artwork.category === 'Sculpture' ? 'ประติมากรรม' : artwork.category === 'Digital Art' ? 'ดิจิทัลอาร์ต' : artwork.category === 'Photography' ? 'ภาพถ่าย' : artwork.category) }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 6) Technique, Size & Remark -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3 mb-md-0">
                        <div class="view-section p-4 bg-white rounded-xl border-premium-sm shadow-sm h-100">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Technique' : 'เทคนิค' }}</label>
                            <div class="view-value text-dark mb-2 d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">TH</span> 
                                <span class="font-weight-bold">{{ artwork.technique_th || 'N/A' }}</span>
                            </div>
                            <div class="view-value text-muted d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">EN</span> 
                                <span>{{ artwork.technique_en || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3 mb-md-0">
                        <div class="view-section p-4 bg-white rounded-xl border-premium-sm shadow-sm h-100">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Size' : 'ขนาด' }}</label>
                            <div class="view-value text-dark mb-2 d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">TH</span> 
                                <span class="font-weight-bold">{{ artwork.size_th || 'N/A' }}</span>
                            </div>
                            <div class="view-value text-muted d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">EN</span> 
                                <span>{{ artwork.size_en || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="view-section p-4 bg-white rounded-xl border-premium-sm shadow-sm h-100">
                            <label class="view-label">{{ $i18n.locale === 'en' ? 'Remark' : 'หมายเหตุ' }}</label>
                            <div class="view-value text-dark mb-2 d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">TH</span> 
                                <span class="font-weight-bold">{{ artwork.remark_th || 'N/A' }}</span>
                            </div>
                            <div class="view-value text-muted d-flex align-items-center">
                                <span class="badge badge-white-outline mr-3">EN</span> 
                                <span>{{ artwork.remark_en || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 7) Price / Value -->
                <div class="view-section mb-4 p-3 border rounded-xl bg-primary-faded">
                    <label class="view-label mb-1">{{ $i18n.locale === 'en' ? 'Price / Value' : 'ราคา / มูลค่า' }}</label>
                    <div class="view-value-price font-weight-bold h2 mb-0 text-primary">
                        ฿ {{ artwork.price ? artwork.price.toLocaleString() : '0' }}
                    </div>
                </div>

                <!-- 8) Description (EN) -->
                <div class="view-section mb-4">
                    <label class="view-label">{{ $i18n.locale === 'en' ? 'Description (English)' : 'รายละเอียด (ภาษาอังกฤษ)' }}</label>
                    <div class="view-description-box p-3 border rounded-lg bg-white shadow-sm">
                        {{ artwork.description_en || ($i18n.locale === 'en' ? 'No English description provided.' : 'ไม่มีรายละเอียดภาษาอังกฤษ') }}
                    </div>
                </div>

                <!-- 9) Description (TH) -->
                <div class="view-section mb-4">
                    <label class="view-label">{{ $i18n.locale === 'en' ? 'Description (Thai)' : 'รายละเอียด (ภาษาไทย)' }}</label>
                    <div class="view-description-box p-3 border rounded-lg bg-white shadow-sm">
                        {{ artwork.description_th || ($i18n.locale === 'en' ? 'No Thai description provided.' : 'ไม่มีคำอธิบายภาษาไทย.') }}
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-between align-items-center py-2 px-3">
                <CButton 
                    color="light" 
                    @click="$emit('update:show', false)"
                    class="btn-close-view px-4"
                    :disabled="isUpdating"
                >
                    {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
                </CButton>
                
                <div class="d-flex" v-if="artwork.status === 'Pending'">
                    <CButton 
                        class="btn-action-modal btn-passed-modal mr-3" 
                        :disabled="isUpdating"
                        @click="handleAction('Approved')"
                    >
                        <CSpinner v-if="isUpdating === 'Approved'" size="sm" class="mr-2" />
                        {{ isUpdating === 'Approved' ? ($i18n.locale === 'en' ? 'Sending Email...' : 'กำลังส่งอีเมล...') : ($i18n.locale === 'en' ? 'Mark Passed' : 'อนุมัติผ่าน') }}
                    </CButton>
                    <CButton 
                        class="btn-action-modal btn-failed-modal" 
                        :disabled="isUpdating"
                        @click="handleAction('Rejected')"
                    >
                        <CSpinner v-if="isUpdating === 'Rejected'" size="sm" class="mr-2" />
                        {{ isUpdating === 'Rejected' ? ($i18n.locale === 'en' ? 'Sending Email...' : 'กำลังส่งอีเมล...') : ($i18n.locale === 'en' ? 'Mark Fail' : 'ปฏิเสธไม่ผ่าน') }}
                    </CButton>
                </div>
                <div v-else class="text-muted font-italic small">
                    {{ $i18n.locale === 'en' ? `Action unavailable: This submission is already ${artwork.status.toLowerCase()}` : `ไม่สามารถดำเนินการได้: การส่งงานนี้ได้รับการ${artwork.status === 'Approved' || artwork.status === 'Passed' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}` }}
                </div>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'SubmissionReviewModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        artwork: {
            type: Object,
            default: () => null
        },
        isUpdating: {
            type: String,
            default: null
        }
    },
    methods: {
        handleAction(statusName) {
            this.$emit('update-status', statusName);
        },
        getInitials(name) {
            if (!name) return '??';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        },
        getAvatarColor(name) {
            const colors = ['#e06e64', '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#a0aec0'];
            if (!name) return colors[0];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        },
        getStatusBadge(status) {
            if (status === 'Passed' || status === 'Approved') return { class: 'status-completed', icon: 'cil-check-circle' };
            if (status === 'Fail' || status === 'Rejected') return { class: 'status-cancelled', icon: 'cil-ban' };
            if (status === 'Pending') return { class: 'status-pending', icon: 'cil-clock' };
            return { class: 'status-update', icon: 'cil-history' };
        }
    }
}
</script>

<style scoped>
.review-artwork-modal {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.artwork-detail-container {
    max-width: 800px;
    margin: 0 auto;
}

.artwork-image-view {
    max-width: 100%;
    height: 450px;
    background-color: #f8fafc;
}

.view-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.6rem;
    letter-spacing: 0.08em;
}

.view-label-center {
    display: block;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.75rem;
    letter-spacing: 0.05em;
}

.view-value-title {
    color: #0f172a;
    font-size: 1.75rem;
    line-height: 1.2;
}

.artist-avatar-md {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.status-badge-lg {
    display: inline-flex;
    align-items: center;
    border-radius: 99px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    border: 1px solid transparent;
}

.status-icon-lg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

.border-left-light {
    border-left: 1px solid #f1f5f9;
}

.bg-primary-faded {
    background-color: #3b82f608;
    border-color: #3b82f622 !important;
}

.view-description-box {
    line-height: 1.7;
    font-size: 1rem;
    color: #334155;
    white-space: pre-line;
}

.badge-white-outline {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    font-weight: 800;
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 6px;
    min-width: 32px;
    text-align: center;
}

.border-premium-sm {
    border: 2px solid #f1f5f9 !important;
}

.status-completed {
    background-color: #f0fdf4;
    color: #166534;
    border-color: #bbf7d0;
}

.status-pending {
    background-color: #fffbeb;
    color: #92400e;
    border-color: #fef3c7;
}

.status-cancelled {
    background-color: #fef2f2;
    color: #991b1b;
    border-color: #fee2e2;
}

.status-update {
    background-color: #eff6ff;
    color: #1e40af;
    border-color: #dbeafe;
}

.btn-close-view {
    border-radius: 12px;
    font-weight: 600;
}

.btn-action-modal {
    height: 44px;
    border-radius: 12px;
    font-weight: 700;
    padding: 0 1.5rem;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.btn-passed-modal {
    background-color: #10b981;
    color: white;
}

.btn-passed-modal:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-failed-modal {
    background-color: #ef4444;
    color: white;
}

.btn-failed-modal:hover:not(:disabled) {
    background-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-action-modal:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

::v-deep .modal-content {
    border-radius: 24px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.rounded-xl { border-radius: 20px; }
.rounded-lg { border-radius: 12px; }

.modal-header-custom {
    padding: 1.25rem 1.5rem;
}

.icon-square {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.bg-blue-light { background-color: #eef2ff; }
.text-blue { color: #4f46e5; }

.close-btn {
    background: #f1f5f9;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
}
</style>
