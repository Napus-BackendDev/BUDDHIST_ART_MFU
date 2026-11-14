const mongoose = require('mongoose');
const Submission = require('../server/Project/Submission/models/submission.model');
const { canReadTab, canEditTab } = require('./userAccessMiddleware');
const { STATUS_CODES, hasCode } = require('../server/Project/Settings/statusCodes');
const canReadSubmissions = req => canReadTab(req, 'submissions');
const isSubmissionEditor = req => canEditTab(req, 'submissions');
const idOf = value => value && String(value._id || value);
const isArtist = req => String(req.user?.role || '').trim().toLowerCase() === 'artist' && mongoose.isValidObjectId(req.user?.userId);
const isMember = (req, doc) => isArtist(req) && (doc.artist || []).some(user => idOf(user) === String(req.user.userId));
const fail = (status, message) => Object.assign(new Error(message), { status });
const respond = (res, error, next) => error.status ? res.status(error.status).json({code:String(error.status)+'00',message:error.message}) : next(error);
const profile = user => !user || typeof user !== 'object' ? user : Object.fromEntries(['_id','name','image','bio'].filter(key=>user[key]!==undefined).map(key=>[key,user[key]]));

const visible = (req, doc) => {
    if (!doc || canReadSubmissions(req)) return doc;
    const member = isMember(req, doc);
    return { ...doc, artist:(doc.artist || []).map(profile), assignments:(doc.assignments || []).map(round => ({
        ...round, artist:undefined,
        isAssigned:member && (!round.artist?.length || round.artist.some(user=>idOf(user)===String(req.user.userId))),
        artworks:(round.artworks || []).filter(art=>member || hasCode(art.status,STATUS_CODES.APPROVED)).map(art=>{
            const value={...art,owner:profile(art.owner)};
            if (!member || idOf(art.owner)!==String(req.user.userId)) {
                for (const key of ['remark','rejectionReason','report','storage','storageDetail']) delete value[key];
            }
            return value;
        })
    })) };
};

async function memberDocument(req, id) {
    if (!isArtist(req)) throw fail(403,'Artist access required.');
    if (!mongoose.isValidObjectId(id)) throw fail(400,'A valid submission ID is required.');
    const doc=await Submission.findById(id).lean();
    if (!doc) throw fail(404,'Submission not found.');
    if (!isMember(req,doc)) throw fail(403,'You are not a participant in this submission.');
    return doc;
}

async function workContext(req, submissionId, assignmentId, artworkId) {
    const doc=await memberDocument(req,submissionId);
    if (!mongoose.isValidObjectId(assignmentId)) throw fail(400,'A valid assignment ID is required.');
    const round=(doc.assignments || []).find(item=>idOf(item)===String(assignmentId));
    if (!round) throw fail(404,'Assignment not found.');
    if (round.artist?.length && !round.artist.some(user=>idOf(user)===String(req.user.userId))) throw fail(403,'You are not assigned to this round.');
    const now=Date.now();
    if ([doc.create,round.create].some(period=>period && ((period.startAt && new Date(period.startAt).getTime()>now) || (period.endAt && new Date(period.endAt).getTime()<now)))) {
        throw fail(403,'This submission period is not open.');
    }
    let artwork;
    if (artworkId) {
        artwork=(round.artworks || []).find(item=>idOf(item)===String(artworkId));
        if (!artwork) throw fail(404,'Submitted artwork not found.');
        if (idOf(artwork.owner)!==String(req.user.userId)) throw fail(403,'Access to this submitted artwork is not allowed.');
        const Status=require('../server/Project/Settings/models/status.model');
        const status=artwork.status ? await Status.findById(artwork.status).lean() : null;
        if (hasCode(status,STATUS_CODES.APPROVED)) throw fail(403,'Approved submissions cannot be edited.');
    }
    return {doc,round,artwork};
}

const explore = async (req,res,next) => {
    if (canReadSubmissions(req)) return next();
    try { await memberDocument(req,req.body._id); return next(); } catch(error) { return respond(res,error,next); }
};
const authorizeUpload = async req => {
    if (isSubmissionEditor(req)) return;
    await workContext(req,req.body._id,req.body.assignmentId,req.body.artworkId);
    req.submissionUploadArtist=req.user.userId;
};
module.exports={isAdmin:isSubmissionEditor,canReadSubmissions,isSubmissionEditor,isMember,idOf,fail,respond,visible,workContext,explore,authorizeUpload};
