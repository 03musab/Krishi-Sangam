import { useActionState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import PageBanner from '../components/PageBanner';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const toastShown = useRef(false);

  // React 19 form action — receives the submitted FormData automatically
  const submitContact = async (_prevState, formData) => {
    // Demo contact form — simulate a short send delay
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { sent: true, name: formData.get('name'), email: formData.get('email') };
  };

  const [state, formAction, isPending] = useActionState(submitContact, { sent: false });

  useEffect(() => {
    if (state.sent) {
      if (!toastShown.current) {
        toastShown.current = true;
        showToast(t('contact.success'));
      }
    } else {
      toastShown.current = false;
    }
  }, [state, showToast, t]);

  const infoCards = [
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      label: t('home.footer.regOffice'),
      value: (
        <>
          S.No. 192/2A & 2B, Cosmos, Horizen,<br />
          Pokharan Road No. 2, Wagle Industrial Estate,<br />
          Thane – 400604, Maharashtra.
        </>
      )
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      label: t('home.footer.phone'),
      value: '+91-8828473778'
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      label: t('home.footer.email'),
      value: 'jaijaikuber@gmail.com'
    }
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      <PageBanner title={t('contact.title')} color="teal" />

      <section className="section" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <p style={{ fontSize: '18px', color: 'var(--text-mid)', lineHeight: '1.7', textAlign: 'center', maxWidth: '750px', margin: '0 auto 32px' }}>
          {t('contact.subtitle')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Contact form — React 19 form action */}
          <form action={formAction} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-dark)', fontSize: '15px' }}>{t('contact.name')}</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-dark)', fontSize: '15px' }}>{t('contact.email')}</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--text-dark)', fontSize: '15px' }}>{t('contact.message')}</label>
              <textarea
                name="message"
                required
                rows="5"
                className="form-input"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '15px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" disabled={isPending} className="btn-hero" style={{ background: 'linear-gradient(135deg, var(--green-mid), var(--green-dark))', color: 'white', border: 'none', padding: '14px 28px', fontSize: '16px', alignSelf: 'flex-start' }}>
              {isPending && <span className="btn-spinner" aria-hidden="true" />}
              {isPending ? t('contact.sending') : t('contact.send')}
            </button>
          </form>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80"
                alt="Farmer holding freshly harvested produce"
                loading="lazy"
                style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {infoCards.map((card, i) => (
              <div key={i} className="contact-info-card hover-lift" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--green-light)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{card.label}</div>
                  <div style={{ fontSize: '16px', color: 'var(--text-dark)', lineHeight: '1.6', fontWeight: '500' }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
