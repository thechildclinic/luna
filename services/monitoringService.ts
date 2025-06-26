/**
 * Luna AI Monitoring and Analytics Service
 * Tracks usage, performance, and errors for production optimization
 */

interface SessionMetrics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  voiceInteractions: number;
  errors: number;
  theme: string;
  userAgent: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTimes: number[];
  renderTimes: number[];
  memoryUsage?: number;
}

interface UsageEvent {
  type: 'session_start' | 'session_end' | 'message_sent' | 'voice_used' | 'theme_changed' | 'error_occurred';
  timestamp: Date;
  data?: any;
}

class MonitoringService {
  private sessionId: string;
  private sessionMetrics: SessionMetrics;
  private performanceMetrics: PerformanceMetrics;
  private events: UsageEvent[] = [];
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    this.sessionMetrics = {
      sessionId: this.sessionId,
      startTime: new Date(),
      messageCount: 0,
      voiceInteractions: 0,
      errors: 0,
      theme: 'cosmic-night', // default
      userAgent: navigator.userAgent
    };

    this.performanceMetrics = {
      pageLoadTime: 0,
      apiResponseTimes: [],
      renderTimes: []
    };

    this.initializeMonitoring();
  }

  private generateSessionId(): string {
    return `luna-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring() {
    // Track page load time
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.performanceMetrics.pageLoadTime = loadTime;
        this.trackEvent('session_start', { loadTime });
      });

      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });

      // Track memory usage (if available)
      if ('memory' in performance) {
        setInterval(() => {
          const memory = (performance as any).memory;
          this.performanceMetrics.memoryUsage = memory.usedJSHeapSize;
        }, 30000); // Every 30 seconds
      }

      // Track visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.trackEvent('session_end', { reason: 'tab_hidden' });
        } else {
          this.trackEvent('session_start', { reason: 'tab_visible' });
        }
      });
    }
  }

  trackEvent(type: UsageEvent['type'], data?: any) {
    const event: UsageEvent = {
      type,
      timestamp: new Date(),
      data
    };

    this.events.push(event);

    // Update session metrics based on event type
    switch (type) {
      case 'message_sent':
        this.sessionMetrics.messageCount++;
        break;
      case 'voice_used':
        this.sessionMetrics.voiceInteractions++;
        break;
      case 'error_occurred':
        this.sessionMetrics.errors++;
        break;
      case 'theme_changed':
        this.sessionMetrics.theme = data?.theme || 'unknown';
        break;
    }

    // In production, batch and send events to analytics service
    if (this.isProduction && this.events.length >= 10) {
      this.flushEvents();
    }
  }

  trackApiResponse(responseTime: number, success: boolean) {
    this.performanceMetrics.apiResponseTimes.push(responseTime);
    
    // Keep only last 50 response times
    if (this.performanceMetrics.apiResponseTimes.length > 50) {
      this.performanceMetrics.apiResponseTimes.shift();
    }

    if (!success) {
      this.trackEvent('error_occurred', { type: 'api_error', responseTime });
    }
  }

  trackRenderTime(componentName: string, renderTime: number) {
    this.performanceMetrics.renderTimes.push(renderTime);
    
    if (renderTime > 100) { // Log slow renders
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  getSessionSummary() {
    const now = new Date();
    const sessionDuration = now.getTime() - this.sessionMetrics.startTime.getTime();
    
    return {
      ...this.sessionMetrics,
      sessionDuration: Math.round(sessionDuration / 1000), // in seconds
      averageApiResponseTime: this.getAverageApiResponseTime(),
      totalEvents: this.events.length,
      performanceScore: this.calculatePerformanceScore()
    };
  }

  private getAverageApiResponseTime(): number {
    const times = this.performanceMetrics.apiResponseTimes;
    if (times.length === 0) return 0;
    return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Deduct points for slow page load
    if (this.performanceMetrics.pageLoadTime > 3000) score -= 20;
    else if (this.performanceMetrics.pageLoadTime > 2000) score -= 10;
    
    // Deduct points for slow API responses
    const avgApiTime = this.getAverageApiResponseTime();
    if (avgApiTime > 5000) score -= 30;
    else if (avgApiTime > 3000) score -= 15;
    
    // Deduct points for errors
    score -= this.sessionMetrics.errors * 5;
    
    return Math.max(0, score);
  }

  endSession() {
    this.sessionMetrics.endTime = new Date();
    this.trackEvent('session_end');
    
    // Save session data locally
    this.saveSessionData();
    
    // Send final batch of events
    if (this.isProduction) {
      this.flushEvents();
    }
  }

  private saveSessionData() {
    try {
      const sessionData = this.getSessionSummary();
      const existingSessions = JSON.parse(localStorage.getItem('luna-sessions') || '[]');
      
      existingSessions.push(sessionData);
      
      // Keep only last 10 sessions
      if (existingSessions.length > 10) {
        existingSessions.shift();
      }
      
      localStorage.setItem('luna-sessions', JSON.stringify(existingSessions));
    } catch (error) {
      console.warn('Failed to save session data:', error);
    }
  }

  private flushEvents() {
    if (this.events.length === 0) return;

    const payload = {
      sessionId: this.sessionId,
      events: [...this.events],
      metrics: this.getSessionSummary(),
      timestamp: new Date().toISOString()
    };

    // Clear events after preparing payload
    this.events = [];

    // In a real production app, you would send this to your analytics service
    // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(payload) });
    
    if (this.isProduction) {
      console.log('[ANALYTICS]', payload);
      
      // For now, store in localStorage for debugging
      try {
        const existingAnalytics = JSON.parse(localStorage.getItem('luna-analytics') || '[]');
        existingAnalytics.push(payload);
        
        // Keep only last 5 analytics batches
        if (existingAnalytics.length > 5) {
          existingAnalytics.shift();
        }
        
        localStorage.setItem('luna-analytics', JSON.stringify(existingAnalytics));
      } catch (error) {
        console.warn('Failed to store analytics data:', error);
      }
    }
  }

  // Public methods for components to use
  trackMessageSent(messageLength: number, isVoice: boolean) {
    this.trackEvent('message_sent', { messageLength, isVoice });
    if (isVoice) {
      this.trackEvent('voice_used', { type: 'input' });
    }
  }

  trackVoiceOutput(duration: number) {
    this.trackEvent('voice_used', { type: 'output', duration });
  }

  trackThemeChange(newTheme: string) {
    this.trackEvent('theme_changed', { theme: newTheme });
  }

  trackError(error: string, context?: string) {
    this.trackEvent('error_occurred', { error, context });
  }

  // Get analytics data for debugging
  getAnalyticsData() {
    try {
      return {
        currentSession: this.getSessionSummary(),
        recentSessions: JSON.parse(localStorage.getItem('luna-sessions') || '[]'),
        analyticsData: JSON.parse(localStorage.getItem('luna-analytics') || '[]'),
        errors: JSON.parse(localStorage.getItem('luna-errors') || '[]')
      };
    } catch (error) {
      console.warn('Failed to retrieve analytics data:', error);
      return null;
    }
  }

  // Clear all stored data (for privacy)
  clearAllData() {
    try {
      localStorage.removeItem('luna-sessions');
      localStorage.removeItem('luna-analytics');
      localStorage.removeItem('luna-errors');
      console.log('All analytics data cleared');
    } catch (error) {
      console.warn('Failed to clear analytics data:', error);
    }
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService();

// Export for use in components
export default monitoring;
