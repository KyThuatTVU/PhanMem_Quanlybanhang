import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Custom Hook theo dõi không hoạt động (Inactivity Logout Hook)
 * @param {number} timeoutMs - Thời gian tối đa không hoạt động (Mặc định 3 phút = 180,000ms)
 * @param {number} warningMs - Thời gian cảnh báo trước (Mặc định 30 giây = 30,000ms)
 */
export const useInactivityLogout = (timeoutMs = 180000, warningMs = 30000) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(Math.round(warningMs / 1000));

  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const handleLogoutDueToInactivity = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    logout();
    navigate('/login?reason=inactivity', { replace: true });
  }, [clearAllTimers, logout, navigate]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    clearAllTimers();
    setShowWarning(false);
    setRemainingSeconds(Math.round(warningMs / 1000));

    // 1. Hẹn giờ hiển thị cảnh báo (Sau 2.5 phút = 150,000ms)
    const timeBeforeWarning = Math.max(0, timeoutMs - warningMs);
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.round(warningMs / 1000));

      // Đếm lùi 30 giây cuối
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeBeforeWarning);

    // 2. Hẹn giờ tự động đăng xuất (Sau 3 phút = 180,000ms)
    timerRef.current = setTimeout(() => {
      handleLogoutDueToInactivity();
    }, timeoutMs);
  }, [isAuthenticated, timeoutMs, warningMs, clearAllTimers, handleLogoutDueToInactivity]);

  // Lắng nghe sự kiện người dùng tương tác
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Thao tác người dùng reset timer khi chưa hiện cảnh báo
    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Lần đầu tiên khởi chạy
    resetTimer();

    // Lắng nghe sự kiện đăng xuất đồng bộ giữa các Tab trình duyệt
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' && !e.newValue) {
        clearAllTimers();
        logout();
        navigate('/login?reason=inactivity', { replace: true });
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      clearAllTimers();
    };
  }, [isAuthenticated, resetTimer, showWarning, clearAllTimers, logout, navigate]);

  return {
    showWarning,
    remainingSeconds,
    resetTimer,
    handleLogoutDueToInactivity,
  };
};
