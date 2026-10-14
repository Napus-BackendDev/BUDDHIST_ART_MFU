<template>
    <CModal
        :show="show"
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="choice-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-plus" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'Add New Submission' : 'เพิ่มการส่งงานใหม่' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'Choose how you would like to add submissions.' : 'เลือกวิธีการเพิ่มการส่งงาน' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-4">
            <CRow>
                <!-- Manual Choice -->
                <CCol md="4">
                    <div class="choice-card clickable" @click="$emit('manual')">
                        <div class="choice-icon bg-green-light text-green">
                            <CIcon name="cil-pencil" size="xl" />
                        </div>
                        <h6 class="choice-label">{{ $i18n.locale === 'en' ? 'Manual Entry' : 'กรอกข้อมูลด้วยตนเอง' }}</h6>
                        <p class="choice-desc">{{ $i18n.locale === 'en' ? 'Fill out a form to create a single submission portal with student enrollment and tasks.' : 'กรอกฟอร์มเพื่อสร้างช่องทางส่งงานพร้อมลงทะเบียนนักศึกษาและใบงาน' }}</p>
                        <div class="choice-footer">
                            <span>{{ $i18n.locale === 'en' ? 'Get Started' : 'เริ่มต้นใช้งาน' }}</span>
                            <CIcon name="cil-arrow-right" class="ml-2" />
                        </div>
                    </div>
                </CCol>

                <!-- Import Choice -->
                <CCol md="4">
                    <div class="choice-card clickable" @click="triggerFileInput">
                        <div class="choice-icon bg-blue-light text-blue">
                            <CIcon name="cil-cloud-upload" size="xl" />
                        </div>
                        <h6 class="choice-label">{{ $i18n.locale === 'en' ? 'Import from File' : 'นำเข้าจากไฟล์' }}</h6>
                        <p class="choice-desc">{{ $i18n.locale === 'en' ? 'Bulk upload multiple submissions at once using an Excel or CSV file template.' : 'นำเข้าการส่งงานจำนวนมากพร้อมกันโดยใช้เทมเพลตไฟล์ Excel หรือ CSV' }}</p>
                        <div class="choice-footer text-blue">
                            <span>{{ $i18n.locale === 'en' ? 'Upload File' : 'อัปโหลดไฟล์' }}</span>
                            <CIcon name="cil-arrow-right" class="ml-2" />
                        </div>
                        <input
                            type="file"
                            ref="fileInput"
                            class="d-none"
                            accept=".xlsx, .xls, .csv"
                            @change="handleFileChange"
                        >
                    </div>
                </CCol>

                <CCol md="4">
                    <div class="choice-card clickable" @click="$emit('artwork-import'); $emit('update:show', false)">
                        <div class="choice-icon bg-purple-light text-purple"><CIcon name="cil-image" size="xl" /></div>
                        <h6 class="choice-label">{{ $i18n.locale === 'en' ? 'Import Artwork' : 'นำเข้าผลงานเข้า Submission' }}</h6>
                        <p class="choice-desc">{{ $i18n.locale === 'en' ? 'Import the cohort 6 form, image links and optional image files into an existing submission.' : 'นำเข้าแบบฟอร์มรุ่นที่ 6 พร้อมลิงก์ภาพหรือแนบรูปเข้า Submission ที่มีอยู่' }}</p>
                        <div class="choice-footer text-purple"><span>{{ $i18n.locale === 'en' ? 'Import artwork' : 'นำเข้าผลงาน' }}</span><CIcon name="cil-arrow-right" class="ml-2" /></div>
                    </div>
                </CCol>
            </CRow>
        </div>

        <template #footer>
            <div class="w-100 text-center py-2">
                <span class="text-muted small">
                    {{ $i18n.locale === 'en' ? 'Need a template?' : 'ต้องการเทมเพลตหรือไม่?' }}
                    <a href="javascript:void(0)" class="font-weight-bold text-blue" @click="$emit('download-template')">
                        {{ $i18n.locale === 'en' ? 'Submission template' : 'เทมเพลตสร้าง Submission' }}
                    </a>
                    <span class="mx-2">|</span>
                    <a href="javascript:void(0)" class="font-weight-bold text-blue" @click="$emit('download-artwork-template')">{{ $i18n.locale === 'en' ? 'Cohort 6 artwork template' : 'แบบฟอร์มผลงาน รุ่นที่ 6' }}</a>
                </span>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'SubmissionCreateChoiceModal',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.$emit('import', file);
                this.$emit('update:show', false);
                // Clear the input so the same file can be selected again
                event.target.value = '';
            }
        }
    }
}
</script>

<style scoped>
.modal-header-custom {
    padding: 0.5rem 0;
}

.icon-square {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-blue-light { background-color: #3b82f611; }
.text-blue { color: #3b82f6; }
.bg-green-light { background-color: #10b98111; }
.text-green { color: #10b981; }
.bg-purple-light { background-color: #8b5cf611; }
.text-purple { color: #8b5cf6; }

.choice-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 20px;
    padding: 2.5rem 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.choice-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
    border-color: #3b82f633;
}

.choice-icon {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.choice-label {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.75rem;
}

.choice-desc {
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    flex-grow: 1;
}

.choice-footer {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 0.95rem;
}

.close-btn {
    background: transparent;
    border: none;
    padding: 8px;
    color: #94a3b8;
    transition: color 0.2s;
}

::v-deep .modal-content {
    border-radius: 24px;
    border: none;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

::v-deep .modal-header {
    border-bottom: 1px solid #f1f5f9;
    padding: 1.5rem 2.5rem;
}

::v-deep .modal-footer {
    border-top: 1px solid #f1f5f9;
    padding: 1.25rem;
    background: #f8fafc;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
}
</style>
