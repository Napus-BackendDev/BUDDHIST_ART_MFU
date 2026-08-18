<template>
    <div>
        <SectionHeroHome />
        <SectionFeaturedHome />
        <!-- hidden per client 2026-07: user testimonials / voice section (เสียงตอบรับจากผู้ใช้งาน) removed from Home -->
        <!-- <SectionTestimonials /> -->
        <SectionStudentShowcase />
        <!-- <SectionSubmissionReviews /> -->
        <SectionNews />
    </div>
</template>

<script>
import SectionHeroHome from './components/SectionHeroHome.vue';
import SectionFeaturedHome from './components/SectionFeaturedHome.vue';
import SectionStudentShowcase from './components/SectionStudentShowcase.vue';
import SectionSubmissionReviews from './components/SectionSubmissionReviews.vue';
import SectionTestimonials from './components/SectionTestimonials.vue';
import SectionNews from './components/SectionNews.vue';

export default {
    name: 'UserIndex',
    components: {
        SectionHeroHome,
        SectionFeaturedHome,
        SectionStudentShowcase,
        SectionSubmissionReviews,
        SectionTestimonials,
        SectionNews
    },
    data() {
        return {}
    },
    computed: {},
    methods: {}
}
</script>

<style scoped>
.home-section {
    padding: 6rem 0;
    background: linear-gradient(to bottom, #FFFFFF 0%, #FFF5F5 100%);
    min-height: 80vh;
}

.feature-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
}

@media (max-width: 991.98px) {
    .col-custom-grid {
        flex: 0 0 50%;
        max-width: 50%;
    }
}

@media (max-width: 575.98px) {
    .col-custom-grid {
        flex: 0 0 100%;
        max-width: 100%;
    }
}
</style>
