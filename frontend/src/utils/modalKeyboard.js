// CoreUI 3.2.11 compares numeric keyCode with the string '27'.
// Extend the registered component so every application modal shares the fix.
export function trapFocusTab(event, dialog) {
  if (!dialog) return
  const controls = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => {
    if (element.tabIndex < 0) return false
    for (let node = element; node && node !== dialog; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (node.hidden || style.display === 'none' || style.visibility === 'hidden') return false
    }
    return true
  })
  const first = controls[0], last = controls[controls.length - 1]
  const active = document.activeElement
  if (!first || !dialog.contains(active) || active === dialog || (event.shiftKey ? active === first : active === last)) {
    event.preventDefault()
    const next = event.shiftKey ? last || dialog : first || dialog
    next.focus()
  }
}

export default function installModalKeyboard(Vue) {
  const BaseModal = Vue.component('CModal')
  const opened = []
  Vue.component('CModal', {
    extends: BaseModal,
    mounted() {
      if (this.visible) this.captureModalFocus()
    },
    watch: {
      visible(value) {
        if (value) this.captureModalFocus()
        else this.restoreModalFocus()
      }
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.hideEsc)
      this.restoreModalFocus()
    },
    methods: {
      modalDialog() {
        return this.$el && this.$el.querySelector('[role="dialog"]')
      },
      captureModalFocus() {
        if (opened.includes(this)) return
        this._modalOpener = document.activeElement
        this._modalParent = opened[opened.length - 1]
        opened.push(this)
        this.$nextTick(() => {
          if (!this.visible || opened[opened.length - 1] !== this) return
          const dialog = this.modalDialog()
          if (!dialog) return
          dialog.setAttribute('aria-modal', 'true')
          const title = dialog.querySelector('.modal-title')
          if (title && title.textContent.trim()) {
            if (!title.id) title.id = `app-modal-title-${this._uid}`
            dialog.setAttribute('aria-labelledby', title.id)
          }
          dialog.focus()
        })
      },
      restoreModalFocus() {
        const index = opened.indexOf(this)
        if (index < 0) return
        const top = index === opened.length - 1
        opened.splice(index, 1)
        if (!top) return
        let modal = this
        while (modal) {
          const target = modal._modalOpener
          const parentDialog = target && target.closest && target.closest('[role="dialog"]')
          if (target && target.isConnected && (!parentDialog || opened.some(item => item.modalDialog() === parentDialog))) {
            target.focus()
            return
          }
          modal = modal._modalParent
        }
      },
      trapModalTab(event) {
        trapFocusTab(event, this.modalDialog())
      },
      hideEsc(event) {
        if (!this.visible || opened[opened.length - 1] !== this) return
        if (event.key === 'Tab' || event.keyCode === 9) {
          this.trapModalTab(event)
          return
        }
        const shouldHide = typeof this.onKey === 'function'
          ? this.onKey('', event.keyCode) !== false
          : event.key === 'Escape' || event.keyCode === 27
        if (shouldHide) this.hide(event)
      }
    }
  })
}
