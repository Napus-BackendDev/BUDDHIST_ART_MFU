// services/base.service.js
const mfuDrive = require('./mfuDrive');

module.exports = function createBaseService(objSchema, defaultPopulate = []) {

    return {
        // ====================================
        // 🔹 Helpers
        // ====================================
        getImageUrl: (request, folderPath, filename) => {
            if (!filename) return null;
            const baseUrl = `${request.protocol}://${request.get('host')}`;
            
            // Normalize path for Windows/Unix and extract web-relative path
            let webPath = folderPath.replace(/\\/g, '/'); 
            webPath = webPath.replace(/.*\/public\//, ''); 
            
            if (webPath && !webPath.endsWith('/')) webPath += '/';
            
            const relativePath = `${webPath}${filename}`;
            if (mfuDrive.isEnabled()) return mfuDrive.publicFileUrl(relativePath);
            return `${baseUrl}/${relativePath}`;
        },

        // ====================================
        // 🔹 Aggregate
        // ====================================
        onAggregate: async (pipeline = [], options = {}) => {
            return objSchema.aggregate(pipeline).option(options);
        },

        // ====================================
        // 🔹 Query One
        // ====================================
        onQuery: async (query, populate = defaultPopulate, select = '') => {
            return objSchema
                .findOne(query)
                .select(select)
                .populate(populate)
                .lean();
        },

        // ====================================
        // 🔹 Query Many
        // ====================================
        onQuerys: async (query, populate = defaultPopulate, select = '', onlyActive = false) => {
            if (onlyActive) query.expired = { $gte: new Date() };

            return objSchema
                .find(query)
                .select(select)
                .sort({ createdAt: -1 })
                .populate(populate)
                .lean();
        },

        // ====================================
        // 🔹 Create
        // ====================================
        onCreate: async (data, populate = defaultPopulate, select = '', options = {}) => {
            // Mongoose's create handles an array of docs for transactions: create([data], options)
            const results = await objSchema.create(Array.isArray(data) ? data : [data], options);
            const newObj = Array.isArray(data) ? results : results[0];
            
            const populated = await objSchema.populate(newObj, populate);

            if (!select) return populated;

            const result = {};
            select.split(' ').forEach(field => {
                if (field && populated[field] !== undefined) {
                    result[field] = populated[field];
                }
            });
            return result;
        },

        // ====================================
        // 🔹 Create Many (Bulk)
        // ====================================
        onCreateMany: async (dataList, options = {}) => {
            return objSchema.insertMany(dataList, options);
        },

        // ====================================
        // 🔹 Update
        // ====================================
        onUpdate: async (query, data, populate = defaultPopulate, select = '', options = {}) => {
            return objSchema
                .findOneAndUpdate(query, data, { new: true, ...options })
                .select(select)
                .populate(populate)
                .lean();
        },

        // ====================================
        // 🔹 Delete
        // ====================================
        onDelete: async (query, options = {}) => {
            return objSchema.deleteMany(query, options);
        }
    };
};
