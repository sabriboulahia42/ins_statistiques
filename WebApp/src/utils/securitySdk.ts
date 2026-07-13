interface SecurityPayload {
    t: number;      // 13-digit Unix Timestamp
    n: string;      // Unique Single-Use Cryptographic Nonce
    d: string;      // Persistent Device-UUID (Hardware Anchor)
    sig: string;    // Calculated HMAC-SHA256 Client Signature
}

/**
 * Computes a browser-native SHA-256 HMAC signature using the Web Crypto API.
 * This completely avoids Node.js native 'crypto' dependency leaks during Vite compilation.
 */
async function computeBrowserHmac(secret: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    // Import raw secret bytes into the browser's cryptographic execution context
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Compute the deterministic signature bit-buffer array
    const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
    
    // Transform the binary array buffer directly into a clean hex string
    return Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Generates the standardized, platform-agnostic signed security invariant payload.
 */
export async function generateSecurityPayload(): Promise<SecurityPayload> {
    const timestamp = Date.now();

    // Browser-native, cryptographically secure random numbers generation
    const randomBuffer = new Uint8Array(16);
    window.crypto.getRandomValues(randomBuffer);
    const nonce = Array.from(randomBuffer).map(b => b.toString(16).padStart(2, '0')).join('');

    // Web hardware context anchor (Fallback unique token or session identifier mapping)
    const deviceUuid = "resolved-browser-client-id"; 

    // Serialization sequence MUST perfectly match the backend validation logic
    const messageToSign = `${timestamp}:${nonce}:${deviceUuid}`;

    // Read your client configuration parameter using Vite's explicit environment standard
    const clientSecret = import.meta.env.VITE_HMAC_CLIENT_SECRET || 'fallback-local-secret';
    
    const clientSignature = await computeBrowserHmac(clientSecret, messageToSign);

    return {
        t: timestamp,
        n: nonce,
        d: deviceUuid,
        sig: clientSignature
    };
}