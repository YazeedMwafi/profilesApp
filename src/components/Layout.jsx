import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  IconButton,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { performLogout } from "../auth/logout";
import { FaMoon, FaSun } from "react-icons/fa";
import bloggerLogo from "../assets/bloggerIcon.svg";

export const Layout = () => {
  const auth = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleSignOut = async () => {
    await performLogout(auth);
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box
        as="header"
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        px={4}
        py={3}
      >
        <Flex align="center">
          <Flex align="center" gap={4}>
            <Heading as={RouterLink} to="/" size="lg" cursor="pointer">
              <Image src={bloggerLogo} alt="Post App" title="Blogger" height="50px" />
            </Heading>
            {auth.isAuthenticated && (
              <Button
                as={RouterLink}
                to="/"
                variant="ghost"
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
              >
                Home
              </Button>
            )}
          </Flex>

          <Spacer />

          <Flex align="center" gap={4}>
            <IconButton
              icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle color mode"
            />

            {auth.isAuthenticated && (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  leftIcon={
                    <Avatar
                      size="sm"
                      name={auth.user?.profile.name || auth.user?.profile.email}
                    />
                  }
                >
                  <Text display={{ base: "none", md: "block" }}>
                    {auth.user?.profile.name || auth.user?.profile.preferred_username || auth.user?.profile.email?.split("@")[0]}
                  </Text>
                </MenuButton>
                <MenuList>
                  <MenuItem
                    as={RouterLink}
                    to="/manage"
                    variant="ghost"
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                  >
                    Manage Posts
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box as="main" flex={1} p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};