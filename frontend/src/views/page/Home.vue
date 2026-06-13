<template>
    <div>
        <SectionHeroHome />
        <SectionSocialProof />
        <SectionFeaturedHome />
        <SectionCatalog />
        <SectionNews />
        <SectionAboutHome />
    </div>
</template>

<script>
import SectionHeroHome from './components/SectionHeroHome.vue';
import SectionSocialProof from './components/SectionSocialProof.vue';
import SectionFeaturedHome from './components/SectionFeaturedHome.vue';
import SectionCatalog from './components/SectionCatalog.vue';
import SectionNews from './components/SectionNews.vue';
import SectionAboutHome from './components/SectionAboutHome.vue';

export default {
    name: 'UserIndex',
    components: {
        SectionHeroHome,
        SectionSocialProof,
        SectionFeaturedHome,
        SectionCatalog,
        SectionNews,
        SectionAboutHome
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
