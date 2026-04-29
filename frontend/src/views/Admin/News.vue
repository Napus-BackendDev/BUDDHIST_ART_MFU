<template>
    <div class="news-dashboard">
        <HeaderHero :title="$i18n.locale === 'en' ? 'News Management' : 'จัดการข่าวสาร'" :description="$i18n.locale === 'en' ? 'Manage your news articles, announcements, and updates for the community.' : 'จัดการบทความข่าว ประกาศ และอัปเดตสำหรับชุมชน'" icon="cil-newspaper" :showCreateButton="true" :showExportButton="true" :createButtonText="$i18n.locale === 'en' ? 'Create News' : 'สร้างข่าวสาร'" @create="onAddNews" @export="handleExport" />
        <NewsWidget v-model="filters.status" :items="newsItems" />
        <NewsFilter v-model="filters" :categories="categoriesList" />
        <NewsTable ref="adminTable" :filters="filters" :items="newsItems" @view="handleViewNews" @edit="handleEditNews" @delete="handleDeleteNews" />
        <NewsCreateModal :show.sync="showCreateModal" :categories="categoriesList" @save="handleSaveNews"/>
        <NewsViewModal :show.sync="showViewModal" :news="selectedNews" @edit="handleEditNewsFromView"/>
        <NewsEditModal :show.sync="showEditModal" :news="selectedNews" :categories="categoriesList" @save="handleUpdateNews"/>
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
            filters: {
                search: '',
                category: 'All Categories',
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
        },
        categoriesList() {
            return this.$store.getters['setting/category/categories'] || [];
        }
    },
    methods: {
        async fetchNews() {
            try {
                // Fetch categories and news in parallel
                await Promise.all([
                    this.$store.dispatch('setting/category/get'),
                    this.$store.dispatch('news/get')
                ]);
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        },
        onAddNews() {
            this.showCreateModal = true;
        },
        async handleSaveNews(newNews) {
            try {
                // 1. Create the news entry
                const response = await this.$store.dispatch('news/create', {
                    title: newNews.title,
                    description: newNews.description,
                    category: newNews.category
                });
                
                const createdNews = response.data.data;

                // 2. Upload images if they exist
                if (newNews._images && newNews._images.length > 0) {
                    const formData = new FormData();
                    formData.append('_id', createdNews._id);
                    newNews._images.forEach(image => {
                        formData.append('images', image);
                    });
                    
                    await this.$store.dispatch('news/upload', formData);
                }

                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: 'News article created successfully.',
                    variant: 'success'
                });

                await this.fetchNews();
                this.showCreateModal = false;
            } catch (error) {
                console.error('Error creating news:', error);
                this.$store.commit('dialog/showToast', {
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to create news.',
                    variant: 'danger'
                });
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
            try {
                // 1. Update news details
                await this.$store.dispatch('news/update', {
                    _id: updatedNews._id,
                    title: updatedNews.title,
                    description: updatedNews.description,
                    category: updatedNews.category,
                    images: updatedNews.images
                });
                
                // 2. Upload new images if any
                if (updatedNews._images && updatedNews._images.length > 0) {
                    const formData = new FormData();
                    formData.append('_id', updatedNews._id);
                    updatedNews._images.forEach(image => {
                        formData.append('images', image);
                    });
                    
                    await this.$store.dispatch('news/upload', formData);
                }

                this.$store.commit('dialog/showToast', {
                    title: 'Success',
                    message: 'News article updated successfully.',
                    variant: 'success'
                });

                await this.fetchNews();
                this.showEditModal = false;
            } catch (error) {
                console.error('Error updating news:', error);
                this.$store.commit('dialog/showToast', {
                    title: 'Error',
                    message: error.response?.data?.message || 'Failed to update news.',
                    variant: 'danger'
                });
            }
        },
        async handleDeleteNews(news) {
            try {
                await this.$store.dispatch('news/delete', { _id: news._id });
                this.fetchNews();
                this.$store.commit('dialog/showToast', {
                    title: 'Deleted',
                    message: `News article has been removed.`,
                    variant: 'info'
                });
            } catch (error) {
                console.error('Error deleting news:', error);
            }
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
</style>
