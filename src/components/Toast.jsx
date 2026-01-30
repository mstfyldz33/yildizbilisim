import React, { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback if ToastProvider is not used
    return {
      showToast: (message, type = 'info') => {
        console.log(`[Toast] ${type}: ${message}`)
        // Fallback to alert if toast system not available
        if (typeof window !== 'undefined' && !window.showToast) {
          alert(message)
        }
      }
    }
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type,
      duration
    }

    setToasts(prev => [...prev, toast])

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Make showToast available globally
  if (typeof window !== 'undefined') {
    window.showToast = showToast
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <ToastContainer toasts={toasts} removeToast={removeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'fa-check-circle'
      case 'error':
        return 'fa-exclamation-circle'
      case 'warning':
        return 'fa-exclamation-triangle'
      case 'info':
      default:
        return 'fa-info-circle'
    }
  }

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <div className="toast-content">
        <div className="toast-icon">
          <i className={`fas ${getIcon()}`}></i>
        </div>
        <div className="toast-message">{toast.message}</div>
        <button
          className="toast-close"
          onClick={onClose}
          aria-label="Kapat"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{ 
            animationDuration: `${toast.duration}ms`,
            animationPlayState: 'running'
          }}
        ></div>
      </div>
    </div>
  )
}

