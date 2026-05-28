/**
 * @param {unknown} err — typically Axios error
 * @param {string} fallback
 */
export function getErrorMessage(err, fallback = 'Something went wrong.') {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = err.response?.data
    if (data && typeof data.message === 'string') return data.message
  }
  if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_NETWORK') {
    return 'Network error. Check that the server is running and CORS is configured.'
  }
  return fallback
}
