module.exports = ({ artistName, submissionTitle, rejectionReason }) => {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #e74c3c; text-align: center;">Submission Update</h2>
        <p>Dear <strong>${artistName}</strong>,</p>
        <p>Thank you for submitting your artwork "<strong>${submissionTitle}</strong>" to Buddhist Art MFU.</p>
        
        <p>After careful review, we regret to inform you that your submission has been <strong>rejected</strong> at this time.</p>
  
        <div style="background: #fdf2f2; border-left: 5px solid #e74c3c; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #c0392b;">Feedback from Admin:</h3>
          <p style="margin-bottom: 0; font-style: italic;">"${rejectionReason || 'No specific reason provided.'}"</p>
        </div>
  
        <p>You can revise your artwork based on the feedback above and submit it again for review. We look forward to seeing your improved work!</p>
        
        <p>Best regards,<br/>
        <strong>Buddhist Art MFU Team</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <small style="color: #888;">This is an automated message, please do not reply directly to this email.</small>
      </div>
    `;
  };
