import * as crypto from 'crypto';

export type EncryptedData = {
    data: string;
    iv: string;
};

export class Cipher {
    private encryptAlgorithm = 'aes-256-ctr';
    private readonly secret: string;

    public constructor(secret: string) {
        // Our encryption algorithm requires a signing secrets of exactly 32bytes
        if (secret.length !== 32) {
            throw Error('cipher secret must be 32 bytes');
        }
        this.secret = secret;
    }

    public encrypt(data: string): EncryptedData {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.encryptAlgorithm, this.secret, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        return {
            iv: iv.toString('hex'),
            data: encrypted.toString('hex')
        };
    }

    public decrypt(ed: EncryptedData): string {
        const decipher = crypto.createDecipheriv(
            this.encryptAlgorithm,
            this.secret,
            Buffer.from(ed.iv, 'hex')
        );
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(ed.data, 'hex')),
            decipher.final()
        ]);
        return decrypted.toString();
    }
}
