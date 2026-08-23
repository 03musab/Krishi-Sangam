import { useEffect, useRef } from 'react';

/**
 * Split OTP input — auto-advances to the next input immediately upon typing
 * a single digit, supports Backspace navigation to the previous box, paste,
 * and fires `onComplete` once all digits are filled.
 */
export default function OtpInput({ value = '', onChange, length = 6, disabled = false, autoFocus = false, onComplete }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }, [autoFocus]);

  const handleChange = (e, idx) => {
    const rawVal = e.target.value;
    const digits = rawVal.replace(/\D/g, '');

    if (!digits) {
      // Digit cleared
      const chars = value.split('');
      chars[idx] = '';
      const next = chars.join('');
      onChange(next);
      return;
    }

    // Single digit typed
    const typedDigit = digits.slice(-1);
    const chars = Array.from({ length }, (_, i) => value[i] || '');
    chars[idx] = typedDigit;
    const next = chars.join('').trimEnd();
    onChange(next);

    // Automatically focus the next input box
    if (idx < length - 1) {
      setTimeout(() => {
        inputsRef.current[idx + 1]?.focus();
        inputsRef.current[idx + 1]?.select();
      }, 0);
    }

    if (next.replace(/\D/g, '').length === length && onComplete) {
      onComplete(next.replace(/\D/g, ''));
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = Array.from({ length }, (_, i) => value[i] || '');

      if (chars[idx]) {
        // Clear current input and move to previous if present
        chars[idx] = '';
        const next = chars.join('').trimEnd();
        onChange(next);
        if (idx > 0) {
          inputsRef.current[idx - 1]?.focus();
        }
      } else if (idx > 0) {
        // Clear previous input and move focus to it
        chars[idx - 1] = '';
        const next = chars.join('').trimEnd();
        onChange(next);
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedDigits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedDigits) return;
    onChange(pastedDigits);
    const targetIdx = Math.min(pastedDigits.length, length - 1);
    inputsRef.current[targetIdx]?.focus();
    if (pastedDigits.length === length && onComplete) {
      onComplete(pastedDigits);
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
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          className={`otp-digit ${value[idx] ? 'filled' : ''}`}
          value={value[idx] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
