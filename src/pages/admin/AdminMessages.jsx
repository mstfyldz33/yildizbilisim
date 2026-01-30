import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import './AdminMessages.css'

const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'contact_messages'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(messagesData)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'contact_messages', id))
      fetchMessages()
      if (selectedMessage?.id === id) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Hata: ' + error.message)
    }
  }

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), { read: true })
      fetchMessages()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div className="admin-messages">
      <div className="admin-page-header">
        <div>
          <h1>İletişim Mesajları</h1>
          {unreadCount > 0 && (
            <span className="admin-badge-new">{unreadCount} yeni mesaj</span>
          )}
        </div>
      </div>

      <div className="admin-messages-container">
        <div className="admin-messages-list">
          {messages.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fas fa-inbox"></i>
              <p>Henüz mesaj yok</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`admin-message-item ${!message.read ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.read) markAsRead(message.id)
                }}
              >
                <div className="admin-message-header">
                  <div>
                    <strong>{message.name}</strong>
                    <span className="admin-message-date">
                      {new Date(message.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {!message.read && <span className="admin-unread-dot"></span>}
                </div>
                <p className="admin-message-preview">{message.message?.substring(0, 60)}...</p>
                <div className="admin-message-contact">
                  <span><i className="fas fa-envelope"></i> {message.email}</span>
                  <span><i className="fas fa-phone"></i> {message.phone}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedMessage && (
          <div className="admin-message-detail">
            <div className="admin-message-detail-header">
              <div>
                <h2>{selectedMessage.name}</h2>
                <p className="admin-message-meta">
                  <span><i className="fas fa-envelope"></i> {selectedMessage.email}</span>
                  <span><i className="fas fa-phone"></i> {selectedMessage.phone}</span>
                  <span><i className="fas fa-calendar"></i> {new Date(selectedMessage.created_at).toLocaleString('tr-TR')}</span>
                </p>
              </div>
              <button onClick={() => handleDelete(selectedMessage.id)} className="admin-btn-delete">
                <i className="fas fa-trash"></i> Sil
              </button>
            </div>
            <div className="admin-message-content">
              <p>{selectedMessage.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMessages

