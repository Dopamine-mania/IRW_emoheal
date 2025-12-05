import React, { useState } from 'react';
import { useStore } from '../store';
import { supabase } from '../utils/supabase';
import { trackEvent, identifyUser } from '../utils/analytics';

export const EmailCaptureModal: React.FC = () => {
  const emailCaptureVisible = useStore(state => state.emailCaptureVisible);
  const closeEmailCapture = useStore(state => state.closeEmailCapture);
  const markEmailSubmitted = useStore(state => state.markEmailSubmitted);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!emailCaptureVisible) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证邮箱格式
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from('leads')
        .insert([
          {
            email: email,
            source: 'email_capture_modal',
            created_at: new Date().toISOString()
          }
        ]);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // PostHog Identity Linking - 关键补充需求
      identifyUser(email);

      // 追踪邮箱提交事件
      trackEvent('email_captured', {
        source: 'email_capture_modal',
        email: email
      });

      // 标记为已提交（LocalStorage + Zustand）
      markEmailSubmitted();

      // 显示成功消息
      alert('🎉 Thank you! You\'re on the list for exclusive updates.');

      // 关闭弹窗
      closeEmailCapture();

    } catch (err: any) {
      console.error('Email capture error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    trackEvent('email_capture_modal_closed', { source: 'close_button' });
    closeEmailCapture();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        pointerEvents: 'auto'
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '480px',
          maxWidth: '90vw',
          background: 'rgba(5, 17, 37, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.5)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 0 50px rgba(34, 211, 238, 0.3)',
          position: 'relative'
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '28px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
        >
          ×
        </button>

        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            ✨
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '24px',
            margin: 0,
            marginBottom: '8px',
            fontWeight: '600',
            letterSpacing: '1px'
          }}>
            Stay in the Flow
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Join our healing journey and get exclusive updates on new features, guided sessions, and special offers.
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: error ? '1px solid #f43f5e' : '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#22d3ee';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 211, 238, 0.3)';
              }}
              onBlur={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
            {error && (
              <div style={{
                color: '#f43f5e',
                fontSize: '12px',
                marginTop: '8px',
                textAlign: 'left'
              }}>
                {error}
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '15px',
              fontWeight: '600',
              color: 'white',
              background: isSubmitting
                ? 'rgba(34, 211, 238, 0.5)'
                : 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              border: 'none',
              borderRadius: '12px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
              boxShadow: '0 4px 20px rgba(34, 211, 238, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(34, 211, 238, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 211, 238, 0.4)';
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Join the Journey'}
          </button>
        </form>

        {/* 隐私提示 */}
        <div style={{
          marginTop: '20px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.5)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          We respect your privacy. Unsubscribe anytime.
          <br />
          By joining, you agree to receive updates from IRW EmoHeal.
        </div>
      </div>
    </div>
  );
};
