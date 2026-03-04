import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import Sidebar from '../../layout/Sidebar';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { noteApi } from '../../../utils/api';
import { 
  FiEdit3, FiPlus, FiSearch, FiCalendar, 
  FiTag, FiTrash2, FiSave, FiX,
  FiEye, FiLock, FiGlobe
} from 'react-icons/fi';

const NotesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
    is_private: true
  });

  useEffect(() => {
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await noteApi.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        await noteApi.updateNote(editingNote.id, noteForm);
      } else {
        await noteApi.createNote(noteForm);
      }
      setShowAddModal(false);
      setEditingNote(null);
      setNoteForm({
        title: '',
        content: '',
        tags: '',
        is_private: true
      });
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content || '',
      tags: note.tags || '',
      is_private: note.is_private
    });
    setShowAddModal(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('确定要删除这个笔记吗？')) return;
    try {
      await noteApi.deleteNote(id);
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex gradient-bg particle-bg">
      <Sidebar type="student" />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title="个人笔记" subtitle="记录您的学习心得和灵感" />
        
        <main className="flex-1 container mx-auto px-6 py-8">
          <Card className="p-6 mb-6 glass">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索笔记标题、内容或标签..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  setEditingNote(null);
                  setNoteForm({
                    title: '',
                    content: '',
                    tags: '',
                    is_private: true
                  });
                  setShowAddModal(true);
                }}
                className="bg-gradient-to-r from-neon-cyan to-electric-blue hover:from-neon-cyan/90 hover:to-electric-blue/90 border-0"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                新建笔记
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-electric-blue border-t-transparent"></div>
                <p className="text-gray-400 animate-pulse">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="p-6 glass border border-white/10 hover:border-neon-cyan/30 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {note.is_private ? (
                          <FiLock className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <FiGlobe className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {note.is_private ? '私有' : '公开'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-neon-cyan"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors flex-1">
                      {note.title}
                    </h3>
                    
                    {note.content && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-4">
                        {note.content}
                      </p>
                    )}
                    
                    {note.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.split(',').map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-slate-700/50 text-gray-400 rounded-full text-xs">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-gray-500 text-xs pt-4 border-t border-white/5 mt-auto">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        更新于 {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {filteredNotes.length === 0 && (
                <div className="col-span-full">
                  <Card className="p-12 text-center">
                    <FiEdit3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">暂无笔记</h3>
                    <p className="text-gray-500 mb-6">开始记录您的第一篇笔记吧</p>
                    <Button 
                      onClick={() => {
                        setEditingNote(null);
                        setNoteForm({
                          title: '',
                          content: '',
                          tags: '',
                          is_private: true
                        });
                        setShowAddModal(true);
                      }}
                      className="bg-gradient-to-r from-neon-cyan to-electric-blue border-0"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      新建笔记
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          )}
        </main>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron">
                    {editingNote ? '编辑笔记' : '新建笔记'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingNote(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">标题 *</label>
                    <input
                      type="text"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan/50"
                      placeholder="请输入笔记标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">内容</label>
                    <textarea
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan/50 resize-none"
                      rows={10}
                      placeholder="记录您的想法..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">标签（用逗号分隔）</label>
                    <input
                      type="text"
                      value={noteForm.tags}
                      onChange={(e) => setNoteForm({...noteForm, tags: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-cyan/50"
                      placeholder="机器学习, 笔记, 总结"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_private_note"
                      checked={noteForm.is_private}
                      onChange={(e) => setNoteForm({...noteForm, is_private: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-500 bg-slate-800 text-neon-cyan focus:ring-neon-cyan"
                    />
                    <label htmlFor="is_private_note" className="text-gray-400 text-sm">设为私有（仅自己可见）</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingNote(null);
                    }}
                    className="border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    className="bg-gradient-to-r from-neon-cyan to-electric-blue hover:from-neon-cyan/90 hover:to-electric-blue/90 border-0"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default NotesPage;
