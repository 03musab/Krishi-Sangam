import { useState } from 'react';
import { submitReview } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function RatingReviewModal({ booking, isService, onClose, onSuccess }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const revieweeId = booking?.owner_id || booking?.worker_id;

  const handleSubmit = async () => {
    if (!revieweeId) {
      showToast('Error: Provider details not found.');
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({
        booking_id: booking.id,
        is_service: !!isService,
        reviewee_id: revieweeId,
        rating,
        comment
      });
      showToast(t('review.submittedToast', 'Thank you! Review submitted successfully.'));
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div className="modal-card" style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>⭐ {t('review.modalTitle', 'Rate & Review Provider')}</h3>
          <button className="btn-close" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 0, marginBottom: '16px' }}>
          {t('review.modalSubtitle', 'How was your experience with the service provided?')}
        </p>

        {/* ── Star Selection ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '2.2rem',
                cursor: 'pointer',
                color: star <= rating ? '#f59e0b' : '#cbd5e1',
                transition: 'transform 0.1s ease'
              }}
            >
              ★
            </button>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">{t('review.commentLabel', 'Your Feedback / Experience')}</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder={t('review.commentPh', 'E.g., Arrived on time, equipment was in great condition, very polite operator...')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          className="btn-form-submit"
          style={{ width: '100%', background: '#2563eb', padding: '12px' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t('common.submitting', 'Submitting...') : t('review.submitBtn', 'Submit Rating & Review')}
        </button>
      </div>
    </div>
  );
}
