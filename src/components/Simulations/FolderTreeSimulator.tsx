import React, { useState } from 'react';
import { Folder, FolderPlus, FileText, Image, Film, Trash2, ChevronRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FileItem {
  id: string;
  name: string;
  type: 'doc' | 'image' | 'video' | 'code';
  size: string;
  folderId: string;
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
}

export const FolderTreeSimulator: React.FC = () => {
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: 'root', name: 'Ổ đĩa D: (HỌC TẬP)', parentId: null },
    { id: 'toan', name: 'Toán Học', parentId: 'root' },
    { id: 'tinhoc', name: 'Tin Học 5', parentId: 'root' },
    { id: 'tienganh', name: 'Tiếng Anh', parentId: 'root' },
  ]);

  const [files, setFiles] = useState<FileItem[]>([
    { id: 'f1', name: 'DeThiGiuaKy.docx', type: 'doc', size: '25 KB', folderId: 'toan' },
    { id: 'f2', name: 'BangCuuChuong.png', type: 'image', size: '150 KB', folderId: 'toan' },
    { id: 'f3', name: 'SoDoTuDuy.png', type: 'image', size: '320 KB', folderId: 'tinhoc' },
    { id: 'f4', name: 'Scratch_Bai1.sb3', type: 'code', size: '512 KB', folderId: 'tinhoc' },
    { id: 'f5', name: 'Vocabulary_Unit1.docx', type: 'doc', size: '40 KB', folderId: 'tienganh' },
    { id: 'f6', name: 'BaiTapChuongTrinh.docx', type: 'doc', size: '18 KB', folderId: 'root' },
  ]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

  const currentFolder = folders.find((f) => f.id === selectedFolderId) || folders[0];
  const currentFiles = files.filter((f) => f.folderId === selectedFolderId);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newId = 'fld_' + Date.now();
    setFolders([...folders, { id: newId, name: newFolderName.trim(), parentId: selectedFolderId }]);
    setNewFolderName('');
    setShowNewFolderModal(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleDragFileStart = (id: string) => {
    setDraggedFileId(id);
  };

  const handleDropFileToFolder = (targetFolderId: string) => {
    if (draggedFileId) {
      setFiles(files.map((f) => (f.id === draggedFileId ? { ...f, folderId: targetFolderId } : f)));
      setDraggedFileId(null);
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image':
        return <Image className="w-8 h-8 text-emerald-500" />;
      case 'video':
        return <Film className="w-8 h-8 text-rose-500" />;
      default:
        return <FileText className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-amber-200">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-1">
            MÔ PHỎNG TRÌNH KHÁM PHÁ CÂY THƯ MỤC & TỆP TIN
          </span>
          <h3 className="text-xl font-black text-slate-800">Quản Lý Thư Mục & Tệp Tin Khoa Học</h3>
        </div>

        <button
          onClick={() => setShowNewFolderModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black shadow-md transition"
        >
          <FolderPlus className="w-4 h-4" /> + Tạo thư mục con
        </button>
      </div>

      {/* Breadcrumb Path */}
      <div className="my-3 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2">
        <Folder className="w-4 h-4 text-amber-500" />
        <span>Đường dẫn hiện tại:</span>
        <span className="text-blue-700 font-extrabold">Ổ đĩa D: &gt; {currentFolder.name}</span>
      </div>

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
        {/* Left: Folder Tree */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            CÂY THƯ MỤC (NHẤP ĐỂ MỞ HOẶC KÉO TỆP VÀO)
          </div>

          <div className="space-y-1">
            {folders.map((folder) => {
              const isSelected = folder.id === selectedFolderId;
              const isChild = folder.parentId !== null;

              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropFileToFolder(folder.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold cursor-pointer transition ${
                    isChild ? 'ml-4' : ''
                  } ${
                    isSelected
                      ? 'bg-amber-400 text-slate-900 shadow-sm'
                      : 'hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isChild ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                  <Folder className={`w-4 h-4 ${isSelected ? 'text-slate-900 fill-slate-900' : 'text-amber-500 fill-amber-400'}`} />
                  <span className="truncate">{folder.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Files in selected folder */}
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              NỘI DUNG BÊN TRONG: <strong className="text-slate-800">{currentFolder.name}</strong> ({currentFiles.length} tệp)
            </span>
            <span className="text-xs text-slate-400">Kéo tệp thả vào thư mục bên trái để di chuyển</span>
          </div>

          {currentFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-bold">
              📂 Thư mục này hiện đang trống. Hãy tạo thư mục con hoặc kéo tệp vào đây!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentFiles.map((file) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={() => handleDragFileStart(file.id)}
                  className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex flex-col items-center text-center group cursor-grab active:cursor-grabbing transition relative shadow-sm"
                >
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="absolute top-1.5 right-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                    title="Xoá tệp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {getFileIcon(file.type)}
                  <span className="text-xs font-extrabold text-slate-800 mt-2 truncate max-w-full">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{file.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal create folder */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95">
            <h4 className="text-lg font-black text-slate-800 mb-2">Tạo Thư Mục Mới</h4>
            <p className="text-xs text-slate-500 mb-4">
              Nhập tên thư mục mới (không chứa ký tự đặc biệt như \ / : * ? " &lt; &gt; |):
            </p>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ví dụ: MyThuat, AmNhac, TinHoc5..."
              className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-md"
              >
                Tạo Thư Mục
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 font-semibold flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
        <span>
          <strong>Ghi nhớ Lớp 5:</strong> Cây thư mục giống như một cây đại thụ: Gốc cây là ổ đĩa, các cành to là thư mục mẹ, cành nhỏ là thư mục con, và lá cây chính là các tệp bài học của chúng mình!
        </span>
      </div>
    </div>
  );
};
