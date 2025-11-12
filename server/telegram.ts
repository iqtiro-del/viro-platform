import FormData from 'form-data';
import https from 'https';

interface TelegramMessageData {
  username: string;
  timestamp: string;
  amount: string;
  paymentMethod: string;
}

export async function sendDepositScreenshotToTelegram(
  imageBuffer: Buffer,
  filename: string,
  data: TelegramMessageData
): Promise<void> {
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram bot configuration missing');
  }

  // Detect content type from filename
  let contentType = 'image/jpeg';
  if (filename.toLowerCase().endsWith('.png')) {
    contentType = 'image/png';
  } else if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
    contentType = 'image/jpeg';
  } else if (filename.toLowerCase().endsWith('.gif')) {
    contentType = 'image/gif';
  } else if (filename.toLowerCase().endsWith('.webp')) {
    contentType = 'image/webp';
  }

  const caption = `🔔 طلب إيداع جديد\n\n` +
    `👤 المستخدم: ${data.username}\n` +
    `💰 المبلغ: $${data.amount}\n` +
    `💳 طريقة الدفع: ${data.paymentMethod}\n` +
    `📅 التاريخ والوقت: ${data.timestamp}`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', imageBuffer, {
    filename: filename,
    contentType: contentType
  });
  formData.append('caption', caption);

  console.log('[Telegram] Sending photo:', {
    chatId,
    filename,
    bufferSize: imageBuffer.length,
    contentType,
    captionLength: caption.length
  });

  // Use form-data's submit method which properly works with Node.js https
  return new Promise((resolve, reject) => {
    formData.submit(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      (err, response) => {
        if (err) {
          console.error('[Telegram] Submit error:', err);
          reject(new Error(`Failed to send to Telegram: ${err.message}`));
          return;
        }

        let responseData = '';
        response.on('data', (chunk) => {
          responseData += chunk.toString();
        });

        response.on('end', () => {
          console.log('[Telegram] Response status:', response.statusCode);
          
          if (response.statusCode !== 200) {
            console.error('[Telegram] Error response:', responseData);
            try {
              const errorJson = JSON.parse(responseData);
              reject(new Error(`Telegram error: ${errorJson.description || JSON.stringify(errorJson)}`));
            } catch {
              reject(new Error(`Telegram error (status ${response.statusCode}): ${responseData}`));
            }
            return;
          }

          try {
            const result = JSON.parse(responseData);
            if (!result.ok) {
              reject(new Error(`Telegram API error: ${result.description || 'Unknown error'}`));
              return;
            }
            console.log('[Telegram] Photo sent successfully!');
            resolve();
          } catch (parseError) {
            console.error('[Telegram] Could not parse response:', parseError);
            // If we got a 200 status, consider it successful even if we can't parse the response
            resolve();
          }
        });

        response.on('error', (error) => {
          console.error('[Telegram] Response error:', error);
          reject(error);
        });
      }
    );
  });
}
