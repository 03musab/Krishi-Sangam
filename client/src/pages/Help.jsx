import { useEffect, useRef, useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getHelpTarget, getHelpThread, sendHelpMessage, apiUpload } from '../lib/api';
import Icon from '../components/Icon';

const POLL_MS = 4000; // refresh the thread so replies appear without reloading

export default function Help() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [support, setSupport] = useState([]); // all support (admin) accounts
  const [targetLoading, setTargetLoading] = useState(true);
  const [thread, setThread] = useState([]);
  const [message, setMessage] = useState('');
  const [pendingImage, setPendingImage] = useState(null); // { url } after upload, before send
  const [attaching, setAttaching] = useState(false);
  const [sending, setSending] = useState(false);
  const threadRef = useRef(null);
  const fileRef = useRef(null);

  // Resolve the support (admin) accounts
  useEffect(() => {
    let cancelled = false;
    getHelpTarget()
      .then((d) => !cancelled && setSupport(d.admins || []))
      .catch(() => !cancelled && setSupport([]))
      .finally(() => !cancelled && setTargetLoading(false));
    return () => { cancelled = true; };
  }, []);

  // Load the combined thread and keep it fresh while the page is open
  useEffect(() => {
    if (!support.length) return;
    let cancelled = false;
    const load = () =>
      getHelpThread()
        .then((d) => !cancelled && setThread(d.messages || []))
        .catch(() => {});
    load();
    const iv = setInterval(load, POLL_MS);
    return () => { cancelled = true; clearInterval(iv); };
  }, [support]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [thread, attaching, pendingImage]);

  const handlePickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttaching(true);
    try {
      const d = await apiUpload(file);
      setPendingImage({ url: d.url, name: file.name });
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setAttaching(false);
    }
  };

  const handleSend = async () => {
    const text = message.trim();
    if ((!text && !pendingImage) || !support.length || sending) return;
    setSending(true);
    try {
      await sendHelpMessage({
        content: text || '',
        image_url: pendingImage?.url || null
      });
      setMessage('');
      setPendingImage(null);
      const d = await getHelpThread();
      setThread(d.messages || []);
    } catch (err) {
      showToast(t('common.error', { msg: err.message }));
    } finally {
      setSending(false);
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <>
      <PageBanner title={t('help.title')} color="teal" />

      <div className="help-wrap">
        <div className="help-chat">
          {/* Header */}
          <div className="help-chat-header">
            <div className="help-chat-avatar">
              <Icon name="chat" size={18} strokeWidth={2.2} />
            </div>
            <div className="help-chat-meta">
              <strong>{t('help.supportName')}</strong>
              <span>{t('help.supportStatus')}</span>
            </div>
          </div>

          {/* Body */}
          <div className="help-chat-body" ref={threadRef}>
            {targetLoading && <div className="listings-empty">{t('common.loading')}</div>}

            {!targetLoading && !support.length && (
              <div className="help-fallback">
                <Icon name="alert" size={28} style={{ marginBottom: '10px' }} />
                <p>{t('help.noTarget')}</p>
              </div>
            )}

            {!targetLoading && support.length > 0 && isAdmin && (
              <div className="help-fallback">
                <Icon name="shield" size={28} style={{ marginBottom: '10px' }} />
                <p>{t('help.youAreSupport')}</p>
              </div>
            )}

            {!targetLoading && support.length > 0 && !isAdmin && thread.length === 0 && (
              <div className="listings-empty">{t('help.startPrompt')}</div>
            )}

            {thread.map((m) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                  <div className="message-bubble">
                    {!isMe && support.length > 1 && m.sender_name && (
                      <span className="help-sender-name">{m.sender_name}</span>
                    )}
                    {m.image_url && (
                      <img className="message-image" src={m.image_url} alt="" loading="lazy" />
                    )}
                    {m.content && <span className="message-bubble-text">{m.content}</span>}
                  </div>
                </div>
              );
            })}

            {attaching && (
              <div className="message-row me">
                <div className="message-bubble">
                  <span className="btn-spinner btn-spinner-sm" aria-hidden="true" />
                  <span className="message-bubble-text" style={{ marginLeft: '8px' }}>{t('help.uploading')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {support.length > 0 && !isAdmin && (
            <div className="help-chat-input">
              <input
                type="file"
                ref={fileRef}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={handlePickImage}
              />
              <button
                className="help-attach-btn"
                onClick={() => fileRef.current?.click()}
                disabled={attaching || sending}
                aria-label={t('help.attach')}
                title={t('help.attach')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <div className="help-input-box">
                {pendingImage && (
                  <div className="help-pending-img">
                    <img src={pendingImage.url} alt="" />
                    <button onClick={() => setPendingImage(null)} aria-label={t('help.removeImage')}>
                      <Icon name="x" size={13} strokeWidth={2.4} />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  placeholder={t('help.placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={attaching || sending}
                />
              </div>
              <button className="help-send-btn" onClick={handleSend} disabled={(!message.trim() && !pendingImage) || attaching || sending}>
                {sending ? <span className="btn-spinner btn-spinner-sm" aria-hidden="true" /> : <Icon name="send" size={16} strokeWidth={2} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
