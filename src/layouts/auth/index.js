/**
 * layouts/auth/index.js
 *
 * Ultra-lean wrapper — zero animations, zero mousemove, zero particles.
 * All visual work lives in the SignIn / auth child components.
 * This file just handles routing + SidebarContext.
 */
import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from 'routes.js';
import { Box } from '@chakra-ui/react';
import { SidebarContext } from 'contexts/SidebarContext';

export default function Auth() {
  const [toggleSidebar, setToggleSidebar] = useState(false);

  const getRoutes = (routes) =>
    routes.map((route, key) => {
      if (route.layout === '/auth')
        return <Route path={route.path} element={route.component} key={key} />;
      if (route.collapse) return getRoutes(route.items);
      return null;
    });

  document.documentElement.dir = 'ltr';

  return (
    <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
      <Box minHeight="100vh" w="100%">
        <Routes>
          {getRoutes(routes)}
          <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </Box>
    </SidebarContext.Provider>
  );
}