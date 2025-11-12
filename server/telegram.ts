import FormData from 'form-data';

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

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', imageBuffer, {
    filename: filename,
    contentType: contentType
  });
  
  const caption = `🔔 طلب إيداع جديد\n\n` +
    `👤 المستخدم: ${data.username}\n` +
    `💰 المبلغ: $${data.amount}\n` +
    `💳 طريقة الدفع: ${data.paymentMethod}\n` +
    `📅 التاريخ والوقت: ${data.timestamp}`;
  
  formData.append('caption', caption);

  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData as any,
    headers: formData.getHeaders() as any
  });

  if (!response.ok) {
    let errorMessage = `Telegram API returned status ${response.status}`;
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Telegram API Error:', errorJson);
          errorMessage = `Telegram error: ${errorJson.description || JSON.stringify(errorJson)}`;
        } catch {
          console.error('Telegram API Error (raw):', errorText);
          errorMessage = `Telegram error: ${errorText}`;
        }
      }
    } catch (e) {
      console.error('Could not read Telegram error response:', e);
    }
    throw new Error(errorMessage);
  }

  // Validate successful response
  try {
    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    }
  } catch (e: any) {
    // If we can't parse the response, but status was OK, consider it successful
    if (e.message.includes('Telegram API error')) {
      throw e;
    }
    // Otherwise, ignore JSON parse errors for successful responses
  }
}
