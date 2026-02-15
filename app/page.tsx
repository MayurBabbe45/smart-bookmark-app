'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Login from '@/components/Login'

type Bookmark = {
  id: number
  title: string
  url: string
  user_id: string
}

export default function Home() {
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Auth & Realtime Logic (Unchanged)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setBookmarks(data)
    }
    fetchBookmarks()

    const channel = supabase
      .channel('realtime bookmarks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookmarks((prev) => [payload.new as Bookmark, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !newTitle || !newUrl) return
    setAdding(true)
    // perform insert and return the inserted row for immediate UI update
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ title: newTitle, url: newUrl, user_id: session.user.id })
      .select()
      .single()
    setAdding(false)
    if (data && !error) {
      // optimistic update: add new bookmark to state immediately
      setBookmarks((prev) => [data as Bookmark, ...prev])
      setNewTitle('')
      setNewUrl('')
    }
  }

  const deleteBookmark = async (id: number) => {
    setDeletingId(id)
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    setDeletingId(null)
    if (!error) {
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setBookmarks([])
  }

  if (loading) return <div className="min-h-screen bg-base-100 flex items-center justify-center"><span className="loading loading-dots loading-lg"></span></div>
  if (!session) return <Login />

  return (
    <div className="min-h-screen bg-base-100 text-base-content antialiased">
      {/* Navbar */}
      <div className="navbar bg-base-200 shadow-lg px-4 sm:px-8">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl font-bold tracking-tight">Bookmark<span className="text-primary">.io</span></a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span className="text-xl">{session.user.email?.charAt(0).toUpperCase()}</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
              <li className="menu-title text-opacity-50">{session.user.email}</li>
              <li><a onClick={handleLogout} className="text-error">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Input Form */}
        <div className="card w-full bg-base-200 shadow-lg rounded-lg border border-base-300 mb-8">
          <div className="card-body">
            <h2 className="card-title mb-2">Add New Link</h2>
            <form onSubmit={addBookmark} className="form-control w-full">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Title (e.g. Portfolio)"
                  className="input input-bordered bg-base-100 w-full focus:input-primary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  className="input input-bordered bg-base-100 w-full focus:input-primary"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary sm:w-auto w-full"
                  disabled={adding}
                >
                    {adding ? (
                    <>
                      <span className="loading loading-spinner mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 opacity-50">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">No bookmarks found. Add one above!</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id} 
                className="card card-side bg-base-200 shadow-md rounded-lg border border-base-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="card-body flex-row items-center justify-between p-4 sm:p-6">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="avatar placeholder hidden sm:inline-flex">
                      <div className="bg-neutral-focus text-neutral-content rounded-xl w-12">
                        <span className="text-xl font-bold">{bookmark.title.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <a 
                        href={bookmark.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="card-title text-lg hover:text-primary transition-colors truncate"
                      >
                        {bookmark.title}
                      </a>
                      <a 
                         href={bookmark.url}
                         target="_blank"
                         rel="noopener noreferrer" 
                         className="text-xs text-base-content/50 truncate hover:underline"
                      >
                        {bookmark.url}
                      </a>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="btn btn-ghost btn-square text-error opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                    disabled={deletingId === bookmark.id}
                  >
                    {deletingId === bookmark.id ? (
                      <span className="loading loading-spinner" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}