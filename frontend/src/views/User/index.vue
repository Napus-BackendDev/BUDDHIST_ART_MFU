<template>
  <div class="user-profile-view min-vh-100 py-4 bg-light-premium">
    <CContainer class="profile-container-wide">
      <div class="mb-5 text-center text-md-left">
        <h2 class="font-weight-bold text-dark section-title">My Dashboard</h2>
        <div class="title-separator-sm mb-3 mx-auto mx-md-0"></div>
        <p class="text-muted">Manage your personal information and track your orders.</p>
      </div>

      <CRow>
        <!-- Left Column: Avatar & Bio -->
        <CCol lg="4" class="mb-4">
          <CCard class="profile-card border-0 shadow-premium rounded-xl h-100 mb-0 position-relative overflow-hidden">
             <div class="card-accent-bar"></div>
            <CCardBody class="text-center p-4 p-md-5 z-index-2 position-relative">
              <div class="avatar-upload-wrapper mb-4 mx-auto">
                <div class="avatar-preview shadow-lg">
                  <span class="avatar-initials">US</span>
                </div>
              </div>
              <h4 class="font-weight-bold mb-1 text-dark">User Name</h4>
              <CBadge color="primary" class="badge-premium mb-4 px-3 py-2">Customer</CBadge>
              <div class="text-left mt-4 border-top pt-4">
                  <div class="contact-info-item mb-3 d-flex align-items-center premium-hover">
                      <div class="icon-box-sm mr-3 shadow-sm">
                        <CIcon name="cil-envelope-closed" />
                      </div>
                      <span class="text-dark font-weight-bold">user@example.com</span>
                  </div>
                  <div class="contact-info-item mb-3 d-flex align-items-center premium-hover">
                      <div class="icon-box-sm mr-3 shadow-sm">
                        <CIcon name="cil-phone" />
                      </div>
                      <span class="text-dark font-weight-bold">08X-XXX-XXXX</span>
                  </div>
              </div>
              <CButton color="dark" shape="pill" class="btn-premium w-100 mt-4 shadow-sm hover-lift" @click="isEditing = true">
                <CIcon name="cil-pencil" class="mr-2" /> Edit Profile
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        <!-- Right Column: Quick Stats & Recent Activity -->
        <CCol lg="8">
           <CRow>
               <CCol sm="6" class="mb-4">
                   <CCard class="stat-card border-0 shadow-sm rounded-xl h-100 premium-card-hover">
                       <CCardBody class="p-4 d-flex align-items-center">
                           <div class="stat-icon-box bg-gold-gradient text-white mr-4 shadow-sm">
                               <CIcon name="cil-cart" size="xl" />
                           </div>
                           <div>
                               <h6 class="text-muted mb-1 text-uppercase font-weight-bold small tracking-wide">Total Orders</h6>
                               <h3 class="mb-0 font-weight-bold text-dark">5</h3>
                           </div>
                       </CCardBody>
                   </CCard>
               </CCol>
               <CCol sm="6" class="mb-4">
                   <CCard class="stat-card border-0 shadow-sm rounded-xl h-100 premium-card-hover">
                       <CCardBody class="p-4 d-flex align-items-center">
                           <div class="stat-icon-box bg-red-gradient text-white mr-4 shadow-sm">
                               <CIcon name="cil-calendar" size="xl" />
                           </div>
                           <div>
                               <h6 class="text-muted mb-1 text-uppercase font-weight-bold small tracking-wide">Member Since</h6>
                               <h3 class="mb-0 font-weight-bold text-dark">2024</h3>
                           </div>
                       </CCardBody>
                   </CCard>
               </CCol>
           </CRow>
           
           <!-- Recent Orders Teaser -->
           <CCard class="border-0 shadow-premium rounded-xl mt-2 overflow-hidden">
               <CCardHeader class="bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                   <h5 class="font-weight-bold text-dark mb-0"><CIcon name="cil-history" class="mr-2 text-primary" /> Recent Orders</h5>
                   <CButton variant="ghost" class="text-primary font-weight-bold btn-sm hover-lift" @click="$router.push('/user/order')">
                       View All <CIcon name="cil-arrow-right" class="ml-1" />
                   </CButton>
               </CCardHeader>
               <CCardBody class="p-0">
                   <!-- Empty State (Placeholder) -->
                   <div class="text-center py-5 text-muted bg-light-empty">
                        <CIcon name="cil-inbox" size="3xl" class="mb-3 opacity-25" />
                        <p class="mb-0 font-weight-bold">No recent orders found.</p>
                   </div>
               </CCardBody>
           </CCard>
        </CCol>
      </CRow>
    </CContainer>

    <!-- Edit Profile Modal -->
    <CModal
      title="Edit Profile"
      :show.sync="isEditing"
      size="lg"
      :centered="true"
    >
        <div class="p-4">
             <CRow>
              <CCol md="6" class="mb-4">
                <label class="form-label-custom">Full Name (Thai)</label>
                <CInput placeholder="ชื่อ-นามสกุล" class="custom-input-premium shadow-none" />
              </CCol>
              <CCol md="6" class="mb-4">
                <label class="form-label-custom">Full Name (English)</label>
                <CInput placeholder="Full Name" class="custom-input-premium shadow-none" />
              </CCol>
              <CCol md="6" class="mb-4">
                <label class="form-label-custom">Email Address</label>
                <CInput placeholder="example@gmail.com" type="email" class="custom-input-premium shadow-none" />
              </CCol>
              <CCol md="6" class="mb-4">
                <label class="form-label-custom">Telephone</label>
                <CInput placeholder="08x-xxx-xxxx" class="custom-input-premium shadow-none" />
              </CCol>
            </CRow>
        </div>
        <template #footer>
        <div class="d-flex w-100 justify-content-end p-3 bg-light rounded-bottom">
          <CButton @click="isEditing = false" variant="outline" shape="pill" class="mr-3 hover-lift px-4">
            Cancel
          </CButton>
          <CButton color="dark" shape="pill" class="px-5 font-weight-bold shadow-sm hover-lift btn-premium" @click="isEditing = false">
            Save Changes
          </CButton>
        </div>
      </template>
    </CModal>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  data() {
    return {
      isEditing: false
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

.z-index-2 {
    z-index: 2;
}

/* Avatar Styles */
.avatar-upload-wrapper {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    position: relative;
    padding: 5px;
    background: linear-gradient(135deg, #d4af37, #612721);
}

.avatar-preview {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 3px solid white;
}

.avatar-initials {
    font-size: 2.5rem;
    font-weight: 800;
    color: #612721;
}

.card-accent-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #612721, #d4af37);
    z-index: 3;
}

.badge-premium {
    background: rgba(212, 175, 55, 0.15);
    color: #b5952f;
    border: 1px solid rgba(212, 175, 55, 0.3);
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}

.icon-box-sm {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #612721;
    transition: all 0.3s ease;
}

.premium-hover {
    padding: 8px 10px;
    border-radius: 12px;
    margin-left: -10px;
    transition: all 0.3s ease;
}

.premium-hover:hover {
    background-color: rgba(212, 175, 55, 0.05);
    transform: translateX(5px);
}

.premium-hover:hover .icon-box-sm {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
    color: white;
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

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-3px);
}

/* Stats Cards */
.premium-card-hover {
    transition: all 0.3s ease;
}
.premium-card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08) !important;
}

.stat-icon-box {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bg-gold-gradient {
    background: linear-gradient(135deg, #d4af37 0%, #b5952f 100%);
}

.bg-red-gradient {
    background: linear-gradient(135deg, #612721 0%, #8a3a31 100%);
}

.tracking-wide {
    letter-spacing: 1px;
}

.bg-light-empty {
    background-color: #f8f9fa;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

/* Forms */
.form-label-custom {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.custom-input-premium ::v-deep .form-control {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 0.75rem 1rem;
    background-color: #f8fafc;
    transition: all 0.3s ease;
    color: #2d3748;
    height: auto;
}

.custom-input-premium ::v-deep .form-control:focus {
    background-color: #ffffff;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}
</style>
