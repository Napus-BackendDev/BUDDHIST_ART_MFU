import moment from 'moment';

export const statusBadgeMixin = {
    methods: {
        getStatusBadge(status) {
            if (!status) return { label: 'N/A', class: 'badge-pending', icon: 'cil-clock' };
            
            const currentLang = this.$i18n ? this.$i18n.locale : 'th';
            const s = typeof status === 'string' ? status.toLowerCase() : '';
            
            // Map the label to current locale
            let label = status;
            const statusMap = {
                'approved': { en: 'Approved', th: 'อนุมัติแล้ว' },
                'passed': { en: 'Passed', th: 'ผ่านแล้ว' },
                'pending': { en: 'Pending', th: 'รอดำเนินการ' },
                'rejected': { en: 'Rejected', th: 'ปฏิเสธ' },
                'revised': { en: 'Revised', th: 'ให้ปรับปรุง' },
                'reserved': { en: 'Reserved', th: 'ถูกจอง' },
                'available': { en: 'Available', th: 'พร้อมขาย' },
                'sold out': { en: 'Sold Out', th: 'ขายแล้ว' },
                'sold': { en: 'Sold', th: 'ขายแล้ว' },
                'exhibition': { en: 'Exhibition', th: 'จัดแสดง' },
                'delivered': { en: 'Delivered', th: 'จัดส่งสำเร็จ' },
                'processing': { en: 'Processing', th: 'กำลังดำเนินการ' },
                'shipped': { en: 'Shipped', th: 'จัดส่งแล้ว' },
                'cancelled': { en: 'Cancelled', th: 'ยกเลิก' },
                'success': { en: 'Success', th: 'สำเร็จ' },
                'fail': { en: 'Fail', th: 'ล้มเหลว' },
                'active': { en: 'Active', th: 'ใช้งานอยู่' },
                'inactive': { en: 'Inactive', th: 'ไม่ได้ใช้งาน' },
                'suspended': { en: 'Suspended', th: 'ระงับการใช้งาน' },
                'newstudent': { en: 'New Student', th: 'นักศึกษาใหม่' },
                'oldstudent': { en: 'Existing Student', th: 'นักศึกษาเก่า' }
            };

            const matchedKey = Object.keys(statusMap).find(key => s === key || s.includes(key));
            if (matchedKey) {
                label = statusMap[matchedKey][currentLang];
            } else {
                if (s.includes('รอดำเนินการ')) label = currentLang === 'en' ? 'Pending' : 'รอดำเนินการ';
                else if (s.includes('เสร็จสิ้น') || s.includes('จัดส่งแล้ว') || s.includes('ส่งแล้ว')) label = currentLang === 'en' ? 'Delivered' : 'จัดส่งแล้ว';
                else if (s.includes('ยกเลิก')) label = currentLang === 'en' ? 'Cancelled' : 'ยกเลิก';
                else if (s.includes('รอชำระเงิน') || s.includes('payment')) label = currentLang === 'en' ? 'Pending Payment' : 'รอชำระเงิน';
            }

            // Order & Submission status mapping
            let badgeClass = 'badge-pending';
            let icon = 'cil-clock';

            if (s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || ['อนุมัติ', 'อนุมัติแล้ว'].includes(s) || s.includes('success') || s.includes('active') || s.includes('passed') || s.includes('newstudent')) {
                badgeClass = 'badge-completed';
                icon = 'cil-check-circle';
            } else if (s.includes('processing') || s.includes('รอดำเนินการ') || (s.includes('pending') && !s.includes('payment') && !s.includes('ชำระเงิน')) || s.includes('oldstudent')) {
                badgeClass = 'badge-pending';
                icon = 'cil-clock';
            } else if (s.includes('รอชำระเงิน') || s.includes('payment') || s.includes('reserved')) {
                badgeClass = 'badge-info';
                icon = 'cil-credit-card';
            } else if (s.includes('shipped') || s.includes('จัดส่งแล้ว') || s.includes('revised') || s.includes('admin')) {
                badgeClass = 'badge-update';
                icon = s.includes('admin') ? 'cil-shield-check' : 'cil-sync';
            } else if (s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('ไม่อนุมัติ') || s.includes('ปฏิเสธ') || s.includes('suspended') || s.includes('fail')) {
                badgeClass = 'badge-cancelled';
                icon = 'cil-x-circle';
            }
            
            return { label, class: badgeClass, icon };
        },
        getName(lang, item) {
            if (!item) return 'N/A';
            if (typeof item === 'string') return item;
            
            // If item is already the array of translations
            if (Array.isArray(item)) {
                const translation = item.find(n => n.key === lang);
                return translation ? translation.value : (item[0] ? item[0].value : 'N/A');
            }

            const titleField = item.title || item.name || '';
            if (typeof titleField === 'string' && titleField) return titleField;
            
            if (Array.isArray(titleField)) {
                const translation = titleField.find(n => n.key === lang);
                return translation ? translation.value : (titleField[0] ? titleField[0].value : 'N/A');
            }
            return 'N/A';
        },
        getOrderStatusGroup(status) {
            if (!status) return 'Pending';

            const title = typeof status === 'string' ? status : status.title || status.name;
            const statusText = Array.isArray(title)
                ? title.map(item => item && item.value).filter(Boolean).join(' ')
                : String(title || '');
            const normalizedStatus = statusText.toLowerCase();

            if (/(cancelled|canceled|rejected|ปฏิเสธ|ยกเลิก|ไม่อนุมัติ|ไม่ผ่าน)/.test(normalizedStatus)) {
                return 'Cancelled';
            }
            if (/(approved|completed|success|อนุมัติ)/.test(normalizedStatus)) {
                return 'Completed';
            }
            return 'Pending';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            const m = moment(date);
            return m.isValid() ? m.format('DD/MM/YYYY') : String(date);
        },
        formatTime(date) {
            if (!date) return '';
            const m = moment(date);
            if (!m.isValid()) return '';
            const prefix = this.$i18n && this.$i18n.locale === 'en' ? 'Time: ' : 'เวลา: ';
            return prefix + m.format('HH:mm');
        },
        formatDateTime(date) {
            if (!date) return 'N/A';
            const m = moment(date);
            if (!m.isValid()) return String(date);
            const prefix = this.$i18n && this.$i18n.locale === 'en' ? 'Time: ' : 'เวลา: ';
            return m.format('DD/MM/YYYY') + ' ' + prefix + m.format('HH:mm');
        }
    }
};
