import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Shows a countdown after an OTP is sent, then a "Resend OTP" button.
 * `onResend` must return a promise; the countdown restarts on success.
 */
export default function OtpResend({ onResend, cooldown = 60, disabled = false }) {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(cooldown);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  if (remaining > 0) {
    return <span className="otp-resend-timer">{t('auth.resendIn', { s: remaining })}</span>;
  }

  return (
    <button
      type="button"
      className="otp-resend-btn"
      disabled={sending || disabled}
      onClick={async () => {
        setSending(true);
        try {
          await onResend();
          setRemaining(cooldown);
        } catch {
          /* the caller surfaces the error toast */
        } finally {
          setSending(false);
        }
      }}
    >
      {sending ? t('common.loading') : t('auth.resendOtp')}
    </button>
  );
}
