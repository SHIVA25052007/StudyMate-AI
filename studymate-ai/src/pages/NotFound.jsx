import React from 'react'
import { useNavigate } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="notfound-page">
      <div className="notfound-card card">
        <div className="notfound-icon" aria-hidden="true">🔍</div>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="notfound-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Dashboard
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
