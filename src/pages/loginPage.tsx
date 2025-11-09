import React from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Divider,
  Center,
} from "@mantine/core";
import { FcGoogle } from "react-icons/fc";
import { RiUserLine } from "react-icons/ri";
import "./loginPage.css";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth login
    console.log("Google login clicked");
  };

  const handleGuestLogin = () => {
    // TODO: Implement guest login
    console.log("Guest login clicked");
  };

  return (
    <div className="login-page">
      <Container size={420} my={40}>
        <Center>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Stack gap="md">
              <div className="login-header">
                <Title order={2} ta="center" fw={900} className="login-title">
                  Stonkers.ai
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                  Your intelligent stock analysis platform
                </Text>
              </div>

              <Stack gap="sm" mt="xl">
                <Button
                  variant="default"
                  size="md"
                  leftSection={<FcGoogle size={20} />}
                  onClick={handleGoogleLogin}
                  fullWidth
                  className="google-login-btn"
                >
                  Sign in with Google
                </Button>

                <Divider
                  label="or"
                  labelPosition="center"
                  my="lg"
                  className="login-divider"
                />

                <Button
                  variant="default"
                  size="md"
                  leftSection={<RiUserLine size={20} />}
                  onClick={handleGuestLogin}
                  fullWidth
                  className="guest-login-btn"
                >
                  Continue as Guest
                </Button>
              </Stack>

              <Text c="dimmed" size="xs" ta="center" mt="xl">
                By signing in, you agree to our terms of service and privacy
                policy
              </Text>
            </Stack>
          </Paper>
        </Center>
      </Container>
    </div>
  );
}
