<template>
    <CRow>
        <CCol md="6" lg="3" class="mb-5" v-for="news in newsList" :key="news._id">
            <CCard class="news-card border-0 shadow-sm h-100 overflow-hidden">
                <!-- Image Section -->
                <div class="card-img-wrapper position-relative">
                    <div class="card-img-bg" :style="{ backgroundImage: `url(${news.image})` }"></div>
                    <div class="card-img-overlay-custom"></div>
                    <span class="category-badge">{{ news.category }}</span>
                </div>

                <!-- Content Section -->
                <CCardBody class="p-4 d-flex flex-column">
                    <div class="meta-info d-flex align-items-center mb-3">
                        <span class="meta-item date-text">
                            <CIcon name="cil-calendar" size="sm" /> {{ news.date }}
                        </span>
                    </div>

                    <h4 class="news-title mb-3 cursor-pointer" @click="$router.push({ name: 'NewsDetail', params: { id: news._id } })">
                        {{ news.title }}
                    </h4>
                    <p class="news-summary text-muted mb-4">{{ news.summary }}</p>

                    <div class="mt-auto">
                        <CLink :to="{ name: 'NewsDetail', params: { id: news._id } }" class="read-more-btn">
                            <span>Read Article</span>
                            <CIcon name="cil-arrow-right" class="ml-2 arrow-icon" />
                        </CLink>
                    </div>
                </CCardBody>
            </CCard>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: 'CardNew',
    props: {
        newsList: {
            type: Array,
            required: true,
            default: () => []
        }
    }
}
</script>

<style scoped>
.news-card {
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    background: #fff;
    border: none !important;
}

.news-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
}

.card-img-wrapper {
    height: 200px;
    overflow: hidden;
    position: relative;
    margin-top: -1px; /* Bleed up to hide any potential top line */
}

.card-img-bg {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.8s ease;
}

.news-card:hover .card-img-bg {
    transform: scale(1.1);
}

.card-img-overlay-custom {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
}

.category-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    background: rgba(255, 255, 255, 0.95);
    color: #612721;
    padding: 4px 12px;
    border-radius: 50px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    z-index: 2;
}

.meta-info {
    font-size: 0.75rem;
    font-weight: 600;
}

.date-text {
    color: #612721;
    font-weight: 700;
}

.author-text {
    color: #888;
}

.meta-item i {
    margin-right: 4px;
}

.meta-divider {
    width: 4px;
    height: 4px;
    background: #ddd;
    border-radius: 50%;
    margin: 0 8px;
}

.news-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2d3436;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.3s ease;
    min-height: 3rem;
}

.news-card:hover .news-title {
    color: #612721;
}

.news-summary {
    font-size: 0.8rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 1.5rem !important;
}

.read-more-btn {
    display: inline-flex;
    align-items: center;
    color: #612721;
    font-weight: 700;
    text-decoration: none;
    font-size: 0.9rem;
    position: relative;
    padding-bottom: 4px;
}

.read-more-btn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30px;
    height: 2px;
    background: #612721;
    transition: width 0.3s ease;
}

.read-more-btn:hover::after {
    width: 100%;
}

.arrow-icon {
    transition: transform 0.3s ease;
}

.read-more-btn:hover .arrow-icon {
    transform: translateX(5px);
}
</style>