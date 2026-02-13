// test-payos.js
import 'dotenv/config';
import { PayOS } from "@payos/node";

const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

async function testPayOS() {
    try {
        console.log('🔑 PayOS Credentials Check:');
        console.log('- CLIENT_ID:', process.env.PAYOS_CLIENT_ID || '❌ MISSING');
        console.log('- API_KEY:', process.env.PAYOS_API_KEY ? '✅ EXISTS' : '❌ MISSING');
        console.log('- CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? '✅ EXISTS' : '❌ MISSING');
        console.log('');

        console.log('🧪 Testing PayOS connection...');

        const currentTime = Math.floor(Date.now() / 1000);
        const orderCode = currentTime; // Dùng timestamp làm orderCode

        const body = {
            orderCode: orderCode,
            amount: 2000, // Tối thiểu 2000 VND
            description: "Thanh toan don hang",
            returnUrl: "https://your-domain.com/payment-success",
            cancelUrl: "https://your-domain.com/payment-cancel"
        };

        console.log('📝 Payment data:', body);
        console.log('');

        try {
            const result = await payOS.post('/v2/payment-requests', body);

            console.log('✅ SUCCESS! PayOS is working!');
            console.log('📊 Full Response:', JSON.stringify(result, null, 2));
            console.log('🔗 Checkout URL:', result.data?.checkoutUrl || result.checkoutUrl);

        } catch (apiError) {
            console.error('❌ API Error Details:');
            console.error('- Message:', apiError.message);
            console.error('- Code:', apiError.code);
            console.error('- Desc:', apiError.desc);
            console.error('- Status:', apiError.status);

            // Log response body nếu có
            if (apiError.error) {
                console.error('- Error object:', apiError.error);
            }

            throw apiError;
        }

    } catch (error) {
        console.error('');
        console.error('💡 Gợi ý:');
        console.error('1. Kiểm tra lại Client ID, API Key, Checksum Key');
        console.error('2. Đảm bảo merchant đã được kích hoạt trên PayOS');
        console.error('3. Kiểm tra amount >= 2000 VND');
        console.error('4. URL phải là https:// (không dùng localhost cho production)');
    }
}

testPayOS();