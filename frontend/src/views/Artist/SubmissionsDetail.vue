<template>
    <div class="submissions-detail-dashboard" v-if="submission">
        <!-- Back Button -->
        <!-- <div class="mb-3">
            <CLink :to="{ name: 'Submissions' }" class="back-link d-inline-flex align-items-center text-muted">
                <CIcon name="cil-arrow-left" class="mr-2" />
                <span class="font-weight-bold">Back to Submissions</span>
            </CLink>
        </div> -->

        <HeaderHero 
            v-if="!hideHeader"
            :title="getName('en', submission)" 
            :description="`รายละเอียดคลาสเรียนและรายการมอบหมายงานสำหรับคุณ`" 
            icon="cil-list" 
            :showCreateButton="false"
        />
        <SubmissionDetailWidget :submission="submission" v-model="filters.status" />
        <SubmissionDetailFilter v-model="filters" />
        <SubmissionDetailTable :items="submission.assignments || []" :totalStudents="submission.artist ? submission.artist.length : 0" :filters="filters" @submit-work="handleOpenSubmission" @view-work="handleViewWork" />
        <SubmissionModal :show.sync="showSubmissionModal" :assignmentTitle="selectedAssignmentTitle":loading="submitting"@submit="handleWorkSubmit" />
        <ArtworkViewModal :show.sync="showViewModal" :artwork="selectedArtwork" @edit="handleEditArtworkFromView" />
        <ArtworkEditModal :show.sync="showEditModal" :artwork="selectedArtworkForEdit" @save="handleUpdateArtwork" />
    </div>
</template>

<script>
import SubmissionDetailTable from './components/table/SubmissionDetailTable.vue'
import SubmissionDetailWidget from '../Admin/components/submission_detail/SubmissionDetailWidget.vue'
import SubmissionDetailFilter from '../Admin/components/submission_detail/SubmissionDetailFilter.vue'
import SubmissionModal from './components/modal/SubmissionModal.vue'
import ArtworkViewModal from '../Admin/components/modal/artwork/ArtworkViewModal.vue'
import ArtworkEditModal from '../Admin/components/modal/artwork/ArtworkEditModal.vue'
import HeaderHero from './components/HeaderHero.vue'

export default {
    name: 'SubmissionsDetail',
    components: {
        SubmissionDetailTable,
        SubmissionDetailWidget,
        SubmissionDetailFilter,
        SubmissionModal,
        ArtworkViewModal,
        ArtworkEditModal,
        HeaderHero
    },
    props: {
        id: {
            type: String,
            default: null
        },
        hideHeader: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showSubmissionModal: false,
            showViewModal: false,
            showEditModal: false,
            submitting: false,
            selectedAssignment: null,
            selectedArtwork: null,
            selectedArtworkForEdit: null,
            filters: {
                search: '',
                status: 'All Status',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            },
            // Mock enrolled students for this submission
            mockEnrolledStudents: [
                { id: 'USR-001', name: 'Albus Dumbledore', student_id: '6450001' },
                { id: 'USR-002', name: 'Harry Potter', student_id: '6450002' },
                { id: 'USR-003', name: 'Hermione Granger', student_id: '6450003' },
                { id: 'USR-004', name: 'Severus Snape', student_id: '6450004' },
                { id: 'USR-005', name: 'Ron Weasley', student_id: '6450005' }
            ]
        }
    },
    created() {
        this.fetchSubmission();
    },
    computed: {
        submission() {
            const submissionId = this.id || this.$route.params.id;
            return this.$store.getters['submission/submissions'].find(s => s._id === submissionId);
        },
        selectedAssignmentTitle() {
            return this.selectedAssignment ? this.getName('en', this.selectedAssignment) : '';
        },
    },
    methods: {
        fetchSubmission() {
            const submissionId = this.id || this.$route.params.id;
            if (submissionId) {
                this.$store.dispatch('submission/get', { _id: submissionId });
            }
        },
        getName(lang, item) {
            if (!item || !item.title) return 'N/A';
            if (typeof item.title === 'string') return item.title;
            if (Array.isArray(item.title)) {
                const nameObj = item.title.find(n => n.key === lang);
                return nameObj ? nameObj.value : (item.title[0] ? item.title[0].value : 'N/A');
            }
            return 'N/A';
        },
        handleOpenSubmission(assignment) {
            this.selectedAssignment = assignment;
            this.showSubmissionModal = true;
        },
        handleViewWork(assignment) {
            const userId = this.$store.getters['auth/userId'] || (JSON.parse(localStorage.getItem('objs')) || {}).accounts;
            const artwork = assignment.artworks.find(art => {
                const ownerId = art.owner?._id || art.owner;
                return ownerId === userId;
            });
            if (artwork) {
                this.selectedArtwork = artwork;
                this.showViewModal = true;
            }
        },
        async handleWorkSubmit(formData) {
            this.submitting = true;
            try {
                // 1. Upload the artwork file first
                const uploadData = new FormData();
                uploadData.append('image', formData.image);
                
                const uploadRes = await this.$store.dispatch('submission/upload', uploadData);
                
                let imageUrl = '';
                if (uploadRes && uploadRes.data && uploadRes.data.data && uploadRes.data.data.url) {
                    imageUrl = uploadRes.data.data.url;
                } else {
                    throw new Error('Failed to retrieve image URL from upload response');
                }

                // 2. Prepare the artwork object matching the backend schema
                const userId = this.$store.getters['auth/userId'] || (JSON.parse(localStorage.getItem('objs')) || {}).accounts;
                console.log("Submitting artwork with owner ID:", userId);

                const newArtwork = {
                    title: [{ key: 'en', value: formData.title }, { key: 'th', value: formData.title }],
                    description: [{ key: 'en', value: formData.description }, { key: 'th', value: formData.description }],
                    technique: [{ key: 'en', value: formData.technique }, { key: 'th', value: formData.technique }],
                    size: [{ key: 'en', value: formData.size }, { key: 'th', value: formData.size }],
                    price: parseFloat(formData.price) || 0,
                    category: formData.category,
                    image: imageUrl,
                    owner: userId,
                    status: null, // Depending on backend defaults, usually null for new submission
                    create: { at: new Date() }
                };

                // 3. Deep clone to avoid Vuex mutation errors
                const updatedSubmission = JSON.parse(JSON.stringify(this.submission));
                
                // Unpopulate fields to prevent Mongoose cast errors on save
                if (updatedSubmission.artist && updatedSubmission.artist.length > 0 && typeof updatedSubmission.artist[0] === 'object') {
                    updatedSubmission.artist = updatedSubmission.artist.map(a => a._id);
                }
                
                updatedSubmission.assignments.forEach(assignment => {
                    if (assignment.artist && assignment.artist.length > 0 && typeof assignment.artist[0] === 'object') {
                        assignment.artist = assignment.artist.map(a => a._id);
                    }
                    if (assignment.artworks) {
                        assignment.artworks.forEach(aw => {
                            if (aw.owner && typeof aw.owner === 'object') aw.owner = aw.owner._id;
                            if (aw.status && typeof aw.status === 'object') aw.status = aw.status._id;
                            if (aw.category && typeof aw.category === 'object') aw.category = aw.category._id;
                        });
                    }
                });

                const assignmentIndex = updatedSubmission.assignments.findIndex(a => a._id === this.selectedAssignment._id);
                
                if (assignmentIndex !== -1) {
                    if (!updatedSubmission.assignments[assignmentIndex].artworks) {
                        updatedSubmission.assignments[assignmentIndex].artworks = [];
                    }
                    updatedSubmission.assignments[assignmentIndex].artworks.push(newArtwork);

                    await this.$store.dispatch('submission/update', updatedSubmission);
                    this.fetchSubmission();
                    this.showSubmissionModal = false;
                    alert('ส่งงานสำเร็จแล้ว!');
                }
            } catch (error) {
                console.error('Error submitting work:', error);
                const errorMsg = error.response && error.response.data && error.response.data.message 
                    ? error.response.data.message 
                    : error.message;
                alert('เกิดข้อผิดพลาดในการส่งงาน: ' + errorMsg);
            } finally {
                this.submitting = false;
            }
        },
        handleEditArtworkFromView(artwork) {
            this.showViewModal = false;
            this.selectedArtworkForEdit = artwork;
            this.showEditModal = true;
        },
        async handleUpdateArtwork(artworkData) {
            try {
                await this.$store.dispatch('artwork/update', artworkData);

                if (artworkData._image) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('_id', artworkData._id);
                    uploadFormData.append('image', artworkData._image);
                    await this.$store.dispatch('artwork/upload', uploadFormData);
                }

                this.fetchSubmission();
                this.showEditModal = false;
                this.$store.commit('dialog/showToast', {
                    title: 'สำเร็จ',
                    message: 'แก้ไขผลงานสำเร็จแล้ว',
                    variant: 'success'
                });
            } catch (error) {
                console.error('Error updating artwork:', error);
                this.$store.commit('dialog/showToast', {
                    title: 'เกิดข้อผิดพลาด',
                    message: 'ไม่สามารถแก้ไขผลงานได้ กรุณาลองอีกครั้ง',
                    variant: 'danger'
                });
            }
        },
        handleExport() {
            // Logic for export
        }
    }
}
</script>

<style scoped>
.submissions-detail-dashboard {
    position: relative;
    overflow: visible !important;
    padding-bottom: 2rem;
}

.back-link {
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.back-link:hover {
    color: #2c3e50 !important;
    transform: translateX(-4px);
}

.filter-bar {
    width: 100%;
}

.add-btn {
    background-color: #321fdb;
    border-color: #321fdb;
    color: #ffffff !important;
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(50, 31, 219, 0.3);
    transition: all 0.2s;
}

.add-btn:hover {
    background-color: #2c1bbd;
    border-color: #2c1bbd;
    color: #ffffff !important;
}

/* Base custom input wrapper styles */
.search-wrapper {
    background-color: #ffffff;
    border-radius: 12px;
    border: 1px solid #eef0f3;
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 48px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    width: 420px;
}

.search-wrapper:focus-within {
    border-color: #321fdb;
    box-shadow: 0 4px 10px rgba(50, 31, 219, 0.05);
}

.search-icon {
    color: #7a8aa3;
    width: 18px;
    height: 18px;
    margin-right: 12px;
}

/* Styles for the CInput to strip borders */
.custom-search-cinput {
    flex-grow: 1;
}

::v-deep .custom-search-cinput .form-group {
    margin-bottom: 0 !important;
}

::v-deep .custom-search-cinput .form-control {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #172b4d;
    box-shadow: none;
    padding: 0;
}

::v-deep .custom-search-cinput .form-control::placeholder {
    color: #a0aec0;
}
</style>
