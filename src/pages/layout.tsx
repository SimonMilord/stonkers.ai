import React from "react";
import { AppShell, Flex, Group, Burger, NavLink, Box } from "@mantine/core";
import { Link } from "react-router-dom";
import SearchBox from "@components/searchBox/searchBox";
import { CiCalculator1, CiHome, CiCircleList, CiLogin } from "react-icons/ci";
import { FaChartPie } from "react-icons/fa";
import { useAuth } from "../contexts/authContext";
import { useStockInfo } from "../contexts/stockContext";
import "./layout.css";

interface LayoutProps {
  children: React.ReactNode;
  opened: boolean;
  toggle: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, opened, toggle }) => {
  const { logout } = useAuth();
  const { currentStock } = useStockInfo();

  const handleLogout = () => {
    // Use the auth context logout method
    logout();
  };

  const navLinks = [
    {
      label: "Home",
      icon: CiHome,
      href: currentStock?.ticker ? `/details/${currentStock.ticker}` : `/home`,
      isExternal: false,
    },
    {
      label: "Calculator",
      icon: CiCalculator1,
      href: `/calculator`,
      isExternal: false,
    },
    {
      label: "Watchlist",
      icon: CiCircleList,
      href: `/watchlist`,
      isExternal: false,
    },
    {
      label: "Portfolio",
      icon: FaChartPie,
      href: `/portfolio`,
      isExternal: false,
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center" justify="space-between" h="100%">
          <Group px="md" className="header__logo-group">
            <Burger
              opened={opened}
              onClick={toggle}
              color="white"
              hiddenFrom="sm"
              size="sm"
            />
            <Link to="/" className="home-link">
              Stonkers.ai
            </Link>
          </Group>
          <Box className="header__searchbox-wrapper">
            <SearchBox variant="header" />
          </Box>
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {navLinks.map((navLink, index) => (
          <NavLink
            className="layout__navlink"
            to={navLink.href}
            leftSection={<navLink.icon size={20} />}
            label={navLink.label}
            key={index}
            component={Link}
            active={window.location.pathname === navLink.href}
          />
        ))}
        <NavLink
          className="layout__navlink"
          leftSection={<CiLogin size={20} />}
          label="Log out"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default Layout;
