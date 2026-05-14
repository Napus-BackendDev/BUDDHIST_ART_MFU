import moment from 'moment';

export const statusBadgeMixin = {
    methods: {
        getStatusBadge(status) {
            if (!status) return { label: 'N/A', class: 'badge-pending', icon: 'cil-clock' };
            
            const s = typeof status === 'string' ? status.toLowerCase() : '';
            
            // Order & Submission status mapping
            if (s.includes('delivered') || s.includes('เสร็จสิ้น') || s.includes('approved') || s.includes('success') || s.includes('active') || s.includes('passed') || s.includes('newstudent')) {
                return { label: status, class: 'badge-completed', icon: 'cil-check-circle' };
            }
            if (s.includes('processing') || s.includes('รอดำเนินการ') || s.includes('pending') || s.includes('oldstudent')) {
                return { label: status, class: 'badge-pending', icon: 'cil-clock' };
            }
            if (s.includes('shipped') || s.includes('จัดส่งแล้ว') || s.includes('revised') || s.includes('admin') || s.includes('reserved')) {
                return { label: status, class: 'badge-update', icon: s.includes('admin') ? 'cil-shield-check' : 'cil-sync' };
            }
            if (s.includes('cancelled') || s.includes('ยกเลิก') || s.includes('rejected') || s.includes('suspended') || s.includes('fail')) {
                return { label: status, class: 'badge-cancelled', icon: 'cil-x-circle' };
            }
            
            return { label: status, class: 'badge-pending', icon: 'cil-clock' };
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
        formatDate(date) {
            if (!date) return 'N/A';
            return moment(date).format('MMM DD, YYYY');
        }
    }
};
