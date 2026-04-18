import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Image, Plus, X, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const POST_TYPES = [
  { value: 'article', label: '📝 Artículo', color: 'bg-blue-100 text-blue-700' },
  { value: 'question', label: '❓ Pregunta', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'photo', label: '📸 Foto', color: 'bg-pink-100 text-pink-700' },
  { value: 'announcement', label: '📢 Anuncio', color: 'bg-purple-100 text-purple-700' },
];

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', post_type: 'article' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const localProfile = localStorage.getItem('sofia_profile');
      if (localProfile) setProfile(JSON.parse(localProfile));

      const allPosts = await base44.entities.CommunityPost.list('-created_date', 50);
      setPosts(allPosts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.content.trim() || !profile) return;
    setSubmitting(true);
    try {
      const post = await base44.entities.CommunityPost.create({
        author_id: profile.id || 'guest',
        author_name: profile.display_name,
        author_role: 'student',
        school: profile.school || 'Mi Escuela',
        content: newPost.content,
        post_type: newPost.post_type,
        likes: [],
        comments: [],
      });
      setPosts([post, ...posts]);
      setNewPost({ content: '', post_type: 'article' });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (post) => {
    const userId = profile?.id || 'guest';
    const alreadyLiked = (post.likes || []).includes(userId);
    const newLikes = alreadyLiked
      ? post.likes.filter(id => id !== userId)
      : [...(post.likes || []), userId];

    await base44.entities.CommunityPost.update(post.id, { likes: newLikes });
    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
  };

  const typeConfig = (type) => POST_TYPES.find(t => t.value === type) || POST_TYPES[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
        <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/50 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">Comunidad Escolar</h1>
              <div className="flex items-center gap-1">
                <img src="https://media.base44.com/images/public/69e3f8f663fc316a299cbdbd/7611a09b1_image.png" alt="Monad" className="w-3.5 h-3.5 rounded-sm" />
                <p className="text-xs text-indigo-500 font-medium">En la red Monad</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 gap-1 text-sm"
            size="sm"
          >
            <Plus className="w-4 h-4" /> Publicar
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* New Post Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-white/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-700">Nueva publicación</span>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Post type selector */}
            <div className="flex gap-2 flex-wrap mb-3">
              {POST_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setNewPost({ ...newPost, post_type: t.value })}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    newPost.post_type === t.value ? t.color + ' ring-2 ring-offset-1 ring-blue-400' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Textarea
              placeholder="¿Qué quieres compartir con tu escuela?"
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              className="mb-3 resize-none"
              rows={3}
            />

            <div className="flex justify-end">
              <Button
                onClick={handlePost}
                disabled={submitting || !newPost.content.trim()}
                className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                size="sm"
              >
                {submitting ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Blockchain badge */}
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2">
          <img src="https://media.base44.com/images/public/69e3f8f663fc316a299cbdbd/7611a09b1_image.png" alt="Monad" className="w-5 h-5 rounded-md" />
          <p className="text-xs text-indigo-600">
            Las publicaciones se registran en la <strong>blockchain Monad</strong> para garantizar autenticidad.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-5xl mb-3 block">🌱</span>
            <p>Sé el primero en publicar en tu comunidad</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const tc = typeConfig(post.post_type);
            const liked = (post.likes || []).includes(profile?.id || 'guest');
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-md border border-white/60"
              >
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {post.author_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{post.author_name}</p>
                    <p className="text-xs text-slate-400">{post.school}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.color}`}>
                    {tc.label}
                  </span>
                </div>

                {/* Content */}
                <p className="text-slate-700 text-sm mb-3 leading-relaxed">{post.content}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="" className="rounded-xl mb-3 w-full object-cover max-h-64" />
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    <span>{(post.likes || []).length}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{(post.comments || []).length}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
}