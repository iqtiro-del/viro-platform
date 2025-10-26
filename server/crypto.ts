import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

// Get encryption key from environment or generate one for development
const getEncryptionKey = (): Buffer => {
  const secretKey = process.env.ENCRYPTION_KEY || 'dev-encryption-key-replace-in-production-32char';
  return crypto.createHash('sha256').update(secretKey).digest();
};

/**
 * Encrypts sensitive text data
 * @param text - The text to encrypt
 * @returns Encrypted string in base64 format
 */
export function encrypt(text: string): string {
  if (!text || text.trim() === '') {
    return '';
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Combine salt + iv + tag + encrypted data
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return result.toString('base64');
}

/**
 * Decrypts encrypted text data
 * @param encryptedText - The encrypted text in base64 format
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || encryptedText.trim() === '') {
    return '';
  }

  try {
    const key = getEncryptionKey();
    const data = Buffer.from(encryptedText, 'base64');

    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = data.subarray(ENCRYPTED_POSITION);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Encrypts product credentials
 * @param credentials - Object containing credential fields
 * @returns Object with encrypted credential values (only includes provided fields)
 */
export function encryptCredentials(credentials: {
  accountUsername?: string;
  accountPassword?: string;
  accountEmail?: string;
  accountEmailPassword?: string;
}) {
  const result: any = {};
  
  if (credentials.accountUsername) {
    result.accountUsername = encrypt(credentials.accountUsername);
  }
  if (credentials.accountPassword) {
    result.accountPassword = encrypt(credentials.accountPassword);
  }
  if (credentials.accountEmail) {
    result.accountEmail = encrypt(credentials.accountEmail);
  }
  if (credentials.accountEmailPassword) {
    result.accountEmailPassword = encrypt(credentials.accountEmailPassword);
  }
  
  return result;
}

/**
 * Decrypts product credentials
 * @param encryptedCredentials - Object containing encrypted credential fields
 * @returns Object with decrypted credential values
 */
export function decryptCredentials(encryptedCredentials: {
  accountUsername?: string;
  accountPassword?: string;
  accountEmail?: string;
  accountEmailPassword?: string;
}) {
  return {
    accountUsername: encryptedCredentials.accountUsername ? decrypt(encryptedCredentials.accountUsername) : '',
    accountPassword: encryptedCredentials.accountPassword ? decrypt(encryptedCredentials.accountPassword) : '',
    accountEmail: encryptedCredentials.accountEmail ? decrypt(encryptedCredentials.accountEmail) : '',
    accountEmailPassword: encryptedCredentials.accountEmailPassword ? decrypt(encryptedCredentials.accountEmailPassword) : '',
  };
}
