<template>
    <div :class="['text-center', wrapperClass]">
        <h6 v-if="subTitle" class="text-danger font-weight-bold text-uppercase small mb-2" style="letter-spacing: 2px;">
            {{ subTitle }}
        </h6>
        <h1 class="display-4 font-weight-bold mb-3" :style="{ color: titleColor, fontFamily: titleFontFamily }">
            {{ title }}
        </h1>
        <p :class="['text-muted mx-auto', descriptionClass]" style="max-width: 600px;">
            {{ description }}
        </p>
    </div>
</template>

<script>
export default {
    name: 'PageHeader',
    props: {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        subTitle: {
            type: String,
            default: ''
        },
        titleColor: {
            type: String,
            default: '#1a202c'
        },
        titleFontFamily: {
            type: String,
            default: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        wrapperClass: {
            type: String,
            default: 'py-5'
        },
        descriptionClass: {
            type: String,
            default: ''
        }
    }
}
</script>
