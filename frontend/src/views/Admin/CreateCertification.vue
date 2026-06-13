<template>
    <div class="create-certification-container">
        <!-- Top Header & Actions Section -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <!-- Left: Title & Subtitle -->
            <div class="d-flex align-items-center">
                <CLink :to="{ name: 'Certification' }" class="back-btn mr-3">
                    <CIcon name="cil-arrow-left" size="lg" />
                </CLink>
                <div>
                    <h3 class="font-weight-bold m-0" style="color: #2c3e50;">{{ $i18n.locale === 'en' ? 'Create Certification' : 'สร้างใบรับรอง' }}</h3>
                    <p class="text-muted mt-1 mb-0 font-weight-bold">{{ $i18n.locale === 'en' ? 'Design your certificate template' : 'ออกแบบเทมเพลตใบรับรองของคุณ' }}</p>
                </div>
            </div>

            <!-- Right: Actions -->
            <div class="d-flex align-items-center">
                <CButton color="secondary" variant="outline" class="mr-2 px-4 shadow-sm font-weight-bold"
                    @click="resetCanvas">
                    {{ $i18n.locale === 'en' ? 'Reset' : 'รีเซ็ต' }}
                </CButton>
                <CButton color="primary" class="px-4 shadow-sm font-weight-bold" @click="saveCertificate">
                    {{ $i18n.locale === 'en' ? 'Save Template' : 'บันทึกเทมเพลต' }}
                </CButton>
            </div>
        </div>

        <!-- Editor Layout -->
        <div class="row m-0 h-100">
            <!-- Left Sidebar (Tools) -->
            <div class="col-md-3 p-0 pr-md-3 mb-4 mb-md-0">
                <CCard class="shadow-sm border-0 h-100 tools-card">
                    <CCardHeader class="bg-white border-0 pt-4 pb-2">
                        <h6 class="m-0 font-weight-bold text-dark text-uppercase tracking-wide">{{ $i18n.locale === 'en' ? 'Editor Tools' : 'เครื่องมือแก้ไข' }}</h6>
                    </CCardHeader>
                    <CCardBody class="pt-2">
                        <!-- Add Text Block -->
                        <div class="tool-group mb-4">
                            <label class="text-muted small font-weight-bold text-uppercase mb-2">{{ $i18n.locale === 'en' ? 'Text Elements' : 'องค์ประกอบข้อความ' }}</label>
                            <CInput :placeholder="$i18n.locale === 'en' ? 'Enter text...' : 'ใส่ข้อความ...'" v-model="newTextContent" class="mb-2" />
                            <CButton color="dark" variant="outline" class="w-100 font-weight-bold" @click="addText">
                                <CIcon name="cil-text" class="mr-2" /> {{ $i18n.locale === 'en' ? 'Add Text' : 'เพิ่มข้อความ' }}
                            </CButton>
                        </div>

                        <hr class="my-4 border-light">

                        <!-- Placeholder Data Blocks -->
                        <div class="tool-group mb-4">
                            <label class="text-muted small font-weight-bold text-uppercase mb-2">{{ $i18n.locale === 'en' ? 'Dynamic Data' : 'ข้อมูลไดนามิก' }}</label>
                            <div class="d-flex flex-wrap gap-2">
                                <CButton color="info" variant="outline" size="sm" class="mb-2 mr-2 custom-pill"
                                    @click="addPlaceholder('{{ Student Name }}')">
                                    + {{ $i18n.locale === 'en' ? 'Student Name' : 'ชื่อนักศึกษา' }}
                                </CButton>
                                <CButton color="info" variant="outline" size="sm" class="mb-2 mr-2 custom-pill"
                                    @click="addPlaceholder('{{ Course Name }}')">
                                    + {{ $i18n.locale === 'en' ? 'Course Name' : 'ชื่อหลักสูตร' }}
                                </CButton>
                                <CButton color="info" variant="outline" size="sm" class="mb-2 mr-2 custom-pill"
                                    @click="addPlaceholder('{{ Date }}')">
                                    + {{ $i18n.locale === 'en' ? 'Current Date' : 'วันที่ปัจจุบัน' }}
                                </CButton>
                            </div>
                        </div>

                        <hr class="my-4 border-light">

                        <!-- Background Setting -->
                        <div class="tool-group mb-4">
                            <label class="text-muted small font-weight-bold text-uppercase mb-2">{{ $i18n.locale === 'en' ? 'Background Image' : 'ภาพพื้นหลัง' }}</label>
                            <div class="custom-file file-upload-wrapper">
                                <input type="file" class="custom-file-input" id="bgUpload" accept="image/*"
                                    @change="onBackgroundImageUpload">
                                <label class="custom-file-label m-0 text-muted" for="bgUpload">{{ $i18n.locale === 'en' ? 'Choose image...' : 'เลือกรูปภาพ...' }}</label>
                            </div>
                            <small class="text-muted d-block mt-2">{{ $i18n.locale === 'en' ? 'Recommended: 1920x1080px (16:9)' : 'แนะนำ: 1920x1080px (16:9)' }}</small>
                        </div>
                    </CCardBody>
                </CCard>
            </div>

            <!-- Right Canvas Area -->
            <div class="col-md-9 p-0">
                <CCard class="shadow-sm border-0 h-100 canvas-card">
                    <CCardBody
                        class="p-0 d-flex justify-content-center align-items-center canvas-body position-relative">
                        <!-- Canvas Container -->
                        <div class="konva-container shadow" ref="konvaContainer">
                            <v-stage ref="stage" :config="stageConfig" @mousedown="handleStageMouseDown"
                                @touchstart="handleStageMouseDown">
                                <v-layer ref="layer">
                                    <!-- Background Image -->
                                    <v-image v-if="bgImage" :config="bgImageConfig" />

                                    <!-- Canvas Elements -->
                                    <v-group>
                                        <template v-for="(item, index) in elements">
                                            <v-text v-if="item.type === 'text'" :key="item.id" :config="{
                                                ...item,
                                                draggable: true,
                                            }" @dragend="handleDragEnd(index, $event)"
                                                @transformend="handleTransformEnd(index, $event)" />
                                        </template>
                                    </v-group>

                                    <!-- Transformer for selected elements -->
                                    <v-transformer ref="transformer" :config="{
                                        keepRatio: true,
                                        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                                    }" />
                                </v-layer>
                            </v-stage>
                        </div>

                        <!-- Empty State Overlay -->
                        <div v-if="!bgImage && elements.length === 0"
                            class="empty-canvas-state text-center position-absolute pointer-events-none">
                            <CIcon name="cil-image" size="3xl" class="text-muted mb-3 opacity-50" />
                            <h5 class="text-muted font-weight-bold">{{ $i18n.locale === 'en' ? 'Empty Canvas' : 'ผืนผ้าใบว่างเปล่า' }}</h5>
                            <p class="text-muted small">{{ $i18n.locale === 'en' ? 'Upload a background image or add text to start designing.' : 'อัปโหลดภาพพื้นหลังหรือเพิ่มข้อความเพื่อเริ่มออกแบบ' }}</p>
                        </div>
                    </CCardBody>
                </CCard>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CreateCertification',
    data() {
        return {
            newTextContent: '',
            stageConfig: {
                width: 800, // Default width (scaled)
                height: 566, // Default height (A4 Landscape ratio roughly 1.414)
            },
            bgImage: null,
            bgImageNativeDimensions: { width: 0, height: 0 },
            elements: [],
            selectedShapeName: '',
            nextId: 1
        }
    },
    computed: {
        bgImageConfig() {
            if (!this.bgImage) return {};
            return {
                image: this.bgImage,
                x: 0,
                y: 0,
                width: this.stageConfig.width,
                height: this.stageConfig.height
            }
        }
    },
    mounted() {
        // Automatically resize canvas to fit container later if needed
    },
    methods: {
        addText() {
            if (!this.newTextContent.trim()) return;
            this.elements.push({
                id: 'text-' + this.nextId++,
                name: 'text-' + this.nextId,
                type: 'text',
                text: this.newTextContent,
                x: this.stageConfig.width / 2 - 50,
                y: this.stageConfig.height / 2,
                fontSize: 32,
                fontFamily: 'Arial',
                fill: '#172b4d',
                align: 'center'
            });
            this.newTextContent = '';
        },
        addPlaceholder(placeholder) {
            this.newTextContent = placeholder;
            this.addText();
        },
        onBackgroundImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.bgImage = img;
                    this.bgImageNativeDimensions = { width: img.width, height: img.height };
                    // Optionally adjust stage ratio based on image here
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        },
        handleDragEnd(index, e) {
            this.elements[index].x = e.target.x();
            this.elements[index].y = e.target.y();
        },
        handleTransformEnd(index, e) {
            const node = e.target;
            const element = this.elements[index];
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            if (element.type === 'text') {
                node.scaleX(1);
                node.scaleY(1);
                element.fontSize = Math.max(12, element.fontSize * scaleY);
                element.width = Math.max(20, node.width() * scaleX);
            }
            element.x = node.x();
            element.y = node.y();
            element.rotation = node.rotation();
        },
        handleStageMouseDown(e) {
            // Clicked on stage - clear selection
            if (e.target === e.target.getStage()) {
                this.selectedShapeName = '';
                this.updateTransformer();
                return;
            }

            // Clicked on a child - check if it is part of elements (not background)
            const clickedOnLine = e.target.getParent().className === 'Transformer';
            if (clickedOnLine) {
                return;
            }

            // Find clicked element
            const name = e.target.name();
            const element = this.elements.find(r => r.name === name);
            if (element) {
                this.selectedShapeName = name;
            } else {
                this.selectedShapeName = '';
            }
            this.updateTransformer();
        },
        updateTransformer() {
            const transformerNode = this.$refs.transformer.getNode();
            const stage = transformerNode.getStage();
            const { selectedShapeName } = this;

            const selectedNode = stage.findOne('.' + selectedShapeName);

            if (selectedNode === transformerNode.node()) {
                return;
            }

            if (selectedNode) {
                transformerNode.nodes([selectedNode]);
            } else {
                transformerNode.nodes([]);
            }
            transformerNode.getLayer().batchDraw();
        },
        resetCanvas() {
            this.elements = [];
            this.bgImage = null;
            this.selectedShapeName = '';
            const transformerNode = this.$refs.transformer.getNode();
            transformerNode.nodes([]);
            transformerNode.getLayer().batchDraw();
        },
        saveCertificate() {
            console.log("Saving Canvas config:", {
                background: this.bgImage ? 'Image uploaded' : null,
                elements: this.elements
            })
            alert(this.$i18n.locale === 'en' ? "Certificate Template Saved Successfully!" : "บันทึกเทมเพลตใบรับรองเรียบร้อยแล้ว!");
        }
    }
}
</script>

<style scoped>
/* Back Button (Squircle) */
.back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    background-color: #ffffff;
    color: #5c6873;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease-in-out;
}

.back-btn:hover {
    background-color: #f8f9fa;
    color: #2c3e50;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.tools-card {
    border-radius: 12px;
}

.canvas-card {
    border-radius: 12px;
    background-color: #f4f5f7;
    min-height: 600px;
}

.canvas-body {
    overflow: auto;
}

.konva-container {
    background-color: #ffffff;
    border: 1px solid #eef0f3;
}

.tracking-wide {
    letter-spacing: 0.5px;
}

.border-light {
    border-color: #f0f1f5 !important;
}

.custom-pill {
    border-radius: 16px;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
}

.pointer-events-none {
    pointer-events: none;
}
</style>
