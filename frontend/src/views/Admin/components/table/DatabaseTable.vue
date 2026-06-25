<template>
    <CCard class="database-table-card mb-4">
        <div>
            <!-- Main Data Table -->
            <CDataTable :items="currentItems" :fields="currentFields" class="custom-table mb-0" hover :border="false"
                :striped="false" :items-per-page="10" :active-page="activePage" @page-change="pageChange">

                <!-- Orders -->
                <template v-if="currentTab === 'Orders'" #date_time="{ item }">
                    <td class="text-muted">{{ item.date_time }}</td>
                </template>
                <template v-if="currentTab === 'Orders'" #customer="{ item }">
                    <td class="font-weight-bold" style="color: #2c3e50;">{{ item.customer }}</td>
                </template>
                <template v-if="currentTab === 'Orders'" #artwork_artist="{ item }">
                    <td>
                        <div class="d-flex align-items-center">
                            <img :src="item.artwork_picture" alt="Artwork" class="preview-img mr-3"
                                v-if="item.artwork_picture" />
                            <div v-else
                                class="preview-img-placeholder bg-light text-muted d-flex align-items-center justify-content-center mr-3">
                                {{ $i18n.locale === 'en' ? 'No Image' : 'ไม่มีรูปภาพ' }}</div>
                            <div>
                                <div class="font-weight-bold" style="color: #2c3e50;">{{ item.artwork }}</div>
                                <div class="small text-muted">{{ item.artist }}</div>
                            </div>
                        </div>
                    </td>
                </template>
                <template v-if="currentTab === 'Orders'" #amount="{ item }">
                    <td class="font-weight-bold">{{ item.amount }}</td>
                </template>

                <!-- Artworks -->
                <template v-if="currentTab === 'Artworks'" #artwork_picture="{ item }">
                    <td class="text-center align-middle">
                        <img :src="item.artwork_picture" alt="Artwork" class="preview-img"
                            v-if="item.artwork_picture" />
                        <div v-else
                            class="preview-img-placeholder bg-light text-muted d-flex align-items-center justify-content-center">
                            {{ $i18n.locale === 'en' ? 'No Image' : 'ไม่มีรูปภาพ' }}</div>
                    </td>
                </template>
                <template v-if="currentTab === 'Artworks'" #title_artist="{ item }">
                    <td>
                        <div class="font-weight-bold" style="color: #2c3e50;">{{ item.title }}</div>
                        <div class="small text-muted">{{ item.artist }}</div>
                    </td>
                </template>
                <template v-if="currentTab === 'Artworks'" #category_price="{ item }">
                    <td>
                        <div style="color: #2c3e50;">{{ item.category }}</div>
                        <div class="small font-weight-bold mt-1 text-success">{{ item.price }}</div>
                    </td>
                </template>
                <template v-if="currentTab === 'Artworks'" #create_date="{ item }">
                    <td class="text-muted">{{ item.create_date }}</td>
                </template>

                <!-- Submissions -->
                <template v-if="currentTab === 'Submissions'" #art_picture="{ item }">
                    <td class="text-center align-middle">
                        <img :src="item.art_picture" alt="Artwork" class="preview-img" v-if="item.art_picture" />
                        <div v-else
                            class="preview-img-placeholder bg-light text-muted d-flex align-items-center justify-content-center">
                            {{ $i18n.locale === 'en' ? 'No Image' : 'ไม่มีรูปภาพ' }}</div>
                    </td>
                </template>
                <template v-if="currentTab === 'Submissions'" #student_details="{ item }">
                    <td>
                        <div class="font-weight-bold" style="color: #2c3e50;">{{ item.student_name }}</div>
                        <div class="small text-muted">{{ item.student_email }}</div>
                    </td>
                </template>
                <template v-if="currentTab === 'Submissions'" #generation_assignment="{ item }">
                    <td>
                        <div style="color: #2c3e50;">{{ item.generation }}</div>
                        <div class="small text-muted">{{ item.assignment }}</div>
                    </td>
                </template>
                <template v-if="currentTab === 'Submissions'" #submitted="{ item }">
                    <td class="text-muted">{{ item.submitted }}</td>
                </template>

                <!-- Shared -->
                <template #status="{ item }">
                    <td>
                        <span :class="getStatusBadgeClass(item.status)" class="badge-custom">
                            {{ getTranslatedStatus(item.status) }}
                        </span>
                    </td>
                </template>
                <template #actions="{ item }">
                    <td class="text-right">
                        <div class="d-inline-flex align-items-center action-wrapper">
                            <button class="action-btn icon-view" :title="$i18n.locale === 'en' ? 'View' : 'ดู'" @click="handleView(item)">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit mx-2" :title="$i18n.locale === 'en' ? 'Edit' : 'แก้ไข'" @click="handleEdit(item)">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" :title="$i18n.locale === 'en' ? 'Delete' : 'ลบ'" @click="handleDelete(item)">
                                <CIcon name="cil-trash" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>

            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm" v-if="currentItems.length > 0">
                {{ $i18n.locale === 'en' ? 'Showing' : 'แสดง' }} {{ (activePage - 1) * 10 + 1 }} {{ $i18n.locale === 'en' ? 'to' : 'ถึง' }} {{ Math.min(activePage * 10, currentItems.length) }} {{ $i18n.locale === 'en' ? 'of' : 'จาก' }} {{ currentItems.length }} {{ getTranslatedTabName(currentTab) }}
            </div>
            <div class="text-muted text-sm" v-else>
                {{ $i18n.locale === 'en' ? `Showing 0 ${currentTab.toLowerCase()}` : `แสดง 0 ${getTranslatedTabName(currentTab)}` }}
            </div>
            <CPagination
                :active-page.sync="activePage"
                :pages="Math.max(1, Math.ceil(currentItems.length / 10))"
                size="sm"
                align="end"
                class="mb-0 pill-pagination"
            />
        </CCardFooter>

        <!-- Internal Modals for Actions -->
        <CModal :show.sync="showViewModal" :title="this.$i18n.locale === 'en' ? `View ${currentTab.slice(0, -1)} Detail` : `รายละเอียด${getTranslatedTabName(currentTab)}`" color="info">
            <pre v-if="selectedItem" class="bg-light p-3 rounded" style="white-space: pre-wrap;">{{ JSON.stringify(selectedItem,
                null, 2) }}</pre>
            <template #footer>
                <CButton color="secondary" @click="showViewModal = false">{{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}</CButton>
            </template>
        </CModal>

        <CModal :show.sync="showEditModal" :title="this.$i18n.locale === 'en' ? `Edit ${currentTab.slice(0, -1)}` : `แก้ไข${getTranslatedTabName(currentTab)}`" color="primary">
            <div v-if="selectedItem">
                <p class="text-muted">{{ $i18n.locale === 'en' ? `Editor form for ${selectedItem.id} goes here...` : `ฟอร์มแก้ไขสำหรับ ${selectedItem.id}...` }}</p>
                <CInput v-for="(val, key) in selectedItem" :key="key" :label="key" :value="val" />
            </div>
            <template #footer>
                <CButton color="secondary" @click="showEditModal = false">{{ $i18n.locale === 'en' ? 'Cancel' : 'ยกเลิก' }}</CButton>
                <CButton color="primary" @click="saveEdit">{{ $i18n.locale === 'en' ? 'Save Changes' : 'บันทึกการเปลี่ยนแปลง' }}</CButton>
            </template>
        </CModal>

    </CCard>
</template>

<script>
export default {
    name: 'DatabaseTable',
    props: {
        currentTab: {
            type: String,
            required: true,
            validator: value => ['Orders', 'Artworks', 'Submissions'].includes(value)
        }
    },
    data() {
        return {
            activePage: 1,
            showViewModal: false,
            showEditModal: false,
            selectedItem: null,

            // Mock Data
            orders: [
                { id: 'ORD-001', date_time: '2023-11-20 14:30', customer: 'John Doe', artwork_picture: '', artwork: 'Mountains at Dusk', artist: 'Jane Smith', amount: '$540.00', status: 'Completed' },
                { id: 'ORD-002', date_time: '2023-11-21 09:15', customer: 'Alice Wong', artwork_picture: '', artwork: 'Abstract Chaos', artist: 'Bob Ross', amount: '$1,200.00', status: 'Pending' },
                { id: 'ORD-003', date_time: '2023-11-22 16:45', customer: 'Charlie Chaplin', artwork_picture: '', artwork: 'City Lights', artist: 'Sam Taylor', amount: '$300.00', status: 'Cancelled' }
            ],
            artworks: [
                { id: 'ART-101', artwork_picture: '', title: 'Mountains at Dusk', artist: 'Jane Smith', category: 'Landscape', price: '$540.00', create_date: '2023-10-05', status: 'Available' },
                { id: 'ART-102', artwork_picture: '', title: 'Abstract Chaos', artist: 'Bob Ross', category: 'Abstract', price: '$1,200.00', create_date: '2023-10-10', status: 'Sold' },
                { id: 'ART-103', artwork_picture: '', title: 'City Lights', artist: 'Sam Taylor', category: 'Photography', price: '$300.00', create_date: '2023-11-01', status: 'Draft' }
            ],
            submissions: [
                { id: 'SUB-201', art_picture: '', student_name: 'Mark Lee', student_email: 'mark.l@student.com', generation: 'Gen 4', assignment: 'Final Project', submitted: '2023-12-15 10:00', status: 'Passed' },
                { id: 'SUB-202', art_picture: '', student_name: 'Sarah Connor', student_email: 's.connor@student.com', generation: 'Gen 4', assignment: 'Midterm Sketch', submitted: '2023-12-16 11:30', status: 'Pending' },
                { id: 'SUB-203', art_picture: '', student_name: 'Peter Parker', student_email: 'peter.p@student.com', generation: 'Gen 3', assignment: 'Color Theory', submitted: '2023-12-18 14:20', status: 'Fail' }
            ]
        }
    },
    computed: {
        currentFields() {
            if (this.currentTab === 'Orders') {
                return [
                    { key: 'id', label: this.$i18n.locale === 'en' ? 'ORDER ID' : 'รหัสคำสั่งซื้อ', _classes: 'border-top-0 border-bottom w-10' },
                    { key: 'date_time', label: this.$i18n.locale === 'en' ? 'DATE & TIME' : 'วันและเวลา', _classes: 'border-top-0 border-bottom' },
                    { key: 'customer', label: this.$i18n.locale === 'en' ? 'CUSTOMER' : 'ลูกค้า', _classes: 'border-top-0 border-bottom' },
                    { key: 'artwork_artist', label: this.$i18n.locale === 'en' ? 'ARTWORK / ARTIST' : 'ผลงาน / ศิลปิน', _classes: 'border-top-0 border-bottom w-25' },
                    { key: 'amount', label: this.$i18n.locale === 'en' ? 'AMOUNT' : 'ยอดเงิน', _classes: 'border-top-0 border-bottom' },
                    { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                    { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
                ];
            }
            if (this.currentTab === 'Artworks') {
                return [
                    { key: 'id', label: this.$i18n.locale === 'en' ? 'ARTWORK ID' : 'รหัสผลงาน', _classes: 'border-top-0 border-bottom w-10' },
                    { key: 'artwork_picture', label: this.$i18n.locale === 'en' ? 'PICTURE' : 'รูปภาพ', _classes: 'border-top-0 border-bottom text-center' },
                    { key: 'title_artist', label: this.$i18n.locale === 'en' ? 'TITLE / ARTIST' : 'ชื่อผลงาน / ศิลปิน', _classes: 'border-top-0 border-bottom w-25' },
                    { key: 'category_price', label: this.$i18n.locale === 'en' ? 'CATEGORY / PRICE' : 'หมวดหมู่ / ราคา', _classes: 'border-top-0 border-bottom' },
                    { key: 'create_date', label: this.$i18n.locale === 'en' ? 'CREATE DATE' : 'วันที่สร้าง', _classes: 'border-top-0 border-bottom' },
                    { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                    { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
                ];
            }
            return [
                { key: 'id', label: this.$i18n.locale === 'en' ? 'SUBMISSION ID' : 'รหัสการส่งงาน', _classes: 'border-top-0 border-bottom w-10' },
                { key: 'art_picture', label: this.$i18n.locale === 'en' ? 'ART PICTURE' : 'รูปภาพผลงาน', _classes: 'border-top-0 border-bottom text-center' },
                { key: 'student_details', label: this.$i18n.locale === 'en' ? 'STUDENT NAME / EMAIL' : 'ชื่อนักเรียน / อีเมล', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'generation_assignment', label: this.$i18n.locale === 'en' ? 'GENERATION / ASSIGNMENT' : 'รุ่น / ชิ้นงาน', _classes: 'border-top-0 border-bottom w-25' },
                { key: 'submitted', label: this.$i18n.locale === 'en' ? 'SUBMITTED' : 'วันที่ส่ง', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: this.$i18n.locale === 'en' ? 'STATUS' : 'สถานะ', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: this.$i18n.locale === 'en' ? 'ACTIONS' : 'การจัดการ', _classes: 'border-top-0 border-bottom text-right' }
            ];
        },
        currentItems() {
            if (this.currentTab === 'Orders') {
                return [...this.orders].sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
            }
            if (this.currentTab === 'Artworks') {
                return [...this.artworks].sort((a, b) => new Date(b.create_date) - new Date(a.create_date));
            }
            return [...this.submissions].sort((a, b) => new Date(b.submitted) - new Date(a.submitted));
        }
    },
    methods: {
        getTranslatedTabName(tab) {
            const map = {
                'orders': this.$i18n.locale === 'en' ? 'orders' : 'คำสั่งซื้อ',
                'artworks': this.$i18n.locale === 'en' ? 'artworks' : 'ผลงานศิลปะ',
                'submissions': this.$i18n.locale === 'en' ? 'submissions' : 'รายการส่งงาน'
            };
            return map[tab.toLowerCase()] || tab;
        },
        getTranslatedStatus(status) {
            const map = {
                'Completed': this.$i18n.locale === 'en' ? 'Completed' : 'เสร็จสมบูรณ์',
                'Pending': this.$i18n.locale === 'en' ? 'Pending' : 'รอดำเนินการ',
                'Cancelled': this.$i18n.locale === 'en' ? 'Cancelled' : 'ยกเลิก',
                'Available': this.$i18n.locale === 'en' ? 'Available' : 'ว่าง',
                'Sold': this.$i18n.locale === 'en' ? 'Sold' : 'ขายแล้ว',
                'Draft': this.$i18n.locale === 'en' ? 'Draft' : 'ฉบับร่าง',
                'Passed': this.$i18n.locale === 'en' ? 'Passed' : 'ผ่าน',
                'Fail': this.$i18n.locale === 'en' ? 'Fail' : 'ไม่ผ่าน'
            };
            return map[status] || status;
        },
        getStatusBadgeClass(status) {
            const successStatus = ['Completed', 'Available', 'Passed'];
            const warningStatus = ['Pending', 'Draft'];
            const dangerStatus = ['Cancelled', 'Sold', 'Fail'];

            if (successStatus.includes(status)) return 'badge-success-soft';
            if (warningStatus.includes(status)) return 'badge-warning-soft';
            if (dangerStatus.includes(status)) return 'badge-danger-soft';
            return 'badge-secondary-soft';
        },
        handleView(item) {
            this.selectedItem = item;
            this.showViewModal = true;
        },
        handleEdit(item) {
            this.selectedItem = Object.assign({}, item); // copy
            this.showEditModal = true;
        },
        handleDelete(item) {
            const confirmMsg = this.$i18n.locale === 'en' 
                ? `Are you sure you want to delete ${item.id}?` 
                : `คุณแน่ใจหรือไม่ที่จะลบ ${item.id}?`;
            const alertMsg = this.$i18n.locale === 'en'
                ? `Deleted ${item.id}`
                : `ลบ ${item.id} สำเร็จ`;
            if (confirm(confirmMsg)) {
                alert(alertMsg);
            }
        },
        saveEdit() {
            const alertMsg = this.$i18n.locale === 'en'
                ? `Saved changes for ${this.selectedItem.id}`
                : `บันทึกการเปลี่ยนแปลงของ ${this.selectedItem.id} สำเร็จ`;
            alert(alertMsg);
            this.showEditModal = false;
        },
        pageChange(val) {
            this.activePage = val;
        }
    },
    watch: {
        currentTab() {
            this.activePage = 1;
        }
    }
}
</script>

<style scoped>
.database-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.custom-table th {
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: 700;
    color: #7a8aa3;
    padding: 1.25rem 1.5rem;
    border-color: #f0f1f5;
    background-color: #ffffff;
}

.custom-table td {
    padding: 1.25rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid #f0f1f5;
    color: #172b4d;
}

.custom-table tr:last-child td {
    border-bottom: none;
}

/* Badges */
.badge-custom {
    padding: 0.4em 0.8em;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge-success-soft {
    background-color: #e6f6ed;
    color: #27a768;
}

.badge-warning-soft {
    background-color: #fff8e6;
    color: #e6a23c;
}

.badge-danger-soft {
    background-color: #fff5f5;
    color: #e53e3e;
}

.badge-secondary-soft {
    background-color: #f1f3f5;
    color: #6c757d;
}

/* Footer Pagination */
.pagination-footer {
    border-top: 1px solid #f0f1f5 !important;
    margin: 0 1.5rem;
    padding-left: 0;
    padding-right: 0;
}

.btn-pagination {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    color: #4a5568;
    font-weight: 600;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
    background-color: #f7fafc;
    color: #1a202c;
}

.btn-pagination:disabled {
    opacity: 0.6;
    background-color: #ffffff;
}

.rounded-bottom {
    border-bottom-left-radius: 12px !important;
    border-bottom-right-radius: 12px !important;
}

.preview-img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid #eef0f3;
}

.preview-img-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    font-size: 0.65rem;
    display: inline-flex;
}
</style>
