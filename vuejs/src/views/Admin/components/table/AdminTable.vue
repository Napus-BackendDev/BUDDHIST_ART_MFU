<template>
    <CCard class="artwork-table-card mb-4">
        <div>
            <CDataTable :items="items" :fields="fields" class="custom-table mb-0" hover :border="false"
                :striped="false">
                <template #thumbnail="{ item }">
                    <td>
                        <div class="thumbnail-wrapper">
                            <img :src="`https://via.placeholder.com/40/${item.imgBg}/${item.imgColor}?text=${item.thumbnail}`"
                                :alt="item.title" class="thumbnail-img">
                        </div>
                    </td>
                </template>
                <template #title="{ item }">
                    <td class="font-weight-bold text-dark">{{ item.title }}</td>
                </template>
                <template #artist="{ item }">
                    <td class="text-muted">{{ item.artist }}</td>
                </template>
                <template #category="{ item }">
                    <td>
                        <span class="category-pill">{{ item.category }}</span>
                    </td>
                </template>
                <template #status="{ item }">
                    <td>
                        <div :class="['status-badge', item.statusClass]">
                            <CIcon :name="item.statusIcon" size="sm" class="status-icon" /> {{ item.status }}
                        </div>
                    </td>
                </template>
                <template #actions="{ item }">
                    <td class="text-right">
                        <div v-if="item.status === 'Pending'" class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" title="View">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                            <button class="action-btn icon-edit ml-2" title="Edit">
                                <CIcon name="cil-pencil" size="lg" />
                            </button>
                            <button class="action-btn icon-success mx-2" title="Approve">
                                <CIcon name="cil-check" size="lg" />
                            </button>
                            <button class="action-btn icon-danger" title="Reject">
                                <CIcon name="cil-x" size="lg" />
                            </button>
                        </div>
                        <div v-else class="d-inline-flex align-items-center">
                            <button class="action-btn icon-view" title="View">
                                <CIcon name="cilMagnifyingGlass" size="lg" />
                            </button>
                        </div>
                    </td>
                </template>
            </CDataTable>
        </div>

        <CCardFooter
            class="d-flex justify-content-between align-items-center bg-white border-0 py-4 pt-1 rounded-bottom pagination-footer">
            <div class="text-muted text-sm">Showing {{ items.length }} of {{ items.length }} artworks</div>
            <div class="pagination-buttons">
                <CButton color="light" class="btn-pagination mr-2" disabled>Previous</CButton>
                <CButton color="light" class="btn-pagination">Next</CButton>
            </div>
        </CCardFooter>
    </CCard>
</template>

<script>
export default {
    name: 'OrderTable',
    data() {
        return {
            fields: [
                { key: 'thumbnail', label: 'THUMBNAIL', _classes: 'border-top-0 border-bottom' },
                { key: 'title', label: 'ARTWORK TITLE', _classes: 'border-top-0 border-bottom' },
                { key: 'artist', label: 'ARTIST', _classes: 'border-top-0 border-bottom' },
                { key: 'category', label: 'CATEGORY', _classes: 'border-top-0 border-bottom' },
                { key: 'status', label: 'STATUS', _classes: 'border-top-0 border-bottom' },
                { key: 'actions', label: 'ACTIONS', _classes: 'border-top-0 border-bottom text-right' }
            ],
            items: [
                { thumbnail: 'S', imgBg: 'e2e8f0', imgColor: '808080', title: 'Sunset Blues', artist: 'Jane Doe', category: 'Painting', status: 'Pending', statusIcon: 'cil-clock', statusClass: 'badge-pending' },
                { thumbnail: 'A', imgBg: 'cbd5e0', imgColor: '808080', title: 'Abstract #44', artist: 'Mike Smith', category: 'Digital', status: 'Pending', statusIcon: 'cil-clock', statusClass: 'badge-pending' },
                { thumbnail: 'U', imgBg: 'a0aec0', imgColor: 'ffffff', title: 'Urban Chaos', artist: 'Sarah Lee', category: 'Photography', status: 'Completed', statusIcon: 'cil-check', statusClass: 'badge-completed' },
                { thumbnail: 'M', imgBg: '2d3748', imgColor: 'ffffff', title: 'Mountain Mist', artist: 'John Art', category: 'Painting', status: 'Cancelled', statusIcon: 'cil-x', statusClass: 'badge-cancelled' },
                { thumbnail: 'G', imgBg: 'edf2f7', imgColor: '808080', title: 'Golden Hour', artist: 'Emily Rose', category: 'Sculpture', status: 'Pending', statusIcon: 'cil-clock', statusClass: 'badge-pending' }
            ]
        }
    }
}
</script>

<style scoped>
.artwork-table-card {
    border-radius: 12px;
    border: 1px solid #eef0f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    margin-top: 1rem;
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

.text-dark {
    color: #2c3e50 !important;
    font-size: 0.95rem;
}

.text-muted {
    color: #8c98a9 !important;
    font-size: 0.95rem;
}

.text-sm {
    font-size: 0.9rem;
}

.thumbnail-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    background-color: #f8f9fa;
    border: 1px solid #eef0f3;
}

.thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.category-pill {
    background-color: #f0f3f5;
    color: #4a5568;
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    display: inline-block;
}

/* Status Badges */
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    background-color: #ffffff;
}

.status-icon {
    width: 14px;
    height: 14px;
    margin-right: 6px;
}

.badge-completed {
    color: #38a169;
    border: 1px solid rgba(56, 161, 105, 0.4);
}

.badge-pending {
    color: #d69e2e;
    border: 1px solid rgba(214, 158, 46, 0.4);
}

.badge-cancelled {
    color: #e53e3e;
    border: 1px solid rgba(229, 62, 62, 0.4);
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

/* Action Buttons */
.action-btn {
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s, background-color 0.2s, opacity 0.2s;
    outline: none;
    opacity: 0;
    /* Hidden by default */
}

/* Show action buttons when the table row is hovered */
::v-deep .custom-table tbody tr:hover .action-btn {
    opacity: 1;
}

.action-btn:hover {
    transform: scale(1.15);
}

.icon-success {
    color: #48bb78;
}

.icon-success:hover {
    background-color: #f0fff4;
    /* Light green bg */
}

.icon-danger {
    color: #e53e3e;
}

.icon-danger:hover {
    background-color: #ffdddd;
    /* Light red bg */
}

.icon-view {
    color: #a0aec0;
}

.icon-view:hover {
    background-color: #f1f9ff;
    /* Light gray bg */
}

.icon-edit {
    color: #4299e1;
    /* A nice blue color for edit */
}

.icon-edit:hover {
    background-color: #ebf8ff;
    /* Light blue bg */
}
</style>
