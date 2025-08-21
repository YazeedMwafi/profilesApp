import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#f2f2f2",
      100: "#d9d9d9",
      200: "#bfbfbf",
      300: "#a6a6a6",
      400: "#8c8c8c",
      500: "#737373",
      600: "#595959",
      700: "#404040",
      800: "#262626",
      900: "#0d0d0d",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
        borderRadius: "md",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          _focus: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px brand.500",
          },
        },
      },
    },
  },
  styles: {
    global: (props) => ({
      "html, body": {
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
        bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
        lineHeight: "tall",
      },
      a: {
        color: "brand.500",
        _hover: {
          textDecoration: "underline",
        },
      },
    }),
  },
});

export default theme;
