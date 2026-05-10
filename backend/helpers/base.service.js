// services/base.service.js
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
            
            return `${baseUrl}/${webPath}${filename}`;
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
        onCreate: async (data, populate = defaultPopulate, select = '') => {
            const newObj = await objSchema.create(data);
            const populated = await objSchema.populate(newObj, populate);

            if (!select) return populated;

            // เลือกเฉพาะ fields ที่ต้องการ
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
        onCreateMany: async (dataList) => {
            return objSchema.insertMany(dataList);
        },

        // ====================================
        // 🔹 Update
        // ====================================
        onUpdate: async (query, data, populate = defaultPopulate, select = '') => {
            return objSchema
                .findOneAndUpdate(query, data, { new: true })
                .select(select)
                .populate(populate)
                .lean();
        },

        // ====================================
        // 🔹 Delete
        // ====================================
        onDelete: async (query) => {
            return objSchema.deleteMany(query);
        }
    };
};
