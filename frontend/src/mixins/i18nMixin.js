export default {
    methods: {
        getName(lang, item, field = null) {
            if (!item) return '';
            if (typeof item === 'string') return item;
            
            // If item itself is the translation array
            if (Array.isArray(item)) {
                let obj = item.find(n => n.key === lang);
                if (!obj) obj = item.find(n => n.key === 'th');
                return obj ? obj.value : (item[0] ? item[0].value : '');
            }

            // Support for fetching a specific field (e.g., technique, description)
            const targetField = field ? item[field] : item;
            if (!targetField) return '';
            if (typeof targetField === 'string') return targetField;

            // If the target field is a translation array
            if (Array.isArray(targetField)) {
                let obj = targetField.find(n => n.key === lang);
                if (!obj) obj = targetField.find(n => n.key === 'th');
                return obj ? obj.value : (targetField[0] ? targetField[0].value : '');
            }

            // If item is an object with title or name fields
            const dataField = item.title || item.name || '';
            if (typeof dataField === 'string' && dataField) return dataField;
            
            if (Array.isArray(dataField)) {
                let obj = dataField.find(n => n.key === lang);
                if (!obj) obj = dataField.find(n => n.key === 'th');
                return obj ? obj.value : (dataField[0] ? dataField[0].value : '');
            }
            return '';
        }
    }
}
