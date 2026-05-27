import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('medlinka-theme') as Theme) || 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
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
