import { Outlet } from "react-router-dom"
import { ThemeOptions,createTheme, ThemeProvider } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: '#a4692e',
      },
      secondary: {
        main: '#415e39',
      },
    },
  };

const theme = createTheme(themeOptions);

export default function ThemeWrapper() {
    return (
        <ThemeProvider theme={theme}>
            <Outlet />
        </ThemeProvider>
    )
}