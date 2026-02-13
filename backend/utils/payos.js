import { PayOS } from "@payos/node";

console.log('🔑 PayOS Environment Check:');
console.log('- CLIENT_ID:', process.env.PAYOS_CLIENT_ID || '❌ MISSING');
console.log('- API_KEY:', process.env.PAYOS_API_KEY ? '✅ EXISTS (length: ' + process.env.PAYOS_API_KEY.length + ')' : '❌ MISSING');
console.log('- CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? '✅ EXISTS (length: ' + process.env.PAYOS_CHECKSUM_KEY.length + ')' : '❌ MISSING');

if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    console.error('⚠️ CẢNH BÁO: Thiếu PayOS credentials trong .env file!');
}

const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    env: "sandbox",
});

export default payOS;


