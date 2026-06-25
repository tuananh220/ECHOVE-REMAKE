import { Order, DonationSubmission, EmailLog, EmailConfig } from './types';
import { getEmailConfig, createEmailLog } from './firebase';

/**
 * Utility to format price in Vietnam Dong format
 */
const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫';
};

/**
 * Generate a clean HTML/Text body for the Order confirmation email
 */
export function generateOrderEmailBody(order: Order): string {
  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eeeeee;">
      <td style="padding: 10px 0; font-family: sans-serif; font-size: 14px; color: #333333;">
        <strong>${item.product.name}</strong><br/>
        <span style="font-size: 11px; color: #777777; font-family: monospace;">Size: ${item.selectedSize}</span>
      </td>
      <td style="padding: 10px 0; font-family: monospace; font-size: 14px; color: #333333; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 10px 0; font-family: monospace; font-size: 14px; color: #e17c34; text-align: right; font-weight: bold;">
        ${formatPrice(item.product.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  return `
    <div style="background-color: #f7f9fa; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8ed; border-radius: 4px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #0d2840; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: 1px;">ECHOVE REBORN</h1>
        <p style="color: #e17c34; font-size: 11px; font-family: monospace; text-transform: uppercase; margin: 5px 0 0 0; letter-spacing: 2px;">Cũ Người, Mới Phố • Denim Upcycling Lab</p>
      </div>

      <div style="background-color: #ffffff; padding: 25px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
        <h2 style="color: #2e7d32; font-size: 18px; margin-top: 0; margin-bottom: 15px; display: flex; align-items: center;">
          🎉 ĐẶT HÀNG THÀNH CÔNG!
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Chào <strong>${order.customerName}</strong>, cảm ơn bạn đã lựa chọn sản phẩm denim tái chế từ ECHOVE. Đơn hàng của bạn đã được ghi nhận trên hệ thống đám mây và đang chờ Lab xác nhận đóng gói.
        </p>

        <!-- Order Metadata -->
        <table style="width: 100%; font-size: 13px; color: #555555; background-color: #fafafa; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; width: 120px;">Mã đơn hàng:</td>
            <td style="padding: 4px 0; font-family: monospace; color: #e17c34; font-weight: bold;">${order.id}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Ngày đặt:</td>
            <td style="padding: 4px 0;">${order.createdAt}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Thanh toán:</td>
            <td style="padding: 4px 0; font-family: monospace; font-weight: bold;">COD (Thanh toán khi nhận hàng)</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Địa chỉ gửi hàng:</td>
            <td style="padding: 4px 0;">${order.address}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Số điện thoại:</td>
            <td style="padding: 4px 0; font-family: monospace;">${order.phone}</td>
          </tr>
        </table>

        <!-- Items Table -->
        <h3 style="color: #0d2840; font-size: 15px; border-bottom: 2px solid #0d2840; padding-bottom: 5px; margin-top: 25px; margin-bottom: 10px;">
          CHI TIẾT ĐƠN HÀNG
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #eeeeee;">
              <th style="text-align: left; padding-bottom: 8px; font-size: 12px; color: #777777;">Sản phẩm</th>
              <th style="text-align: center; padding-bottom: 8px; font-size: 12px; color: #777777; width: 60px;">SL</th>
              <th style="text-align: right; padding-bottom: 8px; font-size: 12px; color: #777777; width: 100px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Pricing Summary -->
        <div style="border-top: 2px dashed #eeeeee; padding-top: 15px; font-size: 14px; color: #333333;">
          ${order.originalPrice ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #777777;">
              <span style="font-family: sans-serif;">Tạm tính:</span>
              <span style="font-family: monospace; text-decoration: line-through;">${formatPrice(order.originalPrice)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #e53935; font-weight: bold;">
              <span style="font-family: sans-serif;">Voucher giảm giá (${order.appliedVoucherCode}):</span>
              <span style="font-family: monospace;">-${formatPrice(order.discountApplied || 0)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 18px; font-weight: bold; color: #0d2840;">
            <span style="font-family: sans-serif;">TỔNG THANH TOÁN:</span>
            <span style="font-family: monospace; color: #e17c34;">${formatPrice(order.totalPrice)}</span>
          </div>
        </div>

      </div>

      <div style="text-align: center; margin-top: 25px; color: #777777; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0;">Cảm ơn bạn đã đồng hành cùng ECHOVE bảo vệ môi trường! 🌿</p>
        <p style="margin: 5px 0 0 0;">Bạn có thể tra cứu hành trình vận đơn tại mục <strong>"Theo dõi Đơn & Quyên góp"</strong> trong tài khoản dạo phố của mình.</p>
        <p style="margin: 15px 0 0 0; font-size: 10px; color: #aaaaaa;">Đây là email tự động gửi từ hệ thống ECHOVE Cloud Sync.</p>
      </div>
    </div>
  `;
}

/**
 * Generate a clean HTML/Text body for the Donation confirmation email
 */
export function generateDonationEmailBody(donation: DonationSubmission): string {
  const conditionLabels: Record<string, string> = {
    'like-new': 'Như mới (Còn rất tốt)',
    'worn-out': 'Đã bạc màu / Sờn nhẹ',
    'distressed': 'Rách phong cách / Bụi bặm',
    'scrap': 'Vải vụn / Hỏng nặng'
  };

  return `
    <div style="background-color: #f3f6f8; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cfd8dc; border-radius: 4px;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #0d2840; font-size: 28px; margin: 0; font-weight: 900; letter-spacing: 1px;">ECHOVE REBORN</h1>
        <p style="color: #e17c34; font-size: 11px; font-family: monospace; text-transform: uppercase; margin: 5px 0 0 0; letter-spacing: 2px;">Cũ Người, Mới Phố • Denim Upcycling Lab</p>
      </div>

      <div style="background-color: #ffffff; padding: 25px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
        <h2 style="color: #e17c34; font-size: 18px; margin-top: 0; margin-bottom: 15px;">
          🌱 ĐĂNG KÝ QUYÊN GÓP JEANS THÀNH CÔNG!
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Chào <strong>${donation.donorName}</strong>, chúng mình đã nhận được phiếu đăng ký gửi tặng quần Jeans cũ của bạn! ECHOVE Lab chân thành cảm ơn tinh thần sống xanh dạo phố của bạn. Chúng mình sẽ liên hệ bằng số điện thoại sớm để hướng dẫn bưu tá đến thu gom quần tận nhà bạn nhé.
        </p>

        <!-- Donation Metadata -->
        <table style="width: 100%; font-size: 13px; color: #555555; background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: bold; width: 140px;">Mã phiếu thu gom:</td>
            <td style="padding: 4px 0; font-family: monospace; color: #e17c34; font-weight: bold;">${donation.id}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Số lượng jean quyên góp:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #0d2840;">${donation.jeansCount} Chiếc quần</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Tình trạng vải jean:</td>
            <td style="padding: 4px 0; color: #e17c34;">${conditionLabels[donation.condition] || donation.condition}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Người quyên góp:</td>
            <td style="padding: 4px 0;">${donation.donorName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Địa chỉ lấy hàng:</td>
            <td style="padding: 4px 0;">${donation.address}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: bold;">Số điện thoại:</td>
            <td style="padding: 4px 0; font-family: monospace;">${donation.phone}</td>
          </tr>
        </table>

        <!-- Suggested upcycling path -->
        <div style="background-color: #ebf5eb; border-left: 4px solid #2e7d32; padding: 15px; border-radius: 0 4px 4px 0; margin-bottom: 25px;">
          <h4 style="color: #2e7d32; margin-top: 0; margin-bottom: 8px; font-size: 14px;">✨ HÀNH TRÌNH TÁI SINH DỰ KIẾN</h4>
          <p style="color: #333333; margin: 0; font-size: 13px; line-height: 1.5; font-style: italic;">
            "${donation.suggestedOutput}"
          </p>
        </div>

        <p style="color: #555555; font-size: 13px; line-height: 1.6;">
          🎁 <strong>Điểm Thưởng Street Club:</strong> Khi quần jeans được bưu tá chuyển đến ECHOVE Lab thành công và Lab phân loại hoàn tất, hệ thống sẽ tự động gửi thông báo cộng điểm thưởng thành viên (**+100 PTS đến +300 PTS**) trực tiếp vào tài khoản dạo phố của bạn! Bạn có thể đổi điểm này để lấy Voucher giảm giá hoặc quà tặng độc quyền tại ECHOVE Store.
        </p>

      </div>

      <div style="text-align: center; margin-top: 25px; color: #777777; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0;">Trân trọng cảm ơn dạo phố đã đồng hành cùng thời trang bền vững! 🌿</p>
        <p style="margin: 5px 0 0 0;">Theo dõi hành trình xử lý chiếc jean của bạn bất cứ lúc nào qua mục <strong>"Theo dõi Đơn & Quyên góp"</strong> trên website của chúng mình.</p>
        <p style="margin: 15px 0 0 0; font-size: 10px; color: #aaaaaa;">Đây là email tự động gửi từ hệ thống ECHOVE Cloud Sync.</p>
      </div>
    </div>
  `;
}

/**
 * Dispatch automatic emails to the recipient.
 * If EmailJS is enabled and configured, it will make a REST API call to deliver a real email.
 * It will ALWAYS create a cloud log in the Firestore 'emails' collection, so the Admin
 * can audit/view all triggered transactional emails inside their Admin Panel!
 */
export async function sendAutomaticEmail(
  type: 'order_confirmation' | 'donation_received',
  recipientEmail: string,
  recipientName: string,
  dataPayload: any
): Promise<EmailLog> {
  const timestamp = new Date().toISOString();
  const logId = `EMAIL-${Math.floor(100000 + Math.random() * 900000)}`;
  
  let subject = '';
  let contentHtml = '';

  if (type === 'order_confirmation') {
    subject = `[ECHOVE REBORN] Xác nhận đơn hàng thành công #${dataPayload.id}`;
    contentHtml = generateOrderEmailBody(dataPayload);
  } else {
    subject = `[ECHOVE REBORN] Xác nhận đăng ký quyên góp quần Jeans cũ #${dataPayload.id}`;
    contentHtml = generateDonationEmailBody(dataPayload);
  }

  // Create base log
  const emailLog: EmailLog = {
    id: logId,
    toEmail: recipientEmail.toLowerCase().trim(),
    recipientName,
    subject,
    type,
    content: contentHtml,
    status: 'simulated',
    createdAt: timestamp
  };

  try {
    // 1. Fetch live email configurations
    const config = await getEmailConfig();

    if (config && config.isEnabled && config.serviceId && config.templateId && config.publicKey) {
      // 2. Perform live dispatch via EmailJS REST API
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          template_params: {
            to_name: recipientName,
            to_email: recipientEmail,
            subject: subject,
            message_html: contentHtml,
            from_name: 'ECHOVE Reborn Team'
          }
        })
      });

      if (response.ok) {
        emailLog.status = 'sent';
      } else {
        const errorText = await response.text();
        emailLog.status = 'failed';
        emailLog.errorMessage = `EmailJS API returned ${response.status}: ${errorText}`;
        console.error('EmailJS Send Failure:', errorText);
      }
    }
  } catch (error: any) {
    emailLog.status = 'failed';
    emailLog.errorMessage = error?.message || String(error);
    console.error('Failed to dispatch real email:', error);
  } finally {
    // 3. Keep a rich persistent log on the Cloud so Admin can inspect, read, and demonstrate functionality!
    await createEmailLog(emailLog);
  }

  return emailLog;
}
