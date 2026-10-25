// Lets a buyer cancel their own unpaid order (the artwork goes back on sale).
export default {
  data: () => ({ cancellingOrder: false }),
  methods: {
    async cancelOwnOrder(item, refresh) {
      if (this.cancellingOrder || !item || !item._id) return;
      const en = this.$i18n.locale === 'en';
      const title = this.getName ? (this.getName(this.$i18n.locale, item.artwork && item.artwork[0]) || '') : '';
      const confirmed = confirm(en
        ? `Cancel this order${title ? ` (${title})` : ''}? The artwork will be released for other buyers. This cannot be undone.`
        : `ยกเลิกคำสั่งซื้อนี้${title ? ` (${title})` : ''}? ผลงานจะถูกปล่อยให้ผู้อื่นสั่งซื้อได้ และไม่สามารถย้อนกลับได้`);
      if (!confirmed) return;
      try {
        this.cancellingOrder = true;
        await this.$store.dispatch('order/cancel', item._id);
        this.$store.commit('dialog/showToast', {
          title: en ? 'Order cancelled' : 'ยกเลิกคำสั่งซื้อแล้ว',
          message: en ? 'The artwork is available to other buyers again.' : 'ผลงานกลับมาให้ผู้อื่นสั่งซื้อได้อีกครั้ง',
          variant: 'success'
        });
        if (refresh) await refresh();
      } catch (error) {
        console.error('Cancel order failed:', error);
        this.$store.commit('dialog/showToast', {
          title: en ? 'Could not cancel' : 'ยกเลิกไม่สำเร็จ',
          message: en ? 'The order may already be paid or expired. Refresh and check your order history.' : 'คำสั่งซื้ออาจชำระเงินแล้วหรือหมดเวลา กรุณารีเฟรชและตรวจสอบประวัติคำสั่งซื้อ',
          variant: 'danger'
        });
        if (refresh) await refresh().catch(() => {});
      } finally {
        this.cancellingOrder = false;
      }
    }
  }
};
