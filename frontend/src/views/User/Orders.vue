<template>
    <div class="track-order-page bg-white min-vh-100 py-5">
        <CContainer>

            <!-- Search Form Section -->
            <div v-if="!showResult" class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
                <CCol md="8" lg="6" class="text-center">
                    <h1 class="display-4 font-weight-bold mb-3" style="color: #2c3e50;">Track Your Order</h1>
                    <p class="text-muted lead mb-5">
                        Enter your order number and email address to find the status of your shipment.
                    </p>

                    <CCard class="border-0 shadow-lg overflow-hidden track-card text-left">
                        <CCardHeader class="border-0 p-0"
                            style="height: 8px; background: linear-gradient(90deg, #E55B5B, #F9D976);"></CCardHeader>
                        <CCardBody class="p-5">
                            <CRow>
                                <CCol md="6" class="mb-4">
                                    <label class="font-weight-bold text-muted small">Order Number</label>
                                    <CInput placeholder="e.g. 112-345678" class="shadow-none input-field mb-0"
                                        style="height: 50px;" v-model="search.orderNumber">
                                        <template #prepend-content>
                                            <CIcon name="cil-box" class="text-muted" />
                                        </template>
                                    </CInput>
                                </CCol>
                                <CCol md="6" class="mb-4">
                                    <label class="font-weight-bold text-muted small">Email Address</label>
                                    <CInput placeholder="email@example.com" class="shadow-none input-field mb-0"
                                        style="height: 50px;" v-model="search.email">
                                        <template #prepend-content>
                                            <CIcon name="cil-envelope-closed" class="text-muted" />
                                        </template>
                                    </CInput>
                                </CCol>
                            </CRow>

                            <CButton @click="trackOrder" block color="danger" size="lg"
                                class="py-3 font-weight-bold shadow-sm btn-track"
                                style="background-color: #D9534F; border: none;">
                                Track Order
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </div>

            <!-- Result View Section -->
            <CRow v-else class="justify-content-center">
                <CCol lg="10">
                    <div class="mb-4">
                        <CButton color="link" class="pl-0 text-muted" @click="showResult = false">
                            <CIcon name="cil-arrow-left" /> Back to Search
                        </CButton>
                    </div>

                    <CCard class="border-0 shadow-sm rounded-lg overflow-hidden">
                        <CCardBody class="p-5">
                            <!-- Header -->
                            <div class="d-flex justify-content-between align-items-start mb-5 flex-wrap">
                                <div>
                                    <h2 class="font-weight-bold mb-2">Order #{{ search.orderNumber || 'a' }} <span
                                            class="badge badge-success bg-light text-success border border-success ml-2"
                                            style="font-weight: 600;">In Transit</span></h2>
                                    <p class="text-muted mb-0">Expected Delivery: <span
                                            class="font-weight-bold text-dark">Oct 24,
                                            2023</span></p>
                                </div>
                                <div class="btn-group mt-3 mt-md-0">
                                    <CButton color="outline-secondary" class="mr-2 rounded d-flex align-items-center">
                                        <CIcon name="cil-file" size="sm" class="mr-2" /> Bill
                                    </CButton>
                                    <CButton color="outline-secondary" class="mr-2 rounded d-flex align-items-center">
                                        <CIcon name="cil-bookmark" size="sm" class="mr-2" /> Certificate
                                    </CButton>
                                    <CButton color="outline-secondary" class="rounded d-flex align-items-center">
                                        <CIcon name="cil-description" size="sm" class="mr-2" /> Reservation Slip
                                    </CButton>
                                </div>
                            </div>

                            <!-- Progress Bar (Stepper) -->
                            <div class="position-relative mb-5 px-4">
                                <CProgress height="4px" class="mb-3" style="background-color: #e9ecef;">
                                    <CProgressBar color="danger" :value="65" />
                                </CProgress>

                                <div class="d-flex justify-content-between position-absolute w-100"
                                    style="top: -14px; left: 0;">

                                    <!-- Step 1: Ordered -->
                                    <div class="text-center">
                                        <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                                            style="width: 32px; height: 32px; border: 4px solid #fff; box-shadow: 0 0 0 1px #dc3545;">
                                            <CIcon name="cil-check" size="sm" />
                                        </div>
                                        <small class="font-weight-bold">Ordered</small>
                                    </div>

                                    <!-- Step 2: Processing -->
                                    <div class="text-center">
                                        <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                                            style="width: 32px; height: 32px; border: 4px solid #fff; box-shadow: 0 0 0 1px #dc3545;">
                                            <CIcon name="cil-check" size="sm" />
                                        </div>
                                        <small class="font-weight-bold">Processing</small>
                                    </div>

                                    <!-- Step 3: Shipped -->
                                    <div class="text-center">
                                        <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                                            style="width: 32px; height: 32px; border: 4px solid #fff; box-shadow: 0 0 0 1px #dc3545;">
                                            <CIcon name="cil-truck" size="sm" />
                                        </div>
                                        <small class="font-weight-bold">Shipped</small>
                                    </div>

                                    <!-- Step 4: Delivered -->
                                    <div class="text-center">
                                        <div class="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center mx-auto mb-2"
                                            style="width: 32px; height: 32px; border: 4px solid #fff; box-shadow: 0 0 0 1px #e9ecef;">
                                            <CIcon name="cil-check" size="sm" />
                                        </div>
                                        <small class="text-muted">Delivered</small>
                                    </div>
                                </div>
                            </div>

                            <CRow class="mt-5 pt-4">
                                <!-- Shipment Activity -->
                                <CCol md="6" class="mb-4">
                                    <h5 class="font-weight-bold mb-4">Shipment Activity</h5>
                                    <div class="timeline border-left pl-4 ml-2" style="border-color: #e9ecef;">
                                        <div class="position-relative mb-4">
                                            <div class="position-absolute bg-danger rounded-circle"
                                                style="width: 12px; height: 12px; left: -27px; top: 5px;"></div>
                                            <p class="font-weight-bold mb-0">Arrived at Sort Facility</p>
                                            <small class="text-muted d-block">Oct 21, 09:41 AM</small>
                                            <small class="text-muted">New York, NY</small>
                                        </div>
                                        <div class="position-relative mb-4">
                                            <div class="position-absolute bg-light border rounded-circle"
                                                style="width: 12px; height: 12px; left: -27px; top: 5px;"></div>
                                            <p class="font-weight-bold mb-0">Departed from Facility</p>
                                            <small class="text-muted d-block">Oct 20, 06:15 PM</small>
                                            <small class="text-muted">Los Angeles, CA</small>
                                        </div>
                                        <div class="position-relative">
                                            <div class="position-absolute bg-light border rounded-circle"
                                                style="width: 12px; height: 12px; left: -27px; top: 5px;"></div>
                                            <p class="font-weight-bold mb-0">Order Processed</p>
                                            <small class="text-muted d-block">Oct 19, 02:20 PM</small>
                                            <small class="text-muted">Ready for UPS</small>
                                        </div>
                                    </div>
                                </CCol>

                                <!-- Delivery Details -->
                                <CCol md="6">
                                    <h5 class="font-weight-bold mb-4">Delivery Details</h5>
                                    <div class="bg-light p-4 rounded-lg">
                                        <div class="d-flex mb-4">
                                            <div class="mr-3">
                                                <div class="bg-white rounded-circle p-2 shadow-sm text-danger">
                                                    <CIcon name="cil-location-pin" />
                                                </div>
                                            </div>
                                            <div>
                                                <h6 class="font-weight-bold mb-1">Shipping Address</h6>
                                                <p class="text-muted small mb-0">
                                                    123 Art Avenue, Gallery District<br>
                                                    New York, NY 10012<br>
                                                    United States
                                                </p>
                                            </div>
                                        </div>
                                        <div class="d-flex">
                                            <div class="mr-3">
                                                <div class="bg-white rounded-circle p-2 shadow-sm text-danger">
                                                    <CIcon name="cil-clock" />
                                                </div>
                                            </div>
                                            <div>
                                                <h6 class="font-weight-bold mb-1">Estimated Delivery</h6>
                                                <p class="text-muted small mb-0">
                                                    Thursday, Oct 24<br>
                                                    By End of Day
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CCol>
                            </CRow>

                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

        </CContainer>
    </div>
</template>

<script>
export default {
    name: 'Orders',
    data() {
        return {
            showResult: false,
            search: {
                orderNumber: '',
                email: ''
            }
        }
    },
    methods: {
        trackOrder() {
            // In a real app, validate and fetch data here
            this.showResult = true;
        }
    }
}
</script>

<style scoped>
.track-order-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.track-card {
    border-radius: 15px;
}

.input-group-text {
    border-color: #e4e7ea;
}

::v-deep .input-field {
    border-color: #e4e7ea;
}

::v-deep .input-field:focus {
    box-shadow: none;
    border-color: #e4e7ea;
}

.btn-track {
    transition: transform 0.2s;
}

.btn-track:hover {
    transform: translateY(-2px);
    background-color: #c9302c !important;
}

/* Custom Input Styles to match previous design */
::v-deep .input-group-text {
    background-color: #fff;
    border-right: 0;
}

::v-deep .input-field {
    border-left: 0;
}
</style>
