
export const theme = {
  colors: {
    primary: '#667eea',
    primaryDark: '#764ba2',
    primaryLight: '#8b9ef5',
    secondary: '#f093fb',
    secondaryDark: '#d945ef',
    secondaryLight: '#f5a6ff',
    tertiary: '#00d4ff',
    tertiaryDark: '#0099cc',
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#f8d7da',
    errorDark: '#721c24',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    white: '#ffffff',
    lightGray: '#f8f9fa',
    lighterGray: '#ecf0f1',
    gray: '#e9ecef',
    mediumGray: '#dee2e6',
    darkGray: '#adb5bd',
    darkText: '#2c3e50',
    mediumText: '#495057',
    lightText: '#6c757d',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#f1f3f5',
    bgLight: '#e7f5ff',
    bgAccent: '#ffe3e3',
    bgGradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bgGradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    bgGradient3: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
    borderColor: '#dee2e6',
    borderColorLight: '#e9ecef',
    borderColorDark: '#adb5bd',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowColorDark: 'rgba(0, 0, 0, 0.15)',
    shadowColorPrimary: 'rgba(102, 126, 234, 0.2)',
    like: '#ff6b6b',
    comment: '#4ecdc4',
    share: '#95e1d3',
    bookmark: '#ffe66d',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    huge: '40px',
  },
  
  borderRadius: {
    xs: '4px',
    sm: '5px',
    md: '8px',
    lg: '10px',
    xl: '12px',
    full: '50%',
  },
  
  fontSizes: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '28px',
    huge: '32px',
  },
  
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  transitions: {
    fast: '0.15s ease-in-out',
    base: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
};

export const gradients = {
  primary: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%)`,
  secondary: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.secondaryDark} 100%)`,
  tertiary: `linear-gradient(135deg, ${theme.colors.tertiary} 0%, ${theme.colors.tertiaryDark} 100%)`,
  

  sunset: `linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)`,
  ocean: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
  forest: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
  fire: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`,
  sky: `linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)`,
  

  pastelPurple: `linear-gradient(135deg, #f5a6ff 0%, #e0aaff 100%)`,
  pastelBlue: `linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)`,
  pastelGreen: `linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)`,
};

export default theme;
