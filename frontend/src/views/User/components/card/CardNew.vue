<template>
    <CRow>
        <CCol md="4" class="mb-5" v-for="news in newsList" :key="news._id">
            <CCard class="news-card h-100 border-0">
                <!-- Image with Badge -->
                <div class="position-relative mb-3 rounded-lg overflow-hidden card-img-container">
                    <div class="card-img-bg" :style="{ backgroundImage: `url(${news.image})` }"></div>
                    <span
                        class="position-absolute top-0 left-0 m-3 badge badge-light text-uppercase font-weight-bold px-3 py-2 shadow-sm"
                        style="font-size: 0.7rem; letter-spacing: 1px;">{{ news.category }}</span>
                </div>

                <!-- Content -->
                <CCardBody class="news-content p-0">
                    <div class="d-flex align-items-center text-muted small mb-2 font-weight-bold"
                        style="font-size: 0.75rem;">
                        <span class="mr-3">
                            <CIcon name="cil-calendar" class="text-danger mr-1" size="sm" /> {{ news.date }}
                        </span>
                        <span>
                            <CIcon name="cil-user" class="text-danger mr-1" size="sm" /> {{ news.author }}
                        </span>
                    </div>

                    <h4 class="font-weight-bold mb-2 text-dark">{{ news.title }}</h4>
                    <p class="text-muted small mb-3" style="line-height: 1.6;">{{ news.summary }}</p>

                    <CLink href="#" class="text-danger font-weight-bold text-decoration-none small">
                        Read Article
                        <CIcon name="cil-arrow-right" size="sm" class="ml-1" />
                    </CLink>
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
.card-img-container {
    height: 220px;
    border-radius: 12px;
}

.card-img-bg {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
}

.news-card:hover .card-img-bg {
    transform: scale(1.05);
}
</style>