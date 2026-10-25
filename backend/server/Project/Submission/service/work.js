const mongoose = require('mongoose');
const Model = require('../models/submission.model');
const Submission = require('../controller/submission');
const Status = require('../../Settings/models/status.model');
const {STATUS_CODES,queryForCode}=require('../../Settings/statusCodes');
const ResMessage=require('../../Settings/service/message');
const access=require('../../../../middleware/submissionAccessMiddleware');
const fields=new Set(['title','description','technique','size','price','category','storage','storageDetail','remark','image']);

exports.onUpdate = async (req,res,next) => {
    try {
        if (Object.keys(req.body).some(key=>!['_id','assignmentId','artwork'].includes(key)) || !req.body.artwork || Array.isArray(req.body.artwork)) {
            throw access.fail(403,'Artists must update one submitted artwork at a time.');
        }
        const input=req.body.artwork;
        const {round,artwork}=await access.workContext(req,req.body._id,req.body.assignmentId,input._id);
        if (Object.keys(input).some(key=>!fields.has(key) && !['_id','owner','status'].includes(key))) throw access.fail(403,'Submission workflow fields are managed by administrators.');
        if (input.owner && access.idOf(input.owner)!==String(req.user.userId)) throw access.fail(403,'An artwork must belong to its submitting artist.');
        const pending=await Status.findOne(queryForCode(STATUS_CODES.PENDING)).lean();
        if (!pending) throw access.fail(503,'Pending submission status is not configured.');
        if (input.status && access.idOf(input.status.approval || input.status)!==String(pending._id)) throw access.fail(403,'Only administrators can approve submitted work.');
        const data=Object.fromEntries(Object.entries(input).filter(([key,value])=>fields.has(key) && value!==undefined));
        const roundMatch={_id:round._id};
        if (round.artist?.length) roundMatch.artist=req.user.userId;
        const query={_id:req.body._id,artist:req.user.userId,assignments:{$elemMatch:roundMatch}};
        const filters=[{'round._id':round._id}];
        let mutation;
        if (artwork) {
            roundMatch.artworks={$elemMatch:{_id:artwork._id,owner:req.user.userId,status:artwork.status || null}};
            if (artwork.create?.at) roundMatch.artworks.$elemMatch['create.at']=artwork.create.at;
            filters.push({'work._id':artwork._id,'work.owner':new mongoose.Types.ObjectId(req.user.userId)});
            const prefix='assignments.$[round].artworks.$[work].';
            mutation={$set:Object.fromEntries(Object.entries({...data,status:pending._id,rejectionReason:null,'create.at':new Date()}).map(([key,value])=>[prefix+key,value]))};
        } else {
            mutation={$push:{'assignments.$[round].artworks':{...data,owner:req.user.userId,status:pending._id,create:{at:new Date()}}}};
        }
        const updated=await Model.findOneAndUpdate(query,mutation,{new:true,runValidators:true,arrayFilters:filters}).lean();
        if (!updated) throw access.fail(409,'The submission changed. Refresh before trying again.');
        const doc=await Submission.onQuery({_id:updated._id});
        return ResMessage.sendResponse(res,0,20000,access.visible(req,doc));
    } catch(error) { return access.respond(res,error,next); }
};
