<template>
    <CModal 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="choice-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-user-plus" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">Add New User</h5>
                        <p class="text-muted small mb-0">Choose how you would like to add new members to the system.</p>
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
                <CCol md="6">
                    <div class="choice-card clickable" @click="$emit('manual')">
                        <div class="choice-icon bg-green-light text-green">
                            <CIcon name="cil-keyboard" size="xl" />
                        </div>
                        <h6 class="choice-label">Manual Entry</h6>
                        <p class="choice-desc">Input user details manually through a step-by-step form. Best for adding individuals.</p>
                        <div class="choice-footer">
                            <span>Add Manually</span>
                            <CIcon name="cil-arrow-right" class="ml-2" />
                        </div>
                    </div>
                </CCol>

                <!-- Import Choice -->
                <CCol md="6">
                    <div class="choice-card clickable" @click="triggerFileInput">
                        <div class="choice-icon bg-blue-light text-blue">
                            <CIcon name="cil-file" size="xl" />
                        </div>
                        <h6 class="choice-label">Import from File</h6>
                        <p class="choice-desc">Bulk upload multiple users at once using an Excel or CSV file. Fast and efficient for large batches.</p>
                        <div class="choice-footer text-blue">
                            <span>Upload File</span>
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
            </CRow>
        </div>

        <template #footer>
            <div class="w-100 text-center py-2">
                <span class="text-muted small">Need a template? <a href="#" class="font-weight-bold text-blue">Download User Import Template</a></span>
            </div>
        </template>
    </CModal>
</template>

<script>
export default {
    name: 'UserCreateChoiceModal',
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
