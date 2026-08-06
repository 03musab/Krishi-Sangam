import { useEffect, useRef } from 'react';

/**
 * Split OTP input — auto-advances between digit boxes, supports
 * Backspace to go back, paste of the full code, and fires `onComplete`
 * once all digits are filled.
 */
export default function OtpInput({ value = '', onChange, length = 6, disabled = false, autoFocus = false, onComplete }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (e, idx) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next = value.slice(0, idx) + digit + value.slice(idx + 1);
    onChange(next);
    if (digit && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    if (next.replace(/\D/g, '').length === length && onComplete) {
      onComplete(next);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // Keep codes left-aligned: clicking an empty box that has empty boxes
  // before it jumps the cursor to the first empty box instead.
  const handleFocus = (idx) => {
    const firstEmpty = Array.from({ length }, (_, i) => value[i] || '').findIndex((c) => !c);
    if (firstEmpty >= 0 && firstEmpty < idx) {
      inputsRef.current[firstEmpty]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!digits) return;
    onChange(digits);
    inputsRef.current[Math.min(digits.length, length - 1)]?.focus();
    if (digits.length === length && onComplete) {
      onComplete(digits);
    }
  };

  return (
    <div className="otp-input-group" role="group" aria-label="OTP code">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          className={`otp-digit ${value[idx] ? 'filled' : ''}`}
          value={value[idx] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(idx)}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
