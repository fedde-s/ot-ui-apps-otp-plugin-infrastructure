import { lighten, darken } from "polished";
import { theme } from "@ot/config";
import ThemeProvider from "./ThemeProvider";

export const accentTheme = {
  ...theme,
  palette: {
    ...theme.palette,
    primary: {
      light: lighten(0.2, "#f95710"),
      main: "#f95710",
      dark: darken(0.2, "#f95710"),
      contrastText: "#fff",
    },
  },
};

export function overideTheme(Component: any, isAccented: (props: Object) => Boolean) {
  return (props: Object) => {
    if (isAccented(props)) {
      return (
        <ThemeProvider theme={accentTheme}>
          <Component {...props}/>
        </ThemeProvider>
      );
    } else {
      return <Component {...props} />;
    }
  };
}
