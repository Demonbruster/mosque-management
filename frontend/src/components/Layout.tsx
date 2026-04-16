// ============================================
// App Shell Layout — Mantine (Collapsible Navigation)
// ============================================

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Text,
  Avatar,
  Menu,
  ThemeIcon,
  ScrollArea,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import {
  IconDashboard,
  IconUsers,
  IconHome,
  IconMap,
  IconFocus2,
  IconReceipt2,
  IconChecklist,
  IconFileInvoice,
  IconInbox,
  IconBroadcast,
  IconMessage2Plus,
  IconUsersGroup,
  IconBuildingStore,
  IconBuildingEstate,
  IconChairDirector,
  IconHeartHandshake,
  IconMapPins,
  IconTarget,
  IconBriefcase,
  IconCertificate,
  IconGavel,
  IconBook,
  IconSettings,
  IconPlugConnected,
  IconHistory,
  IconLogout,
  IconUserCircle,
  IconPointFilled,
} from '@tabler/icons-react';

export function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navGroups = [
    {
      label: 'Dashboard',
      icon: IconDashboard,
      path: '/',
      isSingle: true,
    },
    {
      label: 'Community & CRM',
      icon: IconUsersGroup,
      auth: true,
      links: [
        { label: 'Members', path: '/members', icon: IconUsers },
        { label: 'Households', path: '/households', icon: IconHome },
        { label: 'Mahalla Mapping', path: '/mahallas', icon: IconMap },
        { label: 'Deduplication', path: '/deduplication', icon: IconFocus2 },
      ],
    },
    {
      label: 'Finance & Accounting',
      icon: IconReceipt2,
      auth: true,
      links: [
        { label: 'Transactions', path: '/finance', icon: IconFileInvoice },
        { label: 'Maker-Checker Queue', path: '/approvals', icon: IconChecklist },
        { label: 'Digital Receipts', path: '/receipts', icon: IconReceipt2 },
      ],
    },
    {
      label: 'Communications',
      icon: IconBroadcast,
      auth: true,
      links: [
        { label: 'Message Logs', path: '/communications/logs', icon: IconInbox },
        { label: 'Broadcasts', path: '/broadcasts', icon: IconBroadcast },
        { label: 'Audiences', path: '/audiences', icon: IconUsersGroup },
        { label: 'Templates', path: '/templates', icon: IconMessage2Plus },
      ],
    },
    {
      label: 'Operations & Assets',
      icon: IconBuildingStore,
      auth: true,
      links: [
        { label: 'Fixed Assets', path: '/assets', icon: IconBuildingStore },
        { label: 'Tenancy', path: '/tenancy', icon: IconBuildingEstate },
        { label: 'Rentals', path: '/rentals', icon: IconChairDirector },
        { label: 'Life Registry', path: '/life-events', icon: IconHeartHandshake },
      ],
    },
    {
      label: 'Projects & Roadmap',
      icon: IconTarget,
      auth: true,
      links: [
        { label: 'Admin Projects', path: '/admin/projects', icon: IconMapPins },
        { label: 'Public Roadmap', path: '/roadmap', icon: IconTarget },
      ],
    },
    {
      label: 'HR & Governance',
      icon: IconBriefcase,
      auth: true,
      links: [
        { label: 'Staff', path: '/staff', icon: IconBriefcase },
        { label: 'Meetings', path: '/meetings', icon: IconCertificate },
        { label: 'Panchayath', path: '/panchayath', icon: IconGavel },
        { label: 'Madrasa', path: '/madrasa', icon: IconBook },
      ],
    },
    {
      label: 'System Settings',
      icon: IconSettings,
      auth: true,
      roles: ['admin'],
      links: [
        { label: 'Mosque Settings', path: '/admin/settings', icon: IconSettings },
        { label: 'Admin Users', path: '/admin/users', icon: IconSettings },
        { label: 'Fund Categories', path: '/admin/fund-categories', icon: IconBook },
        { label: 'Integrations', path: '/integrations', icon: IconPlugConnected },
        { label: 'Audit Logs', path: '/audit-logs', icon: IconHistory },
      ],
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      bg="gray.0"
    >
      <AppShell.Header bg="white">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
            <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <ThemeIcon variant="light" color="green" size="lg" radius="md">
                <Text size="xl">🕌</Text>
              </ThemeIcon>
              <Title order={3} c="dark.8" style={{ fontWeight: 800 }}>
                MMS
              </Title>
            </Group>
          </Group>
          <Group>
            {user ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="xl" radius="xl">
                    <Avatar size="sm" color="green" radius="xl">
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Logged in as</Menu.Label>
                  <Menu.Item leftSection={<IconUserCircle size={14} />}>
                    <Text size="sm" fw={500} truncate w={150}>
                      {user.email}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Role: {role}
                    </Text>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Text
                size="sm"
                c="blue"
                style={{ cursor: 'pointer', fontWeight: 500 }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Text>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="0" bg="white">
        <ScrollArea h="100%" type="scroll">
          <Group px="md" py="xs" pb={0} mt="sm">
            <Text size="xs" fw={600} c="dimmed" lts={1}>
              MAIN MENU
            </Text>
          </Group>

          <div style={{ padding: '8px' }}>
            {navGroups
              .filter((group) => {
                if (group.auth && !user) return false;
                if (group.roles && (!role || !group.roles.includes(role))) return false;
                return true;
              })
              .map((group) => {
                if (group.isSingle && group.path) {
                  const isActive = location.pathname === group.path;
                  return (
                    <NavLink
                      key={group.label}
                      label={group.label}
                      leftSection={<group.icon size="1.2rem" stroke={1.5} />}
                      active={isActive}
                      color="green"
                      variant="light"
                      onClick={() => {
                        navigate(group.path!);
                        if (opened) toggle();
                      }}
                      styles={(theme) => ({
                        root: {
                          borderRadius: theme.radius.sm,
                          marginBottom: '4px',
                          fontWeight: isActive ? 600 : 500,
                        },
                      })}
                    />
                  );
                }

                // Nested Navigation Link
                const hasActiveChild = group.links?.some(
                  (link) =>
                    location.pathname === link.path ||
                    location.pathname.startsWith(`${link.path}/`),
                );

                return (
                  <NavLink
                    key={group.label}
                    label={group.label}
                    leftSection={<group.icon size="1.2rem" stroke={1.5} />}
                    defaultOpened={hasActiveChild} // Automatically expand if a child is active
                    childrenOffset={28}
                    styles={(theme) => ({
                      root: {
                        borderRadius: theme.radius.sm,
                        marginBottom: '4px',
                        fontWeight: hasActiveChild ? 600 : 500,
                      },
                    })}
                  >
                    {group.links?.map((link) => {
                      const isActive =
                        location.pathname === link.path ||
                        location.pathname.startsWith(`${link.path}/`);
                      return (
                        <NavLink
                          key={link.path}
                          label={link.label}
                          leftSection={
                            <IconPointFilled
                              size="0.6rem"
                              style={{ opacity: isActive ? 1 : 0.3 }}
                            />
                          }
                          active={isActive}
                          color="green"
                          variant="subtle"
                          onClick={() => {
                            navigate(link.path);
                            if (opened) toggle();
                          }}
                          styles={(theme) => ({
                            root: {
                              borderRadius: theme.radius.sm,
                              marginBottom: '2px',
                              fontWeight: isActive ? 600 : 400,
                            },
                          })}
                        />
                      );
                    })}
                  </NavLink>
                );
              })}
          </div>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <div style={{ minHeight: 'calc(100vh - 90px)' }}>
          <Outlet />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
