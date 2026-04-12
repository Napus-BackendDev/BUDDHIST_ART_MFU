<template>
    <footer class="footer-section">
        <div class="container pt-5 pb-5">
            <div class="row">
                <!-- Column 1: Brand & Description -->
                <div class="col-lg-4 mb-4 mb-lg-0">
                    <h3 class="footer-logo mb-3">Artsy.</h3>
                    <p class="footer-desc pr-lg-5">
                        Curating the finest digital and physical art from around the globe. Connecting collectors with
                        creators since 2024.
                    </p>
                </div>

                <!-- Column 2: Shop -->
                <div class="col-6 col-lg-2 mb-4 mb-lg-0">
                    <h5 class="footer-heading mb-3">Shop</h5>
                    <ul class="list-unstyled footer-links">
                        <li><a href="#">Paintings</a></li>
                        <li><a href="#">Sculptures</a></li>
                        <li><a href="#">Digital Art</a></li>
                        <li><a href="#">New Arrivals</a></li>
                    </ul>
                </div>

                <!-- Column 3: Support -->
                <div class="col-6 col-lg-2 mb-4 mb-lg-0">
                    <h5 class="footer-heading mb-3">Support</h5>
                    <ul class="list-unstyled footer-links">
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Shipping & Returns</a></li>
                        <li><a href="#">Art Advisory</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>

                <!-- Column 4: Stay Updated -->
                <div class="col-lg-4">
                    <h5 class="footer-heading mb-3" style="color: #F9D976;">Stay Updated</h5>
                    <p class="footer-desc mb-3">Subscribe for exclusive drops and art news.</p>
                    <div class="input-group mb-3 newsletter-input-group">
                        <input type="email" class="form-control bg-dark border-dark text-white shadow-none"
                            placeholder="Enter your email" aria-label="Enter your email">
                        <div class="input-group-append">
                            <button class="btn btn-danger" type="button"
                                style="background-color: #E55B5B; border: none;">
                                <CIcon name="cil-arrow-right" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Footer -->
        <div class="container pb-4">
            <div class="row align-items-center border-top border-secondary pt-4">
                <div class="col-md-6 text-center text-md-left mb-3 mb-md-0">
                    <small class="text-muted">&copy; {{ new Date().getFullYear() }} Artsy Inc. All rights
                        reserved.</small>
                </div>
                <div class="col-md-6 text-center text-md-right">
                    <div class="social-icons">
                        <a href="#" class="text-muted mr-3 hover-white">
                            <CIcon name="cib-instagram" size="lg" />
                        </a>
                        <a href="#" class="text-muted mr-3 hover-white">
                            <CIcon name="cib-twitter" size="lg" />
                        </a>
                        <a href="#" class="text-muted mr-3 hover-white">
                            <CIcon name="cib-facebook" size="lg" />
                        </a>
                        <a href="#" class="text-muted hover-white">
                            <CIcon name="cil-envelope-closed" size="lg" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooterUser'
}
</script>

<style scoped>
.footer-section {
    background-color: #0f1219;
    /* Dark background color from design */
    color: #a0aec0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-logo {
    color: #ffffff;
    font-weight: bold;
}

.footer-heading {
    color: #E55B5B;
    /* Accent color */
    font-weight: 600;
    font-size: 1.1rem;
}

.footer-desc {
    color: #718096;
    line-height: 1.6;
    font-size: 0.95rem;
}

.footer-links li {
    margin-bottom: 0.75rem;
}

.footer-links a {
    color: #a0aec0;
    text-decoration: none;
    transition: color 0.2s;
}

.footer-links a:hover {
    color: #ffffff;
}

.newsletter-input-group ::placeholder {
    color: #718096;
}

.newsletter-input-group input:focus {
    background-color: #1a202c !important;
    /* Slightly lighter dark on focus */
}

.hover-white:hover {
    color: #ffffff !important;
}

.border-secondary {
    border-color: #2d3748 !important;
    /* Darker border */
}
</style>
