'use strict';

const mongoose = require('mongoose');
const Role = require('../controller/role');
const RoleModel = require('../models/role.model');
const UserModel = require('../../User/models/user.model');
const resMsg = require('../service/message');
const {
    extractEnglishRoleTitle,
    isAdminRoleName,
    isSystemRoleDoc,
    normalizePermissions,
    presetRoleDefinitions,
} = require('../../../../helpers/rolePermissions');

function normalizeLangEntries(entries) {
    if (!Array.isArray(entries)) return [];
    const seen = new Set();
    return entries
        .map(item => ({
            key: String(item && item.key || '').trim().toLowerCase(),
            value: String(item && item.value || '').trim(),
        }))
        .filter(item => {
            if (!item.key || !item.value || seen.has(item.key)) return false;
            seen.add(item.key);
            return true;
        });
}

function serializeRole(doc) {
    if (!doc) return null;
    const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
    return {
        ...plain,
        isSystem: isSystemRoleDoc(plain),
        permissions: normalizePermissions(plain.permissions, plain),
    };
}

function sendError(response, statusCode, code, message) {
    return response.status(statusCode).json({ code, message });
}

async function hasDuplicateRoleTitle(titleEntries, excludeId = null) {
    const normalizedEn = extractEnglishRoleTitle({ title: titleEntries }).toLowerCase();
    const thEntry = titleEntries.find(t => t.key === 'th');
    const normalizedTh = thEntry ? thEntry.value.toLowerCase() : '';
    const existingRoles = await RoleModel.find(excludeId ? { _id: { $ne: excludeId } } : {}).lean();
    return existingRoles.some(existing => {
        const existingEn = extractEnglishRoleTitle(existing).toLowerCase();
        if (normalizedEn && existingEn && existingEn === normalizedEn) return true;
        if (normalizedTh && Array.isArray(existing.title)) {
            const existingTh = existing.title.find(t => t && t.key === 'th');
            if (existingTh && String(existingTh.value || '').trim().toLowerCase() === normalizedTh) {
                return true;
            }
        }
        return false;
    });
}

async function ensureDefaultRoles() {
    const presets = presetRoleDefinitions();
    const existing = await RoleModel.find().lean();
    const results = [];

    for (const preset of presets) {
        const presetEn = extractEnglishRoleTitle(preset).toLowerCase();
        const found = existing.find(doc => extractEnglishRoleTitle(doc).toLowerCase() === presetEn);
        if (!found) {
            const created = await RoleModel.create({
                title: preset.title,
                description: preset.description,
                isSystem: preset.isSystem,
                permissions: normalizePermissions(preset.permissions, preset),
            });
            results.push({ action: 'created', role: serializeRole(created) });
            continue;
        }

        const updates = {};
        if (preset.isSystem && !found.isSystem) {
            updates.isSystem = true;
        }
        if (isAdminRoleName(presetEn)) {
            const fullAdminPerms = normalizePermissions(preset.permissions, 'Admin');
            const current = found.permissions || {};
            const needsAdminFix = Object.keys(fullAdminPerms).some(tab => current[tab] !== 'edit');
            if (needsAdminFix) updates.permissions = fullAdminPerms;
        } else if (!found.permissions) {
            updates.permissions = normalizePermissions(preset.permissions, found);
        }

        if (Object.keys(updates).length > 0) {
            const updated = await RoleModel.findByIdAndUpdate(
                found._id,
                { $set: updates },
                { new: true }
            ).lean();
            results.push({ action: 'updated', role: serializeRole(updated) });
        } else {
            results.push({ action: 'unchanged', role: serializeRole(found) });
        }
    }

    return results;
}

exports.ensureDefaultRoles = ensureDefaultRoles;

exports.onQuerys = async function (request, response) {
    try {
        const querys = request.body || {};
        const docs = await Role.onQuerys(querys);
        const resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = Array.isArray(docs) ? docs.map(serializeRole) : [];
        return response.status(200).json(resData);
    } catch (err) {
        const resData = await resMsg.onMessage_Response(0, 40400);
        return response.status(404).json(resData);
    }
};

exports.onCreate = async function (request, response) {
    try {
        const body = request.body || {};
        const title = normalizeLangEntries(body.title);
        if (title.length === 0) {
            return sendError(response, 400, '40000', 'Role title is required.');
        }

        const englishTitle = extractEnglishRoleTitle({ title });
        if (isSystemRoleDoc({ title }) || isAdminRoleName(englishTitle)) {
            return sendError(response, 409, '40900', 'Reserved system role name cannot be duplicated.');
        }

        if (await hasDuplicateRoleTitle(title)) {
            return sendError(response, 409, '40900', 'A role with this name already exists.');
        }

        const description = normalizeLangEntries(body.description);
        const permissions = normalizePermissions(body.permissions, englishTitle);

        const doc = await Role.onCreate({
            title,
            description,
            isSystem: false,
            permissions,
        });

        const resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = serializeRole(doc);
        return response.status(200).json(resData);
    } catch (err) {
        const resData = await resMsg.onMessage_Response(0, 40400);
        return response.status(404).json(resData);
    }
};

exports.onUpdate = async function (request, response) {
    try {
        const body = request.body || {};
        if (!mongoose.Types.ObjectId.isValid(body._id)) {
            return sendError(response, 400, '40000', 'Valid role _id is required.');
        }

        const existing = await RoleModel.findById(body._id).lean();
        if (!existing) {
            return sendError(response, 404, '40400', 'Role not found.');
        }

        const existingIsSystem = isSystemRoleDoc(existing);
        const existingEn = extractEnglishRoleTitle(existing);
        const nextTitle = body.title !== undefined
            ? normalizeLangEntries(body.title)
            : normalizeLangEntries(existing.title);

        if (nextTitle.length === 0) {
            return sendError(response, 400, '40000', 'Role title cannot be empty.');
        }

        const nextEn = extractEnglishRoleTitle({ title: nextTitle });
        if (existingIsSystem && existingEn && nextEn.toLowerCase() !== existingEn.toLowerCase()) {
            return sendError(response, 400, '40001', 'Core system role English title cannot be renamed.');
        }

        if (await hasDuplicateRoleTitle(nextTitle, existing._id)) {
            return sendError(response, 409, '40900', 'A role with this name already exists.');
        }

        const nextPermissions = normalizePermissions(
            body.permissions !== undefined ? body.permissions : existing.permissions,
            existingEn || nextEn
        );

        const updatePayload = {
            title: nextTitle,
            description: body.description !== undefined
                ? normalizeLangEntries(body.description)
                : normalizeLangEntries(existing.description),
            isSystem: existingIsSystem,
            permissions: nextPermissions,
        };

        const doc = await RoleModel.findByIdAndUpdate(
            existing._id,
            { $set: updatePayload },
            { new: true }
        ).lean();

        const resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = serializeRole(doc);
        return response.status(200).json(resData);
    } catch (err) {
        const resData = await resMsg.onMessage_Response(0, 40400);
        return response.status(404).json(resData);
    }
};

exports.onDelete = async function (request, response) {
    try {
        const id = request.body && request.body._id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendError(response, 400, '40000', 'Valid role _id is required.');
        }

        const existing = await RoleModel.findById(id).lean();
        if (!existing) {
            return sendError(response, 404, '40400', 'Role not found.');
        }

        if (isSystemRoleDoc(existing)) {
            return sendError(response, 409, '40900', 'System role cannot be deleted.');
        }

        const assignedUsers = await UserModel.countDocuments({ role: existing._id });
        if (assignedUsers > 0) {
            return sendError(response, 409, '40901', 'Role is currently assigned to existing users.');
        }

        const doc = await Role.onDelete({ _id: existing._id });
        const resData = await resMsg.onMessage_Response(0, 20000);
        resData.data = serializeRole(doc);
        return response.status(200).json(resData);
    } catch (err) {
        const resData = await resMsg.onMessage_Response(0, 40400);
        return response.status(404).json(resData);
    }
};
