import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export const useEmailCapture = () => {
  const openEmailCapture = useStore(state => state.openEmailCapture);
  const hasSubmittedEmail = useStore(state => state.hasSubmittedEmail);
  const phase = useStore(state => state.phase);
  const hasStartedSession = useRef(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    // 检查LocalStorage中是否已提交过邮箱
    const emailSubmitted = localStorage.getItem('irw_email_submitted');
    if (emailSubmitted === 'true') {
      return; // 已提交过邮箱，不再触发
    }

    // 如果状态中已标记提交，也不再触发
    if (hasSubmittedEmail) {
      return;
    }

    // 触发条件1: 用户进入Resonance阶段（完成了整个流程）
    if (phase === 'resonance' && !hasStartedSession.current) {
      hasStartedSession.current = true;

      // 延迟3秒后触发邮箱捕获弹窗
      const timer = setTimeout(() => {
        if (!hasTriggered.current) {
          hasTriggered.current = true;
          openEmailCapture();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }

    // 触发条件2: 用户在页面停留超过2分钟（120秒）
    // 注：这个触发器会在组件首次挂载后2分钟触发
    const inactivityTimer = setTimeout(() => {
      const emailSubmitted = localStorage.getItem('irw_email_submitted');
      if (emailSubmitted !== 'true' && !hasSubmittedEmail && !hasTriggered.current) {
        hasTriggered.current = true;
        openEmailCapture();
      }
    }, 120000); // 2分钟

    return () => clearTimeout(inactivityTimer);
  }, [phase, hasSubmittedEmail, openEmailCapture]);

  // 触发条件3: 用户即将离开页面（beforeunload）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const emailSubmitted = localStorage.getItem('irw_email_submitted');
      if (emailSubmitted !== 'true' && !hasSubmittedEmail && !hasTriggered.current) {
        hasTriggered.current = true;
        openEmailCapture();

        // 阻止页面离开，给用户看到弹窗的机会
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasSubmittedEmail, openEmailCapture]);
};
