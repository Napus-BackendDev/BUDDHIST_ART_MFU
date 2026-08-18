const approvedSubmissionMail = require('./approvedSubmission');
const rejectedSubmissionMail = require('./rejectedSubmission');
const confirmationOrderMail = require('./confirmationOrder');
const approvedOrderMail = require('./approvedOrder');
const rejectedOrderMail = require('./rejectedOrder');
const adminNewOrderMail = require('./adminNewOrder');
const certificateOfAuthenticityMail = require('./certificateOfAuthenticity');

module.exports = {
    approvedSubmissionMail,
    rejectedSubmissionMail,
    confirmationOrderMail,
    approvedOrderMail,
    rejectedOrderMail,
    adminNewOrderMail,
    certificateOfAuthenticityMail
};
