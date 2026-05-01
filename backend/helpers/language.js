export const getLangValue=(field,lang='en')=>{
    if (Array.isArray(field)) {
        const item = field.find(f => f.key === lang);
        return item ? item.value : (field[0]?.value || '');
    }
    return field || '';
}