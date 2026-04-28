// Returns the HTML template for the submission approval email
module.exports = function approvedSubmissionMailTemplate({ artistName, submissionTitle, approvalDate }) {
  return `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #2e7d32;">Submission Approved!</h2>
      <p>Dear ${artistName},</p>
      <p>We are pleased to inform you that your submission has been approved for display on the Buddhist Art MFU platform.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 5px solid #2e7d32;">
        <p style="margin: 0;"><strong>Submission:</strong> ${submissionTitle}</p>
        <p style="margin: 5px 0 0 0;"><strong>Approval Date:</strong> ${approvalDate}</p>
      </div>

      <p>Your artwork will now be visible to our community. Thank you for your contribution to Buddhist Art.</p>
      
      <p>Best regards,<br/>
      <strong>Buddhist Art MFU Team</strong></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <small style="color: #888;">This is an automated message, please do not reply directly to this email.</small>
    </div>
  `;
};
