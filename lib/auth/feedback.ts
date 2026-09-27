export function signInFeedback(code: string | undefined): string | null {
  switch (code) {
    case 'oauth_failed':
    case 'oauth_init_failed':
    case 'missing_code':
      return 'Sign-in could not be completed. Please try again from this browser.';
    case 'oauth_provider_unsupported':
      return 'That sign-in option is not available.';
    default:
      return null;
  }
}

export function authFailure(error: { status?: number; code?: string }, signup = false) {
  if (error.status === 429 || error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') {
    return { status: 429, error: 'Too many attempts. Please wait before trying again.' };
  }
  if (error.status !== undefined && error.status >= 500) {
    return { status: 503, error: 'Sign-in service is temporarily unavailable. Please try again shortly.' };
  }
  if (error.code === 'email_not_confirmed') {
    return { status: 403, error: 'Check your email and confirm your account before signing in.' };
  }
  return signup
    ? { status: 400, error: 'Account creation could not be completed. Please try again or sign in to an existing account.' }
    : { status: 401, error: 'Invalid email or password.' };
}
