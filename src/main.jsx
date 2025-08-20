import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import theme from "./theme";
import cognitoAuthConfig from "./auth/oidcConfig";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider
          {...cognitoAuthConfig}
          onSigninCallback={() => {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }}
          onRemoveUser={() => {
            try {
              localStorage.clear();
              sessionStorage.clear();
            } catch {}
          }}
        >
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
