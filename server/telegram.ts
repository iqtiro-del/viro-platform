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

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', imageBuffer, {
    filename: filename,
    contentType: 'image/jpeg'
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
    body: formData,
    headers: formData.getHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send to Telegram: ${JSON.stringify(error)}`);
  }
}
