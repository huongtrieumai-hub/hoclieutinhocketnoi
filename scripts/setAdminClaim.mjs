/**
 * Script Node.js cấp quyền Admin (Firebase Custom Claims) bằng Firebase Admin SDK.
 * 
 * HƯỚNG DẪN SỬ DỤNG:
 * 1. Tải Service Account Key từ Firebase Console:
 *    - Vào Firebase Console -> Project Settings -> Service accounts
 *    - Nhấn "Generate new private key" và lưu thành file "serviceAccountKey.json" (cùng thư mục với script này).
 * 2. Cài đặt firebase-admin nếu chưa có:
 *    npm install firebase-admin
 * 3. Chạy script:
 *    node scripts/setAdminClaim.mjs <email_hoặc_uid>
 * 
 * Ví dụ:
 *    node scripts/setAdminClaim.mjs admin@school.edu.vn
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.error('❌ Lỗi: Vui lòng cung cấp Email hoặc UID của tài khoản cần cấp quyền Admin!');
  console.log('Ví dụ: node scripts/setAdminClaim.mjs admin@school.edu.vn');
  process.exit(1);
}

const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Không tìm thấy file "serviceAccountKey.json" tại thư mục gốc!');
  console.log('👉 Vui lòng vào Firebase Console -> Project Settings -> Service accounts -> Generate new private key và tải về.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function grantAdminClaim() {
  try {
    let userRecord;
    if (targetIdentifier.includes('@')) {
      userRecord = await admin.auth().getUserByEmail(targetIdentifier);
    } else {
      userRecord = await admin.auth().getUser(targetIdentifier);
    }

    console.log(`🔍 Đã tìm thấy tài khoản: ${userRecord.email || userRecord.uid}`);

    // Cấp Custom Claims: admin = true, role = 'admin'
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
    });

    console.log('✅ THÀNH CÔNG: Đã cấp quyền Admin (Custom Claim) cho tài khoản!');
    console.log('📋 Custom Claims hiện tại:');
    const updated = await admin.auth().getUser(userRecord.uid);
    console.log(JSON.stringify(updated.customClaims, null, 2));
    console.log('👉 Người dùng cần đăng xuất và đăng nhập lại trên Web App để nhận token mới chứa quyền Admin.');
  } catch (error) {
    console.error('❌ Lỗi khi cấp quyền Admin:', error.message);
  } finally {
    process.exit(0);
  }
}

grantAdminClaim();
