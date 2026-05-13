import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('medlinka-theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem('medlinka-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const setDark  = () => setTheme('dark');
  const setLight = () => setTheme('light');

  return { theme, toggle, setDark, setLight, isDark: theme === 'dark' };
}
