
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Login from '@/components/Login'

// 1. Define what a "Bookmark" looks like
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
  
  // Form inputs
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(true)

  // 2. Check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 3. Load Bookmarks & Setup Real-time Listener
  useEffect(() => {
    if (!session) return

    // A. Fetch initial data
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setBookmarks(data)
    }

    fetchBookmarks()

    // B. Real-time Listener (Requirement #4)
    // This watches the database. If YOU or another tab adds a link, 
    // it updates here instantly without refresh.
    const channel = supabase
      .channel('realtime bookmarks')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookmarks' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookmarks((prev) => [payload.new as Bookmark, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  // 4. Handle "Add Bookmark"
  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    
    if (!newTitle || !newUrl) return alert('Please fill in both fields')

    // We just insert into DB. The Real-time listener above ^ will update the UI automatically!
    const { error } = await supabase.from('bookmarks').insert({
      title: newTitle,
      url: newUrl,
      user_id: session.user.id
    })

    if (error) {
      console.error('Error adding:', error)
      alert('Error adding bookmark')
    } else {
      setNewTitle('')
      setNewUrl('')
    }
  }

  // 5. Handle "Delete Bookmark"
  const deleteBookmark = async (id: number) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) alert('Error deleting')
  }

  // 6. Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setBookmarks([]) // clear data on logout
  }

  // Render Loading state
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  // Render Login if not authenticated
  if (!session) return <Login />

  // Render Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">My Bookmarks</h1>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Bookmark Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Bookmark</h2>
          <form onSubmit={addBookmark} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Title (e.g., My Portfolio)"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="url"
              placeholder="URL (https://...)"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              Add +
            </button>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No bookmarks yet. Add your first one above!</p>
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <div 
                key={bookmark.id} 
                className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {bookmark.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-gray-900 hover:text-blue-600 truncate"
                    >
                      {bookmark.title}
                    </a>
                    <span className="text-xs text-gray-500 truncate">{bookmark.url}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Delete bookmark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}