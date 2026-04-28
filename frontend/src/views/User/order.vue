<template>
  <div class="user-orders-view min-vh-100 py-4 bg-light-premium">
    <CContainer class="profile-container-wide">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-end mb-4 flex-wrap">
        <div>
          <h2 class="font-weight-bold text-dark section-title">My Orders</h2>
          <div class="title-separator-sm mb-3"></div>
          <p class="text-muted mb-0">Track your past purchases and delivery status.</p>
        </div>
        <CButton color="dark" variant="outline" shape="pill" class="btn-sm font-weight-bold shadow-sm hover-lift mt-3 mt-md-0" @click="$router.push('/user')">
          <CIcon name="cil-arrow-left" class="mr-2" /> Back to Dashboard
        </CButton>
      </div>

      <!-- Orders List Card -->
      <CCard class="border-0 shadow-premium rounded-xl overflow-hidden mt-4">
        <CCardHeader class="bg-white border-bottom-0 pt-4 pb-3 px-4 px-md-5 d-flex justify-content-between align-items-center flex-wrap">
          <h5 class="font-weight-bold text-dark mb-0">Order History</h5>
          
          <div class="d-flex align-items-center mt-3 mt-sm-0">
             <div class="search-box mr-3">
               <CInput 
                 placeholder="Search orders..." 
                 class="custom-search-input mb-0"
               >
                 <template #prepend-content><CIcon name="cil-search"/></template>
               </CInput>
             </div>
          </div>
        </CCardHeader>

        <CCardBody class="p-0">
          <CDataTable
            :items="orders"
            :fields="fields"
            table-filter
            items-per-page-select
            :items-per-page="5"
            hover
            sorter
            pagination
            class="premium-table"
          >
            <template #orderId="{item}">
              <td class="align-middle">
                <span class="font-weight-bold text-dark">#{{ item.orderId }}</span>
              </td>
            </template>
            
            <template #date="{item}">
              <td class="align-middle text-muted">
                {{ item.date }}
              </td>
            </template>

            <template #total="{item}">
              <td class="align-middle font-weight-bold text-success">
                ฿{{ item.total.toLocaleString() }}
              </td>
            </template>

            <template #status="{item}">
              <td class="align-middle">
                <CBadge :color="getBadge(item.status)" class="badge-premium-status px-3 py-2">
                  {{ item.status }}
                </CBadge>
              </td>
            </template>

            <template #action="{item}">
              <td class="align-middle">
                <CButton color="primary" variant="outline" size="sm" class="btn-action shadow-sm hover-lift" @click="viewDetails(item)">
                  View Details
                </CButton>
              </td>
            </template>
          </CDataTable>
        </CCardBody>
      </CCard>
    </CContainer>

    <!-- Order Details Modal -->
    <CModal
      title="Order Details"
      :show.sync="showModal"
      size="lg"
      :centered="true"
    >
      <div v-if="selectedOrder" class="p-4 bg-light-empty">
         <CRow class="mb-4">
            <CCol sm="6">
               <h6 class="text-muted text-uppercase mb-1 small font-weight-bold">Order ID</h6>
               <h5 class="font-weight-bold text-dark">#{{ selectedOrder.orderId }}</h5>
            </CCol>
            <CCol sm="6" class="text-sm-right">
               <h6 class="text-muted text-uppercase mb-1 small font-weight-bold">Order Date</h6>
               <h5 class="font-weight-bold text-dark">{{ selectedOrder.date }}</h5>
            </CCol>
         </CRow>
         
         <CCard class="border-0 shadow-sm rounded-lg mb-0">
             <CCardBody>
                 <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                     <span class="font-weight-bold text-dark">Subtotal</span>
                     <span class="font-weight-bold">฿{{ selectedOrder.total.toLocaleString() }}</span>
                 </div>
                 <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                     <span class="font-weight-bold text-dark">Shipping</span>
                     <span class="font-weight-bold text-success">Free</span>
                 </div>
                 <div class="d-flex justify-content-between align-items-center pt-2">
                     <h5 class="font-weight-bold text-dark mb-0">Total</h5>
                     <h4 class="font-weight-bold text-primary mb-0">฿{{ selectedOrder.total.toLocaleString() }}</h4>
                 </div>
             </CCardBody>
         </CCard>
      </div>
      <template #footer>
        <CButton @click="showModal = false" color="dark" shape="pill" class="px-4 font-weight-bold shadow-sm hover-lift btn-premium w-100">
          Close
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  name: 'UserOrders',
  data() {
    return {
      showModal: false,
      selectedOrder: null,
      fields: [
        { key: 'orderId', label: 'Order ID', _classes: 'font-weight-bold' },
        { key: 'date', label: 'Date Purchased' },
        { key: 'total', label: 'Total Amount' },
        { key: 'status', label: 'Status' },
        { key: 'action', label: 'Actions', sorter: false, filter: false }
      ],
      orders: [
        { id: 1, orderId: 'ORD-2024-001', date: '12 Jan 2024', total: 4500, status: 'Delivered' },
        { id: 2, orderId: 'ORD-2024-002', date: '05 Feb 2024', total: 12000, status: 'Processing' },
        { id: 3, orderId: 'ORD-2024-003', date: '20 Mar 2024', total: 3200, status: 'Shipped' },
      ]
    }
  },
  methods: {
    getBadge(status) {
      switch (status) {
        case 'Delivered': return 'success'
        case 'Processing': return 'warning'
        case 'Shipped': return 'info'
        case 'Cancelled': return 'danger'
        default: return 'primary'
      }
    },
    viewDetails(item) {
      this.selectedOrder = item;
      this.showModal = true;
    }
  }
}
</script>

<style scoped>
.bg-light-premium {
    background-color: #f8f9fa;
}

.section-title {
    font-family: 'Cinzel', serif;
    font-size: 2.2rem;
    color: #2c3e50;
    letter-spacing: 1px;
}

.title-separator-sm {
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, #d4af37, #f3e5ab);
    border-radius: 2px;
}

.shadow-premium {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05) !important;
}

.rounded-xl {
    border-radius: 20px !important;
}

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-3px);
}

.bg-light-empty {
    background-color: #f8f9fa;
}

/* Custom Search Input */
.custom-search-input ::v-deep .form-control {
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    padding-left: 10px;
    background-color: #f8fafc;
    transition: all 0.3s ease;
}

.custom-search-input ::v-deep .form-control:focus {
    background-color: #ffffff;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

/* Premium Table Styles */
.premium-table ::v-deep table {
    margin-bottom: 0;
}

.premium-table ::v-deep thead th {
    border-top: none;
    border-bottom: 2px solid #f1f5f9;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
    background-color: #ffffff;
}

.premium-table ::v-deep tbody td {
    padding: 1rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
}

.badge-premium-status {
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.btn-action {
    border-radius: 8px;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}

.btn-premium {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    color: white !important;
    border: none;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-premium:hover {
    background: linear-gradient(135deg, #8a3a31 0%, #612721 100%);
    box-shadow: 0 8px 20px rgba(97, 39, 33, 0.25) !important;
    transform: translateY(-2px);
}
</style>
