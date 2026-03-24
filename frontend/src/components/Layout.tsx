// ============================================
// App Shell Layout — Mantine
// ============================================

import { AppShell, Burger, Group, NavLink, Title, Text, Avatar } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Persons", path: "/persons", auth: true },
    { label: "Households", path: "/households", auth: true },
    { label: "Transactions", path: "/transactions", auth: true },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} c="green.7">
              🕌 MMS
            </Title>
          </Group>
          <Group>
            {user ? (
              <Group gap="xs">
                <Avatar size="sm" color="green" radius="xl">
                  {user.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" c="dimmed">
                  {role}
                </Text>
              </Group>
            ) : (
              <Text
                size="sm"
                c="blue"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/login")}
              >
                Sign In
              </Text>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems
          .filter((item) => !item.auth || user)
          .map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                toggle();
              }}
            />
          ))}
        {user && (
          <NavLink
            label="Sign Out"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            c="red"
            mt="auto"
          />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
