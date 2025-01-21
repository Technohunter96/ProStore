const encoder = new TextEncoder();
const key = encoder.encode(process.env.ENCRYPTION_KEY); // Retrieve key from env var

// Function to generate a random salt
const generateSalt = (length = 16) => {
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
};

// Hash function with key-based encryption and salt
export const hash = async (plainPassword: string): Promise<string> => {
  const salt = generateSalt(); // Generate a random salt
  const passwordData = encoder.encode(plainPassword + salt); // Append salt to the password

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign', 'verify'],
  );

  const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, passwordData);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${salt}:${hashHex}`; // Return salt and hash separated by a colon
};

// Compare function using key from env var
export const compare = async (
  plainPassword: string,
  storedHash: string,
): Promise<boolean> => {
  const [salt, hash] = storedHash.split(':'); // Extract salt and hash
  const passwordData = encoder.encode(plainPassword + salt);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign', 'verify'],
  );

  const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, passwordData);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex === hash; // Compare the calculated hash with the stored hash
};
