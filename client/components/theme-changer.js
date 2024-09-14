import { Button } from 'primereact/button';
import { useTheme } from '../hooks/use-theme';

const ThemeChanger = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      className="p-button-text m-1 custom-hover-effect"
      tooltip="Change Theme"
      tooltipOptions={{ position: 'left', showDelay: 500, hideDelay: 150 }}
      icon={`pi pi-${theme === 'light' ? 'moon' : 'sun'}`}
      onClick={toggleTheme}
    />
  );
};

export default ThemeChanger;
