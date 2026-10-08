function StatusMessage({ message, type = 'error' }) {
  if (!message) return null

  return (
    <div className={`auth-error status-message ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{type === 'error' ? '!' : '✓'}</span>
      {message}
    </div>
  )
}

export default StatusMessage
