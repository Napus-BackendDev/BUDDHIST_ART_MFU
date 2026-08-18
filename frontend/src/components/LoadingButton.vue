<template>
    <CButton
        v-bind="$attrs"
        v-on="$listeners"
        :disabled="disabled || loading"
        class="loading-button"
    >
        <CSpinner v-if="loading" size="sm" class="mr-2" />
        <span v-if="loading && loadingText">{{ loadingText }}</span>
        <slot v-else />
    </CButton>
</template>

<script>
export default {
    name: 'LoadingButton',
    inheritAttrs: false,
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        loadingText: {
            type: String,
            default: ''
        }
    }
}
</script>
