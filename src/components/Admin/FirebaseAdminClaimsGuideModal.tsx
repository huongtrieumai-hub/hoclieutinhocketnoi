import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  FileCode,
  Copy,
  Check,
  X,
  AlertTriangle,
  Lock,
  Terminal,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseAdminClaimsGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const adminScriptCode = `// scripts/setAdminClaim.mjs
import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const targetEmail = process.argv[2] || 'admin@school.edu.vn';

async function grantAdmin() {
  const user = await admin.auth().getUserByEmail(targetEmail);
  // Gán Custom Claim admin = true vào token Firebase Auth
  await admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
    role: 'admin',
  });
  console.log(\`✅ Đã cấp quyền Admin cho \${targetEmail} thành công!\`);
}

grantAdmin();`;

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    // Kiểm tra quyền Admin bằng Firebase Custom Claims
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        request.auth.token.role == 'admin'
      );
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Bài học: Mọi học sinh đều được đọc, CHỈ Admin được thêm/sửa/xóa
    match /lessons/{lessonId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Người dùng: Học sinh không thể tự phong quyền Admin
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId) && (!('role' in request.resource.data) || request.resource.data.role == 'student' || isAdmin());
      allow update: if isAdmin() || (isOwner(userId) && request.resource.data.role == resource.data.role);
      allow delete: if isAdmin();
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-2xl font-black">
              🛡️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                Bảo Mật Phân Quyền &amp; Firebase Custom Claims
              </h2>
              <p className="text-xs text-slate-300">
                Hướng dẫn xác thực vai trò Admin và thiết lập quy tắc bảo mật phía máy chủ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Card 1: Tại sao dùng Custom Claims? */}
          <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-2xl space-y-2">
            <h3 className="font-black text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>1. Tại sao dùng Firebase Custom Claims thay vì lưu role ở Firestore?</span>
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Nếu chỉ lưu vai trò <code>role: &quot;admin&quot;</code> trong Firestore, kẻ xấu có thể can thiệp mã JavaScript ở trình duyệt để giả mạo quyền. 
              <strong> Firebase Custom Claims</strong> là thuộc tính được ký điện tử mã hóa trực tiếp trong JSON Web Token (JWT) của người dùng bởi máy chủ Google. 
              Mã phía máy khách (Client) <strong>hoàn toàn không thể tự sửa đổi hoặc nâng quyền</strong>.
            </p>
          </div>

          {/* Card 2: Hướng dẫn cấp quyền Admin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                <span>2. Cách cấp quyền Admin đầu tiên bằng Firebase Admin SDK</span>
              </h3>
              <button
                onClick={() => handleCopy(adminScriptCode, 'script')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode === 'script' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 pl-1 font-semibold">
              <li>Đăng ký một tài khoản trên Web App bằng email của Thầy/Cô (ví dụ: <code>admin@school.edu.vn</code>).</li>
              <li>Vào <strong>Firebase Console</strong> → <strong>Project Settings</strong> → tab <strong>Service accounts</strong> → Nhấn <strong>Generate new private key</strong> và lưu file thành <code>serviceAccountKey.json</code> ở thư mục dự án.</li>
              <li>Chạy lệnh sau trong terminal để cấp quyền:</li>
            </ol>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto">
              <code>node scripts/setAdminClaim.mjs admin@school.edu.vn</code>
            </pre>
          </div>

          {/* Card 3: Quy tắc Firebase Security Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>3. Firebase Security Rules đã kích hoạt trên Firestore</span>
              </h3>
              <button
                onClick={() => handleCopy(firestoreRulesCode, 'rules')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode === 'rules' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép Rules</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-52">
              <code>{firestoreRulesCode}</code>
            </pre>
          </div>

          {/* Card 4: Nguyên tắc an toàn dữ liệu */}
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl space-y-2 text-xs text-amber-900">
            <div className="font-black flex items-center gap-2 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>4. Tuân thủ bảo mật tuyệt đối:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 font-semibold">
              <li><strong>Không lưu mật khẩu trong Firestore:</strong> Mật khẩu chỉ được xử lý qua hạ tầng bảo mật của Firebase Authentication.</li>
              <li><strong>Không đưa Service Account Key vào Client:</strong> File khóa quản trị chỉ dùng trong môi trường dòng lệnh Node.js nội bộ, không bao giờ bundle vào trình duyệt.</li>
              <li><strong>Bảo vệ dữ liệu học sinh:</strong> Học sinh chỉ xem và làm bài của mình, không truy cập bảng điều khiển quản trị hay xem điểm bạn khác.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition cursor-pointer"
          >
            Đã Hiểu &amp; Đóng Hướng Dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
