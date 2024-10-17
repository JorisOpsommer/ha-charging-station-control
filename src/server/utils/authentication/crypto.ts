// import { db } from "~/server/db"
// import crypto from 'crypto';

// export const encryptValue = (value:string) => {

//     db.systemSetting.
// }

// const ensureCryptoStringExistsInDb = async () => {
//    let cryptoKey =await  db.systemSetting.findFirst({where: {key :'cryptoKey'}})
//    let cryptoIv =await  db.systemSetting.findFirst({where: {key :'cryptoIv'}})
//    if(!cryptoKey || !cryptoIv){
//     //generate new crypto string
//     const key = crypto.randomBytes(32); // Key should be 256 bits (32 bytes) for AES-256
//     const iv = crypto.randomBytes(16);
// db.systemSetting.create({data: {key: 'cryptoKey',value: key.toString()}})

//    }
// }

// function encrypt(text) {
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
//     let encrypted = cipher.update(text);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
// }

// function decrypt(text) {
//     let iv = Buffer.from(text.iv, 'hex');
//     let encryptedText = Buffer.from(text.encryptedData, 'hex');
//     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
// }
