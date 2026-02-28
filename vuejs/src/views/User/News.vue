<template>
    <div class="user-news bg-white min-vh-100">
        <CContainer class="py-5">
            <!-- Header -->
            <PageHeader subTitle="The Journal" title="Latest News & Stories" titleColor="#2c3e50"
                description="Stay updated with the latest exhibitions, artist interviews, and insights from the art world."
                wrapperClass="mb-5" descriptionClass="lead" />

            <!-- News Grid -->
            <CardNew :newsList="newsList" />

            <!-- Load More -->
            <div class="text-center mt-4">
                <CButton color="outline-dark" shape="pill" class="px-5 py-2 font-weight-bold btn-load-more">Load More
                    Articles</CButton>
            </div>
        </CContainer>
    </div>
</template>

<script>
import PageHeader from './components/Util/Header.vue'
import CardNew from './components/card/CardNew.vue'

export default {
    name: 'UserNews',
    components: {
        PageHeader,
        CardNew
    },
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

.btn-load-more:hover {
    background-color: #343a40;
    color: #fff;
}
</style>
