<template>
    <div class="c-app" :class="{ 'c-dark-theme': $store.state.darkMode }">
        <CWrapper>
            <TheHeaderUser />
            <div class="c-body">
                <main class="c-main">
                    <transition name="fade">
                        <router-view></router-view>
                    </transition>
                </main>
                <TheFooterUser />
            </div>
        </CWrapper>
        <CenterLoading />

        <SignIn />
        <TwoFA />

        <transition name="pending-payment-notice">
            <section
                v-if="shouldShowPendingPaymentNotice"
                class="pending-payment-notice"
                role="alert"
                aria-live="polite"
            >
                <button
                    type="button"
                    class="pending-payment-notice__content"
                    @click="goToPendingOrders"
                >
                    <span class="pending-payment-notice__icon" aria-hidden="true">
                        <CIcon name="cil-bell" size="lg" />
                    </span>
                    <span class="pending-payment-notice__copy">
                        <strong>{{ pendingPaymentTitle }}</strong>
                        <span>{{ pendingPaymentMessage }}</span>
                    </span>
                    <span class="pending-payment-notice__action">
                        {{ $i18n.locale === 'en' ? 'View orders' : 'ไปที่คำสั่งซื้อ' }}
                        <CIcon name="cil-arrow-right" class="ml-1" aria-hidden="true" />
                    </span>
                </button>
                <button
                    type="button"
                    class="pending-payment-notice__dismiss"
                    :aria-label="$i18n.locale === 'en' ? 'Dismiss payment reminder' : 'ปิดแจ้งเตือนการชำระเงิน'"
                    @click="dismissPendingPaymentNotice"
                >
                    <CIcon name="cil-x" size="sm" aria-hidden="true" />
                </button>
            </section>
        </transition>
    </div>
</template>

<script>
import TheHeaderUser from './TheHeader'
import TheFooterUser from './TheFooterUser'
import CenterLoading from "@/projects/components/dialog/CenterLoading.vue";
import SignIn from "@/projects/components/dialog/SignIn.vue";
import TwoFA from "@/projects/components/dialog/TwoFA.vue";

export default {
    name: 'TheContainerUser',
    components: {
        TwoFA,
        SignIn,
        CenterLoading,
        TheHeaderUser,
        TheFooterUser
    },
    data() {
        return {
            noticeDismissed: false,
            pendingPaymentCheckInFlight: false
        }
    },
    computed: {
        userId() {
            return this.$store.getters['auth/userId'];
        },
        allOrders() {
            return this.$store.getters['order/orders'] || [];
        },
        pendingPaymentOrders() {
            if (!this.userId || !this.allOrders) return [];

            return this.allOrders.filter(order => {
                return this.isCurrentUserOrder(order) && this.isPendingPaymentOrder(order);
            });
        },
        pendingPaymentCount() {
            return this.pendingPaymentOrders.length;
        },
        pendingPaymentTitle() {
            if (this.$i18n.locale === 'en') {
                return this.pendingPaymentCount === 1
                    ? 'You have 1 unpaid order'
                    : `You have ${this.pendingPaymentCount} unpaid orders`;
            }

            return `คุณมีคำสั่งซื้อที่ยังไม่ได้ชำระเงิน ${this.pendingPaymentCount} รายการ`;
        },
        pendingPaymentMessage() {
            return this.$i18n.locale === 'en'
                ? 'Open your order table to upload a slip and complete payment.'
                : 'กดเพื่อไปตารางคำสั่งซื้อ แล้วอัปโหลดสลิปเพื่อชำระเงินให้เสร็จสมบูรณ์';
        },
        shouldShowPendingPaymentNotice() {
            return Boolean(
                this.userId &&
                this.pendingPaymentCount > 0 &&
                !this.noticeDismissed &&
                this.$route.path !== '/user/order'
            );
        }
    },
    watch: {
        userId: {
            immediate: true,
            handler(newUserId) {
                if (newUserId) {
                    this.fetchPendingPaymentOrders();
                }
            }
        },
        '$route.path'() {
            if (this.userId && this.$route.path !== '/user/order') {
                this.fetchPendingPaymentOrders();
            }
        },
        pendingPaymentCount(newCount, oldCount) {
            if (newCount !== oldCount) {
                this.noticeDismissed = false;
            }
        }
    },
    methods: {
        async fetchPendingPaymentOrders() {
            if (!this.userId || this.pendingPaymentCheckInFlight) return;

            this.pendingPaymentCheckInFlight = true;
            try {
                await this.$store.dispatch('order/get', {});
            } catch (error) {
                if (!error || !error.response || error.response.status !== 401) {
                    console.error('Pending payment reminder check failed:', error);
                }
            } finally {
                this.pendingPaymentCheckInFlight = false;
            }
        },
        isCurrentUserOrder(order) {
            if (!order || !this.userId) return false;
            if (order.user && typeof order.user === 'object') {
                return order.user._id === this.userId;
            }
            return order.user === this.userId;
        },
        isPendingPaymentOrder(order) {
            if (!order || order.image) return false;

            const statusText = [
                this.getName('en', order.status),
                this.getName('th', order.status)
            ].join(' ').toLowerCase();

            const closedTerms = [
                'delivered',
                'approved',
                'success',
                'completed',
                'complete',
                'cancelled',
                'canceled',
                'rejected',
                'fail',
                'failed',
                'เสร็จสิ้น',
                'อนุมัติ',
                'สำเร็จ',
                'ยืนยันข้อมูล',
                'ยกเลิก',
                'ไม่นุมัติ',
                'ไม่อนุมัติ'
            ];

            return !closedTerms.some(term => statusText.includes(term));
        },
        goToPendingOrders() {
            this.noticeDismissed = true;
            if (this.$route.path !== '/user/order') {
                this.$router.push('/user/order').catch(err => {
                    if (err.name !== 'NavigationDuplicated') {
                        throw err;
                    }
                });
            }
        },
        dismissPendingPaymentNotice() {
            this.noticeDismissed = true;
        }
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

/* Header Offset for Fixed Header */
.c-body {
    padding-top: 125px; /* Tier 1 (75px) + Tier 2 (50px) */
    transition: padding-top 0.3s ease;
}

.c-main {
    padding-top: 0 !important;
}

.pending-payment-notice {
    position: fixed;
    top: 141px;
    right: 24px;
    z-index: 2030;
    display: flex;
    width: min(440px, calc(100vw - 32px));
    overflow: hidden;
    border: 1px solid rgba(97, 39, 33, 0.16);
    border-radius: 8px;
    background: rgba(255, 252, 246, 0.96);
    box-shadow: 0 16px 42px rgba(55, 36, 24, 0.18);
    backdrop-filter: blur(10px);
}

.pending-payment-notice__content {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    gap: 12px;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 14px 16px;
    border: 0;
    background: transparent;
    color: #2f241d;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pending-payment-notice__content:hover {
    background: rgba(212, 175, 55, 0.08);
}

.pending-payment-notice__content:focus-visible,
.pending-payment-notice__dismiss:focus-visible {
    outline: 3px solid rgba(212, 175, 55, 0.45);
    outline-offset: -3px;
}

.pending-payment-notice__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: linear-gradient(135deg, #612721 0%, #9a4b38 100%);
    color: #fff8e6;
    box-shadow: 0 8px 18px rgba(97, 39, 33, 0.22);
}

.pending-payment-notice__copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    line-height: 1.35;
}

.pending-payment-notice__copy strong {
    overflow: hidden;
    color: #2f241d;
    font-size: 0.95rem;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pending-payment-notice__copy span {
    color: #6f6257;
    font-size: 0.82rem;
}

.pending-payment-notice__action {
    display: inline-flex;
    align-items: center;
    color: #612721;
    font-size: 0.82rem;
    font-weight: 800;
    white-space: nowrap;
}

.pending-payment-notice__dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    min-width: 42px;
    border: 0;
    border-left: 1px solid rgba(97, 39, 33, 0.1);
    background: rgba(255, 255, 255, 0.35);
    color: #7b6b5d;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pending-payment-notice__dismiss:hover {
    background: rgba(97, 39, 33, 0.08);
    color: #612721;
}

.pending-payment-notice-enter-active,
.pending-payment-notice-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.pending-payment-notice-enter,
.pending-payment-notice-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@media (max-width: 991.98px) {
    .c-body {
        padding-top: 75px;
    }

    .pending-payment-notice {
        top: 91px;
        right: 16px;
    }
}

@media (max-width: 767.98px) {
    .c-body {
        padding-top: 72px;
    }

    .pending-payment-notice {
        top: 88px;
    }
}

@media (max-width: 575.98px) {
    .pending-payment-notice {
        top: 84px;
        right: 12px;
        left: 12px;
        width: auto;
    }

    .pending-payment-notice__content {
        grid-template-columns: 38px minmax(0, 1fr);
        gap: 10px;
        padding: 12px;
    }

    .pending-payment-notice__icon {
        width: 38px;
        height: 38px;
    }

    .pending-payment-notice__action {
        grid-column: 2;
        justify-self: start;
    }
}
</style>
