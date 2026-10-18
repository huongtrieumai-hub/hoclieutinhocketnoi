import { UserAccount, GradeLevel } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdTokenResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

/**
 * SHA-256 password hashing with salt using standard Web Crypto API.
 * Ensures passwords are never stored in plaintext in Firestore or localStorage.
 */
export async function hashPassword(password: string, salt: string = 'hoclieu_tin_hoc_kntt_v1'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pre-generated SHA-256 hashes with default salt 'hoclieu_tin_hoc_kntt_v1'
// '123456' -> 18a8b1...
// 'admin123' -> 4c0e52...
const DEFAULT_SALT = 'hoclieu_tin_hoc_kntt_v1';
const HASH_123456 = '87a55bb883b276d8b9d37533fbef023d8c116d9bbda13b0c26ee3b6a948e9f28';
const HASH_ADMIN = 'bfa881b83df5a6b7e63b7235552a403bb0f156d9a8c8e1e79313dbfe57bc6a4b';

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'user_hs3',
    username: 'hocsinh3',
    passwordHash: HASH_123456,
    salt: DEFAULT_SALT,
    fullName: 'Nguyễn Minh An',
    role: 'student',
    grade: 3,
    schoolClass: '3A',
    status: 'active',
    avatar: '👦',
    bio: 'Yêu thích khám phá 4 bộ phận máy tính & chuột thông minh',
    stars: 15,
    badges: ['Bàn tay vàng', 'Nhà thông thái nhí'],
    createdAt: '2026-09-01',
  },
  {
    id: 'user_hs4',
    username: 'hocsinh4',
    passwordHash: HASH_123456,
    salt: DEFAULT_SALT,
    fullName: 'Trần Bảo Ngọc',
    role: 'student',
    grade: 4,
    schoolClass: '4B',
    status: 'active',
    avatar: '👧',
    bio: 'Thích vẽ tranh Paint & soạn thảo văn bản tiếng Việt có dấu',
    stars: 24,
    badges: ['Gõ phím thần tốc', 'Hiệp sĩ An toàn số'],
    createdAt: '2026-09-01',
  },
  {
    id: 'user_hs5',
    username: 'hocsinh5',
    passwordHash: HASH_123456,
    salt: DEFAULT_SALT,
    fullName: 'Lê Tuấn Kiệt',
    role: 'student',
    grade: 5,
    schoolClass: '5C',
    status: 'active',
    avatar: '🚀',
    bio: 'Đam mê sắp xếp thư mục khoa học & lập trình Scratch Mèo Vàng',
    stars: 36,
    badges: ['Lập trình viên nhí', 'Quản trị tệp tin'],
    createdAt: '2026-09-01',
  },
  {
    id: 'user_teacher',
    username: 'giaovien',
    passwordHash: HASH_123456,
    salt: DEFAULT_SALT,
    fullName: 'Cô Triệu Mai Hường',
    role: 'teacher',
    status: 'active',
    avatar: '👩‍🏫',
    bio: 'Giáo viên Tin học Tiểu học - Bộ sách Kết nối tri thức với cuộc sống',
    stars: 120,
    badges: ['Giáo viên xuất sắc', 'Sáng tạo học liệu số'],
    createdAt: '2026-08-15',
  },
  {
    id: 'user_admin',
    username: 'admin',
    passwordHash: HASH_ADMIN,
    salt: DEFAULT_SALT,
    fullName: 'Quản Trị Hệ Thống',
    role: 'admin',
    status: 'active',
    avatar: '👨‍💻',
    bio: 'Quản trị toàn quyền phân quyền, sao lưu dữ liệu & ngân hàng bài giảng',
    stars: 999,
    badges: ['Tổng quản trị', 'Bảo mật số'],
    createdAt: '2026-08-01',
  },
];

const AUTH_STORAGE_KEY = 'hoc_lieu_tin_hoc_current_user_v2';
const ACCOUNTS_STORAGE_KEY = 'hoc_lieu_tin_hoc_accounts_list_v2';
const RATE_LIMIT_STORAGE_KEY = 'hoc_lieu_auth_rate_limit_v1';

// Rate limiting data structure
interface FailedAttemptInfo {
  count: number;
  lastAttemptTime: number;
}

export const AuthService = {
  // Check and enforce rate limiting for login attempts
  getRateLimitStatus(username: string): { isBlocked: boolean; remainingSeconds: number } {
    try {
      const data = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (!data) return { isBlocked: false, remainingSeconds: 0 };
      const attempts: Record<string, FailedAttemptInfo> = JSON.parse(data);
      const info = attempts[username.toLowerCase()];
      if (!info) return { isBlocked: false, remainingSeconds: 0 };

      const BLOCK_WINDOW_MS = 60 * 1000; // 60 seconds
      const MAX_ATTEMPTS = 5;

      const elapsed = Date.now() - info.lastAttemptTime;
      if (info.count >= MAX_ATTEMPTS && elapsed < BLOCK_WINDOW_MS) {
        return {
          isBlocked: true,
          remainingSeconds: Math.ceil((BLOCK_WINDOW_MS - elapsed) / 1000),
        };
      }

      // Expired window
      if (elapsed >= BLOCK_WINDOW_MS) {
        delete attempts[username.toLowerCase()];
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(attempts));
      }
    } catch (e) {
      console.warn('Rate limit check error:', e);
    }
    return { isBlocked: false, remainingSeconds: 0 };
  },

  recordFailedAttempt(username: string): number {
    try {
      const data = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      const attempts: Record<string, FailedAttemptInfo> = data ? JSON.parse(data) : {};
      const key = username.toLowerCase();
      const current = attempts[key] || { count: 0, lastAttemptTime: Date.now() };

      current.count += 1;
      current.lastAttemptTime = Date.now();
      attempts[key] = current;
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(attempts));
      return current.count;
    } catch (e) {
      console.warn('Rate limit record error:', e);
      return 1;
    }
  },

  clearFailedAttempts(username: string): void {
    try {
      const data = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (!data) return;
      const attempts: Record<string, FailedAttemptInfo> = JSON.parse(data);
      delete attempts[username.toLowerCase()];
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Rate limit clear error:', e);
    }
  },

  // Get all accounts (local fallback + sync)
  getAllAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (data) {
        const parsed: UserAccount[] = JSON.parse(data);
        return parsed.map((a) => {
          // Clean legacy plaintext passwords
          const { password: _pw, ...clean } = a;
          if (clean.id === 'user_admin' || clean.username === 'admin') {
            clean.fullName = 'Quản Trị Hệ Thống';
          }
          if (!clean.status) {
            clean.status = 'active';
          }
          return clean;
        });
      }
    } catch (e) {
      console.error('Error reading accounts from storage:', e);
    }
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEMO_ACCOUNTS));
    return DEMO_ACCOUNTS;
  },

  // Save sanitized account to Firestore and local (Never saves plaintext password)
  async saveAccountToFirestore(user: UserAccount): Promise<void> {
    const { password: _p, ...sanitized } = user;
    try {
      await setDoc(doc(db, 'users', sanitized.id), sanitized);
    } catch (e) {
      console.warn('[Firestore] Could not write user to Firestore:', e);
    }

    // Also update local storage
    try {
      const currentList = this.getAllAccounts();
      const index = currentList.findIndex((u) => u.id === sanitized.id);
      if (index >= 0) {
        currentList[index] = { ...currentList[index], ...sanitized };
      } else {
        currentList.push(sanitized);
      }
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(currentList));
    } catch (e) {
      console.warn('Local accounts sync error:', e);
    }
  },

  // Fetch all accounts from Firestore with fallback to local
  async fetchAllAccounts(): Promise<UserAccount[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const firestoreUsers = snap.docs.map((d) => d.data() as UserAccount);
        // Combine with default demo accounts if not already present
        const combined = [...firestoreUsers];
        for (const demo of DEMO_ACCOUNTS) {
          if (!combined.some((u) => u.username.toLowerCase() === demo.username.toLowerCase())) {
            combined.push(demo);
            // Sync missing demo to Firestore
            setDoc(doc(db, 'users', demo.id), demo).catch(console.error);
          }
        }
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(combined));
        return combined;
      }
    } catch (e) {
      console.warn('[Firestore] Could not fetch remote users, using local cache:', e);
    }
    return this.getAllAccounts();
  },

  // Sign in directly using Firebase Authentication (Email + Password)
  // Extracts and verifies Firebase Custom Claims (admin / role: 'admin')
  async signInWithEmail(
    emailInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    try {
      const cleanEmail = emailInput.trim();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      const fbUser = cred.user;

      // Extract Custom Claims with forced token refresh
      const tokenResult = await getIdTokenResult(fbUser, true);
      // Recognized system admin emails
      const SYSTEM_ADMIN_EMAILS = [
        'maihuong2531990@gmail.com',
        'huong.trieumai@gmail.com',
        'admin@hoclieu.edu.vn',
      ];
      const isSystemAdminEmail = SYSTEM_ADMIN_EMAILS.includes(cleanEmail.toLowerCase());
      const hasAdminClaim = Boolean(
        tokenResult.claims.admin === true ||
        tokenResult.claims.role === 'admin'
      );
      const isAdmin = Boolean(hasAdminClaim || isSystemAdminEmail);

      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

      let userAccount: UserAccount;
      if (snap.exists()) {
        userAccount = snap.data() as UserAccount;
        if (isAdmin || userAccount.role === 'admin') {
          userAccount.role = 'admin';
          userAccount.customClaims = { admin: true, role: 'admin' };
        } else {
          userAccount.role = userAccount.role || 'student';
          userAccount.customClaims = { admin: false, role: 'student' };
        }
        userAccount.email = fbUser.email || cleanEmail;
      } else {
        userAccount = {
          id: fbUser.uid,
          email: fbUser.email || cleanEmail,
          username: fbUser.email?.split('@')[0] || `user_${fbUser.uid.slice(0, 6)}`,
          fullName: isAdmin ? 'Cô Triệu Mai Hường (Admin)' : (fbUser.displayName || 'Học Sinh'),
          role: isAdmin ? 'admin' : 'student',
          status: 'active',
          avatar: isAdmin ? '👩‍🏫' : '👦',
          stars: isAdmin ? 999 : 10,
          badges: isAdmin ? ['Quản trị viên', 'Giáo viên xuất sắc', 'Bảo mật hệ thống'] : ['Tài khoản Firebase Auth'],
          createdAt: new Date().toISOString().split('T')[0],
          customClaims: {
            admin: isAdmin,
            role: isAdmin ? 'admin' : 'student',
          },
        };
      }

      await setDoc(userRef, userAccount, { merge: true });
      this.setCurrentUser(userAccount);
      return { success: true, user: userAccount };
    } catch (err: unknown) {
      console.error('[Firebase Auth] signInWithEmail error:', err);
      const code = (err as { code?: string })?.code;
      let msg = 'Đăng nhập không thành công.';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'Email hoặc mật khẩu chưa chính xác. Vui lòng kiểm tra lại!';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Đã thử đăng nhập sai quá nhiều lần. Vui lòng chờ ít phút rồi thử lại.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Địa chỉ email không hợp lệ. Ví dụ: admin@school.edu.vn';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      return { success: false, message: msg };
    }
  },

  // Register new student account with Firebase Authentication (Email + Password)
  // Per requirement 7: Regular users can never grant themselves Admin claims
  async registerWithEmail(data: {
    email: string;
    password: string;
    fullName: string;
    grade: GradeLevel;
    avatar?: string;
  }): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    try {
      const cleanEmail = data.email.trim();
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      const fbUser = cred.user;

      const newAccount: UserAccount = {
        id: fbUser.uid,
        email: cleanEmail,
        username: cleanEmail.split('@')[0] || `hs_${fbUser.uid.slice(0, 6)}`,
        fullName: data.fullName.trim(),
        role: 'student', // ALWAYS student on self-registration
        grade: data.grade,
        schoolClass: `Lớp ${data.grade}`,
        status: 'active',
        avatar: data.avatar || (data.grade === 3 ? '👦' : data.grade === 4 ? '👧' : '🚀'),
        stars: 10,
        badges: ['Tân binh chăm chỉ', 'Học liệu số KNTT'],
        createdAt: new Date().toISOString().split('T')[0],
        customClaims: {
          admin: false,
          role: 'student',
        },
      };

      // Save sanitized user profile to Firestore (never saves password in Firestore)
      await setDoc(doc(db, 'users', fbUser.uid), newAccount);
      this.setCurrentUser(newAccount);
      return { success: true, user: newAccount };
    } catch (err: unknown) {
      console.error('[Firebase Auth] registerWithEmail error:', err);
      const code = (err as { code?: string })?.code;
      let msg = 'Đăng ký không thành công.';
      if (code === 'auth/email-already-in-use') {
        msg = 'Email này đã được sử dụng. Vui lòng chọn email khác hoặc chuyển sang Đăng nhập!';
      } else if (code === 'auth/weak-password') {
        msg = 'Mật khẩu cần tối thiểu 6 ký tự.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Địa chỉ email không đúng định dạng. Ví dụ: hocsinh@gmail.com';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      return { success: false, message: msg };
    }
  },

  // Authenticate user with Email or Username & password
  async login(
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    const cleanUser = usernameInput.trim();
    // If input is an email, authenticate via Firebase Auth directly
    if (cleanUser.includes('@')) {
      return this.signInWithEmail(cleanUser, passwordInput);
    }
    const cleanPass = passwordInput.trim();

    // Check rate limit
    const rateCheck = this.getRateLimitStatus(cleanUser);
    if (rateCheck.isBlocked) {
      return {
        success: false,
        message: `Em hoặc Thầy/Cô đã nhập sai quá 5 lần liên tiếp. Để bảo mật, vui lòng đợi ${rateCheck.remainingSeconds} giây nữa rồi thử lại nhé!`,
      };
    }

    // Load accounts from Firestore first or local
    let accounts: UserAccount[] = [];
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        accounts = snap.docs.map((d) => d.data() as UserAccount);
      }
    } catch (e) {
      console.warn('[Firestore] Login lookup query failed, fallback to local:', e);
    }
    if (accounts.length === 0) {
      accounts = this.getAllAccounts();
    }

    const matched = accounts.find((a) => a.username.toLowerCase() === cleanUser);

    if (!matched) {
      this.recordFailedAttempt(cleanUser);
      return {
        success: false,
        message: 'Tên đăng nhập không tồn tại! Các em hoặc Thầy/Cô hãy kiểm tra lại nhé.',
      };
    }

    // Check account status
    if (matched.status === 'locked') {
      return {
        success: false,
        message: 'Tài khoản của em hiện đang bị tạm khóa. Vui lòng liên hệ Thầy/Cô quản trị để mở lại nhé!',
      };
    }

    if (matched.status === 'pending') {
      return {
        success: false,
        message: 'Tài khoản của em đang chờ Thầy/Cô giáo quản trị duyệt kích hoạt. Em hãy nhờ Thầy/Cô kiểm tra nhé!',
      };
    }

    // Password verification using SHA-256 hash
    let isPasswordCorrect = false;

    if (matched.passwordHash) {
      const computedHash = await hashPassword(cleanPass, matched.salt || DEFAULT_SALT);
      if (computedHash === matched.passwordHash) {
        isPasswordCorrect = true;
      }
    } else if (matched.password) {
      // Legacy check fallback, then immediately upgrade to hash
      if (matched.password === cleanPass) {
        isPasswordCorrect = true;
        const newHash = await hashPassword(cleanPass, DEFAULT_SALT);
        matched.passwordHash = newHash;
        matched.salt = DEFAULT_SALT;
        delete matched.password;
        this.saveAccountToFirestore(matched).catch(console.error);
      }
    } else {
      // Demo password fallback
      if (cleanUser === 'admin' && cleanPass === 'admin123') isPasswordCorrect = true;
      if (cleanUser !== 'admin' && cleanPass === '123456') isPasswordCorrect = true;
    }

    if (!isPasswordCorrect) {
      const fails = this.recordFailedAttempt(cleanUser);
      const remaining = Math.max(0, 5 - fails);
      return {
        success: false,
        message:
          remaining > 0
            ? `Mật khẩu chưa chính xác! Em còn ${remaining} lần thử trước khi bị tạm khóa bảo vệ.`
            : 'Mật khẩu sai quá 5 lần. Hệ thống tạm khóa 60 giây để bảo vệ tài khoản!',
      };
    }

    // Success! Clear failed attempts
    this.clearFailedAttempts(cleanUser);

    // Sanitize user before saving session
    const { password: _p, ...cleanUserAccount } = matched;
    this.setCurrentUser(cleanUserAccount);
    return { success: true, user: cleanUserAccount };
  },

  // Fast demo login for instant access
  async quickDemoLogin(demoUsername: string): Promise<UserAccount | null> {
    const accounts = this.getAllAccounts();
    const matched = accounts.find((a) => a.username.toLowerCase() === demoUsername.toLowerCase());
    if (matched) {
      const { password: _p, ...clean } = matched;
      this.setCurrentUser(clean);
      this.clearFailedAttempts(clean.username);
      this.saveAccountToFirestore(clean).catch(console.error);
      return clean;
    }
    return null;
  },

  // Register / Add new student account
  async register(
    accountData: {
      fullName: string;
      username: string;
      password: string;
      grade: GradeLevel;
      schoolClass: string;
      avatar?: string;
    },
    autoActivate: boolean = true
  ): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const cleanUsername = accountData.username.trim().toLowerCase();

    // Check duplicate username across remote and local
    const accounts = await this.fetchAllAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        message: `Tên đăng nhập "${cleanUsername}" đã có bạn khác sử dụng! Em vui lòng chọn tên đăng nhập khác nhé.`,
      };
    }

    // Hash password securely with fresh salt
    const salt = `salt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await hashPassword(accountData.password.trim(), salt);

    const newAcc: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      passwordHash,
      salt,
      fullName: accountData.fullName.trim(),
      role: 'student',
      grade: accountData.grade,
      schoolClass: accountData.schoolClass.trim(),
      avatar: accountData.avatar || (accountData.grade === 3 ? '👦' : accountData.grade === 4 ? '👧' : '🚀'),
      stars: 5, // Welcome gift
      badges: ['Tân binh chăm chỉ', 'Kết nối tri thức'],
      status: autoActivate ? 'active' : 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Save to Firestore and local
    await this.saveAccountToFirestore(newAcc);

    return {
      success: true,
      message: autoActivate
        ? 'Chúc mừng! Em đã tạo tài khoản thành công.'
        : 'Chúc mừng! Em đã đăng ký tài khoản thành công. Tài khoản sẽ sớm được Thầy/Cô kích hoạt!',
      user: newAcc,
    };
  },

  // Reset student password (Admin/Teacher operation or verified recovery)
  async resetPassword(userId: string, newPlainPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const accounts = await this.fetchAllAccounts();
      const user = accounts.find((a) => a.id === userId);
      if (!user) {
        return { success: false, message: 'Không tìm thấy tài khoản học sinh để đặt lại mật khẩu.' };
      }

      const salt = `salt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const passwordHash = await hashPassword(newPlainPassword.trim(), salt);

      user.passwordHash = passwordHash;
      user.salt = salt;
      delete user.password;

      await this.saveAccountToFirestore(user);
      this.clearFailedAttempts(user.username);

      return {
        success: true,
        message: `Đã đặt lại mật khẩu thành công cho học sinh "${user.fullName}"! Mật khẩu mới: ${newPlainPassword}`,
      };
    } catch (e) {
      console.error('Password reset error:', e);
      return { success: false, message: 'Lỗi khi đặt lại mật khẩu. Vui lòng thử lại!' };
    }
  },

  // Update account status: 'active' | 'pending' | 'locked'
  async updateAccountStatus(
    userId: string,
    newStatus: 'active' | 'pending' | 'locked'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const accounts = await this.fetchAllAccounts();
      const user = accounts.find((a) => a.id === userId);
      if (!user) {
        return { success: false, message: 'Không tìm thấy tài khoản người dùng!' };
      }

      user.status = newStatus;
      await this.saveAccountToFirestore(user);

      const statusMap = {
        active: 'Kích hoạt thành công',
        pending: 'Chuyển sang trạng thái chờ duyệt',
        locked: 'Đã khóa tài khoản',
      };

      return {
        success: true,
        message: `Đã cập nhật trạng thái tài khoản "${user.fullName}": ${statusMap[newStatus]}!`,
      };
    } catch (e) {
      console.error('Status update error:', e);
      return { success: false, message: 'Lỗi khi cập nhật trạng thái tài khoản.' };
    }
  },

  // Delete an account (Admin only)
  async deleteAccount(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      await deleteDoc(doc(db, 'users', userId));
      const list = this.getAllAccounts().filter((a) => a.id !== userId);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(list));
      return { success: true, message: 'Đã xóa tài khoản thành công.' };
    } catch (e) {
      console.error('Account delete error:', e);
      return { success: false, message: 'Lỗi khi xóa tài khoản.' };
    }
  },

  // Student self password recovery by verifying student identity
  async recoverStudentPassword(
    usernameInput: string,
    fullNameInput: string,
    schoolClassInput: string,
    newPasswordInput: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanName = fullNameInput.trim().toLowerCase();
    const cleanClass = schoolClassInput.trim().toLowerCase();

    const accounts = await this.fetchAllAccounts();
    const matched = accounts.find(
      (a) =>
        a.username.toLowerCase() === cleanUser &&
        a.fullName.toLowerCase() === cleanName &&
        a.schoolClass?.toLowerCase() === cleanClass
    );

    if (!matched) {
      return {
        success: false,
        message: 'Thông tin xác minh chưa khớp! Vui lòng kiểm tra lại Họ tên, Tên đăng nhập và Lớp học của em, hoặc liên hệ Thầy/Cô để được hỗ trợ trực tiếp.',
      };
    }

    return await this.resetPassword(matched.id, newPasswordInput);
  },

  // Google sign in integration
  async signInWithGoogle(preferredRole: 'student' | 'teacher' = 'student'): Promise<{
    success: boolean;
    user?: UserAccount;
    message?: string;
  }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      if (!fbUser) {
        return { success: false, message: 'Không thể nhận diện thông tin tài khoản Google.' };
      }

      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);

      let userAccount: UserAccount;
      if (snap.exists()) {
        userAccount = snap.data() as UserAccount;
      } else {
        userAccount = {
          id: fbUser.uid,
          username: fbUser.email?.split('@')[0] || `user_${fbUser.uid.slice(0, 6)}`,
          fullName: fbUser.displayName || 'Người dùng Google',
          role: preferredRole === 'teacher' ? 'teacher' : 'student',
          grade: 3,
          schoolClass: preferredRole === 'teacher' ? undefined : '3A',
          status: 'active',
          avatar: preferredRole === 'teacher' ? '👩‍🏫' : '🎒',
          stars: 10,
          badges: ['Tài khoản Google liên kết'],
          createdAt: new Date().toISOString().split('T')[0],
        };
        await setDoc(userRef, userAccount);
      }

      this.setCurrentUser(userAccount);
      return { success: true, user: userAccount };
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        return { success: false, message: 'Cửa sổ đăng nhập Google đã được đóng.' };
      }
      return { success: false, message: 'Đăng nhập Google không thành công: ' + msg };
    }
  },

  // Get currently active logged-in user
  getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        const parsed: UserAccount = JSON.parse(data);
        if (
          parsed.id === 'user_admin' ||
          parsed.username === 'admin' ||
          parsed.fullName === 'Thầy Quản Trị Hệ Thống'
        ) {
          parsed.fullName = 'Quản Trị Hệ Thống';
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        }
        if (parsed.fullName && parsed.fullName.includes('Hương')) {
          parsed.fullName = parsed.fullName.replace(/Hương/g, 'Hường');
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading current user:', e);
    }
    return null;
  },

  // Set logged in user
  setCurrentUser(user: UserAccount | null): void {
    if (typeof localStorage === 'undefined') return;
    if (user) {
      const { password: _p, ...clean } = user;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(clean));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  // Logout
  async logout(): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout skipped:', e);
    }
  },

  // Attach auth state change listener with Custom Claims verification
  onAuthStateChange(callback: (user: UserAccount | null) => void): () => void {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Check Custom Claims or Admin emails from token
          const tokenResult = await getIdTokenResult(fbUser, false);
          const SYSTEM_ADMIN_EMAILS = [
            'maihuong2531990@gmail.com',
            'huong.trieumai@gmail.com',
            'admin@hoclieu.edu.vn',
          ];
          const isSystemAdminEmail = Boolean(fbUser.email && SYSTEM_ADMIN_EMAILS.includes(fbUser.email.toLowerCase()));
          const hasAdminClaim = Boolean(
            tokenResult.claims.admin === true ||
            tokenResult.claims.role === 'admin' ||
            isSystemAdminEmail
          );

          const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (userSnap.exists()) {
            const acc = userSnap.data() as UserAccount;
            if (hasAdminClaim || acc.role === 'admin') {
              acc.role = 'admin';
            }
            acc.customClaims = {
              admin: hasAdminClaim || acc.role === 'admin',
              role: (hasAdminClaim || acc.role === 'admin') ? 'admin' : (acc.role || 'student'),
            };
            this.setCurrentUser(acc);
            callback(acc);
            return;
          }
        } catch (e) {
          console.warn('[Firestore] Failed to fetch onAuthStateChanged user:', e);
        }
      }
      callback(this.getCurrentUser());
    });
  },
};
