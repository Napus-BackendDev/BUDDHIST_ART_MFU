<template>
    <div class="user-news bg-white min-vh-100">
        <CContainer class="py-5">
            <!-- Header -->
            <div class="text-center mb-5">
                <h6 class="text-danger font-weight-bold text-uppercase small mb-2" style="letter-spacing: 2px;">The
                    Journal</h6>
                <h1 class="display-4 font-weight-bold mb-3" style="color: #2c3e50;">Latest News & Stories</h1>
                <p class="lead text-muted mx-auto" style="max-width: 600px;">
                    Stay updated with the latest exhibitions, artist interviews, and insights from the art world.
                </p>
            </div>

            <!-- News Grid -->
            <CRow>
                <CCol md="4" class="mb-5" v-for="news in newsList" :key="news.id">
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

            <!-- Load More -->
            <div class="text-center mt-4">
                <CButton color="outline-dark" shape="pill" class="px-5 py-2 font-weight-bold btn-load-more">Load More
                    Articles</CButton>
            </div>
        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'UserNews',
    data() {
        return {
            newsList: [
                {
                    id: 1,
                    category: 'Exhibition',
                    date: 'June 15, 2024',
                    author: 'Elena Rodriguez',
                    title: 'Upcoming Exhibition: Colors of Summer',
                    summary: 'Join us for an immersive experience featuring vibrant works from emerging contemporary artists. The exhibition explores the relationship between color...',
                    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 2,
                    category: 'Interview',
                    date: 'May 28, 2024',
                    author: 'David Chen',
                    title: 'Artist Spotlight: Sarah Jenkins',
                    summary: 'We sat down with Sarah Jenkins to discuss her unique approach to texture and how her background in architecture influences her structured yet fluid compositions.',
                    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: 3,
                    category: 'Trends',
                    date: 'May 10, 2024',
                    author: 'Marcus Thorne',
                    title: 'The Evolution of Abstract Art in 2024',
                    summary: 'From digital integration to sustainable materials, we explore the defining trends that are shaping the abstract art landscape this year and what collectors...',
                    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                }
            ]
        }
    }
}
</script>

<style scoped>
.user-news {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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

.btn-load-more:hover {
    background-color: #343a40;
    color: #fff;
}
</style>
