<template>
    <ArtworkCreateModal
        :show="show"
        :loading="loading"
        :artwork="artwork"
        :initial-artist-id="artistId"
        mode="edit"
        @update:show="$emit('update:show', $event)"
        @save="$emit('save', $event)"
    />
</template>

<script>
import ArtworkCreateModal from './ArtworkCreateModal.vue';

export default {
    name: 'ArtworkEditModal',
    components: {
        ArtworkCreateModal
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        artwork: {
            type: Object,
            default: null
        }
    },
    computed: {
        artistId() {
            if (!this.artwork || !this.artwork.artist) return '';
            return this.artwork.artist._id || this.artwork.artist;
        }
    }
};
</script>
