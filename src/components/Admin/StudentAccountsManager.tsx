import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, GradeLevel, SchoolClass } from '../../types';
import { AuthService } from '../../data/authData';
import { FirestoreService, DEFAULT_CLASSES } from '../../services/firestoreService';
import { FirebaseAdminClaimsGuideModal } from './FirebaseAdminClaimsGuideModal';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  GraduationCap,
  School,
  Sparkles,
  Plus,
  RotateCcw,
  Star,
  Clock,
  Check,
  X,
  Pencil,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  currentUser: UserAccount | null;
}

export const StudentAccountsManager: React.FC<Props> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>(DEFAULT_CLASSES);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'all'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'locked'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');

  // Modals
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [isClaimsGuideOpen, setIsClaimsGuideOpen] = useState(false);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('123456');

  // Edit account modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTargetUser, setEditTargetUser] = useState<UserAccount | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editGrade, setEditGrade] = useState<GradeLevel>(3);
  const [editClass, setEditClass] = useState('3A');
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [editStatus, setEditStatus] = useState<'active' | 'pending' | 'locked'>('active');
  const [editAvatar, setEditAvatar] = useState('👦');

  // New account form
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newGrade, setNewGrade] = useState<GradeLevel>(3);
  const [newClass, setNewClass] = useState('3A');
  const [newRole, setNewRole] = useState<'student' | 'teacher'>('student');

  // New class form
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>(3);
  const [newClassTeacher, setNewClassTeacher] = useState(currentUser?.fullName || 'Cô Triệu Mai Hường');

  // Alert feedback
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load accounts and classes
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedClasses] = await Promise.all([
        AuthService.fetchAllAccounts(),
        FirestoreService.getClasses(),
      ]);
      setUsers(fetchedUsers);
      if (fetchedClasses && fetchedClasses.length > 0) {
        setClasses(fetchedClasses);
      }
    } catch (e) {
      console.warn('Error loading admin accounts/classes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const unsubClasses = FirestoreService.subscribeClasses((cls) => {
      if (cls && cls.length > 0) setClasses(cls);
    });
    const unsubUsers = FirestoreService.subscribeUsers((usrs) => {
      if (usrs && usrs.length > 0) setUsers(usrs);
    });
    return () => {
      unsubClasses();
      unsubUsers();
    };
  }, []);

  // Filtered accounts
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filterRole !== 'all' && u.role !== filterRole) return false;
      if (filterGrade !== 'all' && u.grade !== filterGrade) return false;
      if (filterClass !== 'all' && u.schoolClass !== filterClass) return false;
      if (filterStatus !== 'all' && (u.status || 'active') !== filterStatus) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = u.fullName.toLowerCase().includes(q);
        const matchUser = u.username.toLowerCase().includes(q);
        const matchClass = u.schoolClass?.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchClass) return false;
      }
      return true;
    });
  }, [users, filterRole, filterGrade, filterClass, filterStatus, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === 'student').length;
    const pending = users.filter((u) => u.status === 'pending').length;
    const locked = users.filter((u) => u.status === 'locked').length;
    return { total, students, pending, locked };
  }, [users]);

  // ===================== ACTIONS =====================

  const handleToggleStatus = async (user: UserAccount, newStatus: 'active' | 'locked') => {
    const res = await AuthService.updateAccountStatus(user.id, newStatus);
    if (res.success) {
      showNotification('success', res.message);
      refreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleActivatePending = async (user: UserAccount) => {
    const res = await AuthService.updateAccountStatus(user.id, 'active');
    if (res.success) {
      confetti({ particleCount: 50, spread: 60 });
      showNotification('success', `Đã kích hoạt thành công tài khoản cho em "${user.fullName}"!`);
      refreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordTarget) return;
    if (newPasswordValue.length < 6) {
      showNotification('error', 'Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    const res = await AuthService.resetPassword(resetPasswordTarget.id, newPasswordValue);
    if (res.success) {
      confetti({ particleCount: 50, spread: 60 });
      showNotification('success', res.message);
      setResetPasswordTarget(null);
      setNewPasswordValue('123456');
      refreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (user.username === 'admin') {
      showNotification('error', 'Không thể xóa tài khoản Quản Trị Hệ Thống mặc định!');
      return;
    }
    if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa tài khoản "${user.fullName}" (@${user.username})?`)) {
      return;
    }
    const res = await AuthService.deleteAccount(user.id);
    if (res.success) {
      showNotification('success', res.message);
      refreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditTargetUser(user);
    setEditFullName(user.fullName || '');
    setEditGrade(user.grade || 3);
    setEditClass(user.schoolClass || '3A');
    setEditRole(user.role || 'student');
    setEditStatus(user.status || 'active');
    setEditAvatar(user.avatar || '👦');
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetUser) return;
    if (!editFullName.trim()) {
      showNotification('error', 'Họ và tên không được để trống!');
      return;
    }

    const updates: Partial<UserAccount> = {
      fullName: editFullName.trim(),
      grade: editGrade,
      schoolClass: editClass,
      role: editRole,
      status: editStatus,
      avatar: editAvatar,
    };

    const res = await AuthService.updateAccount(editTargetUser.id, updates);
    if (res.success) {
      showNotification('success', res.message);
      setIsEditModalOpen(false);
      setEditTargetUser(null);
      refreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim()) {
      showNotification('error', 'Vui lòng nhập đầy đủ Họ tên và Tên đăng nhập!');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('error', 'Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }

    const res = await AuthService.register(
      {
        fullName: newFullName.trim(),
        username: newUsername.trim(),
        password: newPassword.trim(),
        grade: newGrade,
        schoolClass: newClass,
      },
      true // auto activate by teacher
    );

    if (res.success) {
      confetti({ particleCount: 60, spread: 70 });
      showNotification('success', `Tạo tài khoản học sinh "${newFullName}" thành công!`);
      setIsAddAccountOpen(false);
      setNewFullName('');
      setNewUsername('');
      setNewPassword('123456');
      refreshData();
    } else {
      showNotification('error', res.message);
    }
  };

  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      showNotification('error', 'Vui lòng nhập tên lớp (ví dụ 3D, 4C)!');
      return;
    }

    const classObj: SchoolClass = {
      id: `class_${newClassGrade}_${newClassName.toLowerCase().replace(/\s+/g, '')}_${Date.now().toString().slice(-4)}`,
      name: newClassName.trim().toUpperCase(),
      grade: newClassGrade,
      teacherName: newClassTeacher.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    await FirestoreService.saveClass(classObj);
    showNotification('success', `Đã thêm lớp học mới: Lớp ${classObj.name} (Khối ${newClassGrade})!`);
    setNewClassName('');
    refreshData();
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa lớp "${className}"?`)) return;
    await FirestoreService.deleteClass(classId);
    showNotification('success', `Đã xóa lớp "${className}".`);
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-amber-300 uppercase tracking-wider">
              PHÂN QUYỀN & TÀI KHOẢN NGƯỜI DÙNG
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-400 text-slate-900 rounded-md text-[11px] font-black">
              FIRESTORE CLOUD
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 drop-shadow-sm flex items-center gap-2">
            <span>Quản Lý Học Sinh & Danh Sách Lớp</span>
            <span>🎒</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 font-bold mt-1">
            Kích hoạt tài khoản mới, phân quyền lớp học, khóa/mở và đặt lại mật khẩu an toàn cho học sinh tiểu học.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsClassesModalOpen(true)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 rounded-2xl text-xs font-black backdrop-blur-md transition flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102"
          >
            <School className="w-4 h-4 text-amber-300" />
            <span>Quản Lý Danh Sách Lớp ({classes.length})</span>
          </button>

          <button
            onClick={() => setIsClaimsGuideOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md hover:scale-102"
            title="Xem hướng dẫn phân quyền Firebase Custom Claims"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Quyền Admin &amp; Custom Claims</span>
          </button>

          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md hover:scale-102"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{stats.total}</div>
            <div className="text-xs font-bold text-slate-500">Tổng tài khoản</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{stats.students}</div>
            <div className="text-xs font-bold text-slate-500">Học sinh các khối</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
            <div className="text-xs font-bold text-slate-500">Chờ kích hoạt</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{stats.locked}</div>
            <div className="text-xs font-bold text-slate-500">Đang bị khóa</div>
          </div>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border-2 flex items-center gap-3 text-xs font-bold animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{notification.text}</span>
        </div>
      )}

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, username hoặc lớp..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade filter */}
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : (Number(e.target.value) as GradeLevel))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả Khối Lớp</option>
            <option value="3">Khối Lớp 3</option>
            <option value="4">Khối Lớp 4</option>
            <option value="5">Khối Lớp 5</option>
          </select>

          {/* Class filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả Lớp học</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="pending">Chờ kích hoạt</option>
            <option value="locked">Bị khóa</option>
          </select>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Mọi vai trò</option>
            <option value="student">Chỉ Học sinh</option>
            <option value="teacher">Giáo viên / Admin</option>
          </select>
        </div>
      </div>

      {/* ACCOUNTS TABLE */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Học Sinh / Người Dùng</th>
                <th className="py-3.5 px-3">Tên Đăng Nhập</th>
                <th className="py-3.5 px-3">Khối / Lớp</th>
                <th className="py-3.5 px-3">Sao Tích Lũy</th>
                <th className="py-3.5 px-3">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    Không tìm thấy tài khoản người dùng nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = user.status || 'active';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-100 to-amber-100 border border-amber-300 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {user.avatar || '👤'}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm">{user.fullName}</div>
                            <div className="text-[10px] text-slate-400">
                              {user.role === 'admin'
                                ? 'Quản trị viên hệ thống'
                                : user.role === 'teacher'
                                ? 'Giáo viên phụ trách'
                                : 'Học sinh tiểu học'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-bold text-[11px]">
                          @{user.username}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {user.schoolClass ? (
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-black text-xs">
                            Lớp {user.schoolClass}
                          </span>
                        ) : user.role === 'teacher' ? (
                          <span className="text-slate-400 font-bold">Toàn trường</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-black text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{user.stars || 0}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {status === 'active' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hoạt động
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Chờ kích hoạt
                          </span>
                        )}
                        {status === 'locked' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-600" />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* If pending, show Activate button */}
                          {status === 'pending' && (
                            <button
                              onClick={() => handleActivatePending(user)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Kích hoạt tài khoản học sinh ngay"
                            >
                              <Check className="w-3 h-3" />
                              <span>Kích hoạt</span>
                            </button>
                          )}

                          {/* Toggle Lock / Unlock */}
                          {status === 'active' && user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleStatus(user, 'locked')}
                              className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-xl transition cursor-pointer"
                              title="Khóa tài khoản"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {status === 'locked' && (
                            <button
                              onClick={() => handleToggleStatus(user, 'active')}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition cursor-pointer"
                              title="Mở khóa tài khoản"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit User Details */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition cursor-pointer flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-blue-200"
                            title="Sửa thông tin tài khoản"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                            <span>Sửa</span>
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetPasswordTarget(user);
                              setNewPasswordValue('123456');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-xl transition cursor-pointer"
                            title="Đặt lại mật khẩu cho học sinh"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: ADD ACCOUNT ================= */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-4 border-amber-300 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Thêm Tài Khoản Học Sinh Mới</span>
              </h3>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Họ và tên học sinh (*):
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Lê Gia Bảo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Tên đăng nhập (* không dấu, không trùng):
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ví dụ: giabao_3a"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Khối lớp:
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value={3}>Khối 3</option>
                    <option value={4}>Khối 4</option>
                    <option value={5}>Khối 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Lớp cụ thể:
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {classes
                      .filter((c) => c.grade === newGrade)
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          Lớp {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Mật khẩu khởi tạo:
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  💡 Mật khẩu mặc định: 123456 (học sinh có thể đổi sau khi đăng nhập)
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: RESET PASSWORD ================= */}
      {resetPasswordTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-amber-300 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Đặt Lại Mật Khẩu Cho Học Sinh</span>
              </h3>
              <button
                onClick={() => setResetPasswordTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold leading-relaxed">
              Thầy/Cô đang đặt lại mật khẩu cho học sinh: <strong>{resetPasswordTarget.fullName}</strong> (@
              {resetPasswordTarget.username})
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                Nhập mật khẩu mới:
              </label>
              <input
                type="text"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Mật khẩu nên dễ nhớ với học sinh tiểu học (ví dụ: 123456)
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetPasswordTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                Xác Nhận Đổi Mật Khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CLASSES MANAGEMENT ================= */}
      {isClassesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-4 border-amber-300 p-6 space-y-5 animate-in zoom-in-95 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                <span>Quản Lý Danh Sách Lớp Học</span>
              </h3>
              <button
                onClick={() => setIsClassesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Add New Class */}
            <form onSubmit={handleAddClassSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                ➕ THÊM LỚP HỌC MỚI VÀO HỆ THỐNG:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Khối Lớp:</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value={3}>Khối 3</option>
                    <option value={4}>Khối 4</option>
                    <option value={5}>Khối 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên lớp:</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ví dụ: 3D, 4E, 5A..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Giáo viên phụ trách:</label>
                  <input
                    type="text"
                    value={newClassTeacher}
                    onChange={(e) => setNewClassTeacher(e.target.value)}
                    placeholder="Tên giáo viên"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Lớp Này</span>
                </button>
              </div>
            </form>

            {/* Classes Grid */}
            <div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">
                DANH SÁCH CÁC LỚP HIỆN CÓ ({classes.length} LỚP):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                {classes.map((cls) => {
                  const studentCount = users.filter((u) => u.schoolClass === cls.name).length;
                  return (
                    <div
                      key={cls.id}
                      className="p-3 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs hover:border-blue-400 transition"
                    >
                      <div>
                        <div className="font-black text-slate-900 text-sm">Lớp {cls.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          Khối {cls.grade} • {studentCount} học sinh
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(cls.id, cls.name)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsClassesModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-white font-black text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ACCOUNT MODAL */}
      {isEditModalOpen && editTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-blue-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center text-2xl shadow-xs">
                ✏️
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">CHỈNH SỬA TÀI KHOẢN</h3>
                <p className="text-xs text-slate-500 font-bold">
                  Sửa thông tin tài khoản @{editTargetUser.username}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  1. Họ và tên người dùng (*):
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition"
                  required
                />
              </div>

              {/* Tên đăng nhập (Readonly) */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  2. Tên đăng nhập (Mã cố định):
                </label>
                <input
                  type="text"
                  value={`@${editTargetUser.username}`}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              {/* Khối Lớp & Lớp Học */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    3. Khối Lớp (*):
                  </label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:outline-none"
                  >
                    <option value={3}>Khối Lớp 3</option>
                    <option value={4}>Khối Lớp 4</option>
                    <option value={5}>Khối Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    4. Lớp Học (*):
                  </label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trạng Thái & Vai Trò */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    5. Trạng Thái (*):
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:outline-none"
                  >
                    <option value="active">🟢 Đang hoạt động</option>
                    <option value="pending">🟡 Chờ kích hoạt</option>
                    <option value="locked">🔴 Bị tạm khóa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    6. Vai Trò (*):
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:outline-none"
                  >
                    <option value="student">🎒 Học Sinh</option>
                    <option value="teacher">👩‍🏫 Giáo Viên</option>
                    <option value="admin">🛡️ Quản Trị Viên</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  7. Chọn Biểu Tượng Đại Diện:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['👦', '👧', '🚀', '🤖', '👩‍🏫', '👨‍💻', '🐱', '🦁', '🌟', '🎨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditAvatar(emoji)}
                      className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                        editAvatar === emoji
                          ? 'bg-blue-100 border-2 border-blue-500 scale-110 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>LƯU THAY ĐỔI TÀI KHOẢN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Firebase Custom Claims Guide Modal */}
      <FirebaseAdminClaimsGuideModal
        isOpen={isClaimsGuideOpen}
        onClose={() => setIsClaimsGuideOpen(false)}
      />
    </div>
  );
};
