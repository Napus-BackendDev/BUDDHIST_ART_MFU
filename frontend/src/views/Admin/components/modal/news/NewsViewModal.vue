<template>
    <CModal 
        title="News Details" 
        :show="show" 
        @update:show="$emit('update:show', $event)"
        size="lg"
        centered
        class="view-news-modal admin-modal"
    >
        <template #header>
            <div class="modal-header-custom w-100 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="icon-square bg-blue-light text-blue mr-3">
                        <CIcon name="cil-newspaper" size="lg" />
                    </div>
                    <div>
                        <h5 class="modal-title font-weight-bold">{{ $i18n.locale === 'en' ? 'News Article Details' : 'รายละเอียดข่าว' }}</h5>
                        <p class="text-muted small mb-0">{{ $i18n.locale === 'en' ? 'View the full content of this news article.' : 'ดูเนื้อหาทั้งหมดของข่าวนี้' }}</p>
                    </div>
                </div>
                <button class="close-btn" @click="$emit('update:show', false)">
                    <CIcon name="cil-x" size="sm" />
                </button>
            </div>
        </template>

        <div class="px-3 py-2" v-if="news">
            <!-- Single Image Display -->
            <div class="news-image-container mb-4" v-if="getFirstImage(news)">
                <img :src="getFirstImage(news)" class="news-main-image" />
            </div>

            <h3 class="font-weight-bold mb-2">{{ getName('en', news.title) }}</h3>
            <div class="text-muted small mb-4">
                <CIcon name="cil-calendar" class="mr-1" /> {{ formatDate(news.create ? news.create.datetime : news.createdAt) }}
            </div>

            <div class="news-content-text" v-html="safeDescription">
            </div>
        </div>

        <template #footer>
            <div class="w-100 d-flex justify-content-end align-items-center py-2">
                <CButton 
                    variant="ghost" 
                    @click="$emit('update:show', false)"
                    class="btn-cancel mr-3"
                >
                    {{ $i18n.locale === 'en' ? 'Close' : 'ปิด' }}
                </CButton>
                <CButton 
                    color="primary" 
                    @click="$emit('edit', news)"
                    class="btn-edit-news"
                >
                    {{ $i18n.locale === 'en' ? 'Edit News' : 'แก้ไขข่าว' }}
                </CButton>
            </div>
        </template>
    </CModal>
</template>

<script>
import DOMPurify from 'dompurify';

export default {
    name: 'NewsViewModal',
    props: {
        show: { type: Boolean, default: false },
        news: { type: Object, default: () => null }
    },
    computed: {
        safeDescription() {
            return DOMPurify.sanitize(this.getName(this.$i18n.locale, this.news && (this.news.description || this.news.content)) || '');
        }
    },
    methods: {
        getName(lang, field) {
            if (!field) return '';
            if (typeof field === 'string') return field;
            if (Array.isArray(field)) {
                const obj = field.find(f => f.key === lang) || field[0];
                return obj ? obj.value : '';
            }
            return '';
        },
        getFirstImage(news) {
            if (!news) return null;
            if (news.images && news.images.length > 0) return news.images[0];
            if (news.image) return news.image;
            return 'https://via.placeholder.com/800x400?text=No+Image';
        },
        formatDate(date) {
            if (!date) return '';
            const locale = this.$i18n.locale === 'en' ? 'en-GB' : 'th-TH';
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(new Date(date));
        },
    }
}
</script>

<style scoped>
.news-image-container {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    height: 350px;
    background-color: #f8fafc;
    border: 1px solid #eef0f3;
}

.news-main-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
}

.category-badge-floating {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: capitalize;
    background-color: rgba(59, 130, 246, 0.9);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-content-text {
    font-size: 1.05rem;
    line-height: 1.6;
    color: #475569;
}

.icon-square { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-blue-light { background-color: #3b82f611; }
.text-blue { color: #3b82f6; }
.close-btn { background: transparent; border: none; padding: 8px; color: #94a3b8; }
::v-deep .modal-content { border-radius: 20px; border: none; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
</style>
