<template>
    <div class="news-dashboard">
        <HeaderHero :title="$i18n.locale === 'en' ? 'News Management' : 'จัดการข่าวสาร'" :description="$i18n.locale === 'en' ? 'Manage your news articles, announcements, and updates for the community.' : 'จัดการบทความข่าว ประกาศ และอัปเดตสำหรับชุมชน'" icon="cil-newspaper" :showCreateButton="true" :showExportButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create News' : 'สร้างข่าวสาร'" themeColor="gray" @create="onAddNews" @export="handleExport" />
        <NewsWidget v-model="filters.status" :items="newsItems" />
        <NewsFilter v-model="filters" />
        <NewsTable ref="adminTable" :filters="filters" :items="newsItems" @view="handleViewNews" @edit="handleEditNews" @delete="handleDeleteNews" />
        <NewsCreateModal :show.sync="showCreateModal" :saving="saving" @save="handleSaveNews"/>
        <NewsViewModal :show.sync="showViewModal" :news="selectedNews" @edit="handleEditNewsFromView"/>
        <NewsEditModal :show.sync="showEditModal" :news="selectedNews" :saving="saving" @save="handleUpdateNews"/>
    </div>
</template>

<script>
import NewsTable from './components/table/NewsTable.vue';
import HeaderHero from './components/HeaderHero.vue';
import NewsWidget from './components/widget/NewsWidget.vue';
import NewsFilter from './components/filter/NewsFilter.vue';
import NewsCreateModal from './components/modal/news/NewsCreateModal.vue';
import NewsViewModal from './components/modal/news/NewsViewModal.vue';
import NewsEditModal from './components/modal/news/NewsEditModal.vue';

export default {
    name: 'News',
    components: {
        NewsTable,
        HeaderHero,
        NewsWidget,
        NewsFilter,
        NewsCreateModal,
        NewsViewModal,
        NewsEditModal
    },
    data() {
        return {
            showCreateModal: false,
            showViewModal: false,
            showEditModal: false,
            selectedNews: null,
            saving: false,
            filters: {
                search: '',
                startDate: null,
                endDate: null,
                quickRange: 'All Time'
            }
        }
    },
    created() {
        this.fetchNews();
    },
    computed: {
        newsItems() {
            return this.$store.getters['news/news'] || [];
        }
    },
    methods: {
        async fetchNews() {
            try {
                await this.$store.dispatch('news/get');
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        },
        onAddNews() {
            this.showCreateModal = true;
        },
        async handleSaveNews(newNews) {
            if (this.saving) return;
            this.saving = true;
            let createdNews = null;
            try {
                // 1. Create the news entry
                const response = await this.$store.dispatch('news/create', {
                    title: newNews.title,
                    description: newNews.description
                });
                
                createdNews = response.data.data;

                // 2. Upload images if they exist
                if (newNews._images && newNews._images.length > 0) {
                    const formData = new FormData();
                    formData.append('_id', createdNews._id);
                    if (newNews.newCoverIndex !== undefined && newNews.newCoverIndex !== null) {
                        formData.append('newCoverIndex', newNews.newCoverIndex);
                    }
                    newNews._images.forEach(image => {
                        formData.append('images', image);
                    });
                    
                    await this.$store.dispatch('news/upload', formData);
                }

                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'News article created successfully.' : 'สร้างข่าวสารเรียบร้อยแล้ว',
                    variant: 'success'
                });

                await this.fetchNews();
                this.showCreateModal = false;
            } catch (error) {
                console.error('Error creating news:', error);
                if (createdNews) {
                    this.selectedNews = createdNews;
                    this.showCreateModal = false;
                    this.showEditModal = true;
                }
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: createdNews
                        ? (this.$i18n.locale === 'en' ? 'News was created, but image upload failed. Attach the images again to this existing article.' : 'สร้างข่าวแล้ว แต่อัปโหลดภาพไม่สำเร็จ กรุณาแนบภาพใหม่ในข่าวเดิมนี้')
                        : error.response?.data?.message || (this.$i18n.locale === 'en' ? 'Failed to create news.' : 'ไม่สามารถสร้างข่าวสารได้'),
                    variant: 'danger'
                });
            } finally {
                this.saving = false;
            }
        },
        handleViewNews(news) {
            this.selectedNews = news;
            this.showViewModal = true;
        },
        handleEditNews(news) {
            this.selectedNews = news;
            this.showEditModal = true;
        },
        handleEditNewsFromView(news) {
            this.showViewModal = false;
            this.handleEditNews(news);
        },
        async handleUpdateNews(updatedNews) {
            if (this.saving) return;
            this.saving = true;
            try {
                // 1. Update news details
                await this.$store.dispatch('news/update', {
                    _id: updatedNews._id,
                    title: updatedNews.title,
                    description: updatedNews.description,
                    images: updatedNews.images
                });
                
                // 2. Upload new images if any
                if (updatedNews._images && updatedNews._images.length > 0) {
                    const formData = new FormData();
                    formData.append('_id', updatedNews._id);
                    if (updatedNews.newCoverIndex !== undefined && updatedNews.newCoverIndex !== null) {
                        formData.append('newCoverIndex', updatedNews.newCoverIndex);
                    }
                    updatedNews._images.forEach(image => {
                        formData.append('images', image);
                    });
                    
                    await this.$store.dispatch('news/upload', formData);
                }

                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Success' : 'สำเร็จ',
                    message: this.$i18n.locale === 'en' ? 'News article updated successfully.' : 'อัปเดตข่าวสารเรียบร้อยแล้ว',
                    variant: 'success'
                });

                await this.fetchNews();
                this.showEditModal = false;
            } catch (error) {
                console.error('Error updating news:', error);
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Error' : 'ข้อผิดพลาด',
                    message: error.response?.data?.message || (this.$i18n.locale === 'en' ? 'Failed to update news.' : 'ไม่สามารถอัปเดตข่าวสารได้'),
                    variant: 'danger'
                });
            } finally {
                this.saving = false;
            }
        },
        async handleDeleteNews(news) {
            const title = this.getName(this.$i18n.locale, news);
            const confirmMsg = this.$i18n.locale === 'en'
                ? `Are you sure you want to delete news article "${title}"?`
                : `คุณแน่ใจหรือว่าต้องการลบข่าวสาร "${title}"?`;
            
            if (!confirm(confirmMsg)) return;

            try {
                await this.$store.dispatch('news/delete', { _id: news._id });
                this.fetchNews();
                this.$store.commit('dialog/showToast', {
                    title: this.$i18n.locale === 'en' ? 'Deleted' : 'ลบแล้ว',
                    message: this.$i18n.locale === 'en' 
                        ? `News article "${title}" has been removed.`
                        : `ลบข่าวสาร "${title}" เรียบร้อยแล้ว`,
                    variant: 'info'
                });
            } catch (error) {
                console.error('Error deleting news:', error);
            }
        },
        getName(lang, item) {
            if (!item) return 'N/A';
            if (typeof item === 'string') return item;
            
            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const nameObj = titleField.find(n => n.key === lang);
                const firstVal = titleField[0] ? titleField[0].value : 'N/A';
                return nameObj ? nameObj.value : firstVal;
            }
            return 'N/A';
        },
        handleExport() {
            if (this.$refs.adminTable) {
                this.$refs.adminTable.exportExcel();
            }
        }
    }
}
</script>

<style scoped>
.news-dashboard {
    padding-bottom: 2rem;
    position: relative;
    overflow: visible !important;
}

@media (max-width: 575.98px) {
    .news-dashboard {
        padding-bottom: 1rem;
    }
}
</style>
