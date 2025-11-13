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
  // Use separate bot credentials for deposits (not verification)
  const botToken = (process.env.DEPOSIT_BOT_TOKEN || process.env.BOT_TOKEN)?.trim();
  const chatId = (process.env.DEPOSIT_CHAT_ID || process.env.CHAT_ID)?.trim();

  console.log('[Telegram] Raw env values:', {
    DEPOSIT_BOT_TOKEN_length: process.env.DEPOSIT_BOT_TOKEN?.length,
    DEPOSIT_BOT_TOKEN_first50: process.env.DEPOSIT_BOT_TOKEN?.substring(0, 50),
    DEPOSIT_CHAT_ID: process.env.DEPOSIT_CHAT_ID,
    BOT_TOKEN_length: process.env.BOT_TOKEN?.length,
    BOT_TOKEN_first50: process.env.BOT_TOKEN?.substring(0, 50),
  });

  if (!botToken || !chatId) {
    throw new Error('Telegram deposit bot configuration missing (DEPOSIT_BOT_TOKEN and DEPOSIT_CHAT_ID)');
  }

  // Validate bot token format (should start with numbers:)
  const validTokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
  if (!validTokenPattern.test(botToken)) {
    console.error('[Telegram] Invalid bot token format! Token should start with numbers followed by colon and alphanumeric characters.');
    console.error('[Telegram] Current token starts with:', botToken.substring(0, 50));
    throw new Error('Invalid Telegram bot token format. Please check DEPOSIT_BOT_TOKEN secret.');
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
