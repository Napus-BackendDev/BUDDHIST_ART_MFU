// Returns the HTML template for the order confirmation email
module.exports = function confirmationOrderMailTemplate({ buyerName, orderId, artworkTitle, price, orderDate }) {
  return `
    <h2>Order Confirmation</h2>
    <p>Dear ${buyerName},</p>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Artwork:</strong> ${artworkTitle}</p>
    <p><strong>Price:</strong> ${price}</p>
    <p><strong>Order Date:</strong> ${orderDate}</p>
    <p>We will process your order and contact you with further details.</p>
    <br/>
    <p>Best regards,<br/>Buddhist Art MFU Team</p>
  `;
};
