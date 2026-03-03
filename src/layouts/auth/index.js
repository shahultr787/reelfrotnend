import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from 'routes.js';

// Chakra imports
import { 
  Box, 
  useColorModeValue, 
  keyframes,
  Icon,
  Text,
  Flex,
} from '@chakra-ui/react';

// Layout components
import { SidebarContext } from 'contexts/SidebarContext';

// Icons
import { HiSparkles, HiShieldCheck } from 'react-icons/hi';
import { BsHexagon, BsStars } from 'react-icons/bs';

// Animation keyframes
const float3D = keyframes`
  0% { transform: perspective(500px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
  25% { transform: perspective(500px) rotateX(2deg) rotateY(5deg) translateZ(20px); }
  50% { transform: perspective(500px) rotateX(0deg) rotateY(0deg) translateZ(40px); }
  75% { transform: perspective(500px) rotateX(-2deg) rotateY(-5deg) translateZ(20px); }
  100% { transform: perspective(500px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
`;

const rotate3D = keyframes`
  0% { transform: perspective(1000px) rotateY(0deg) rotateX(0deg); }
  100% { transform: perspective(1000px) rotateY(360deg) rotateX(10deg); }
`;

const glowPulse = keyframes`
  0% { opacity: 0.2; filter: blur(20px); }
  50% { opacity: 0.4; filter: blur(30px); }
  100% { opacity: 0.2; filter: blur(20px); }
`;

const particleDrift = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(100px, -100px) rotate(360deg); }
`;

export default function Auth() {
  // states and functions
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // All useColorModeValue hooks at the top level
  const authBg = useColorModeValue(
    'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    'linear-gradient(135deg, #0B1120 0%, #1A1F2E 100%)'
  );
  const accentColor = useColorModeValue('brand.500', 'brand.200');
  const textColor = useColorModeValue('navy.700', 'white');
  const glassBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)');
  const borderColor = useColorModeValue('rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)');
  const gridColor = useColorModeValue('#000', '#fff');

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 5,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Mouse move handler for parallax
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePosition({ x, y });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getRoute = () => {
    return window.location.pathname !== '/auth/full-screen-maps';
  };

  const getRoutes = (routes) => {
    return routes.map((route, key) => {
      if (route.layout === '/auth') {
        return (
          <Route path={`${route.path}`} element={route.component} key={key} />
        );
      }
      if (route.collapse) {
        return getRoutes(route.items);
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = 'ltr';

  return (
    <Box 
      position="relative" 
      minHeight="100vh"
      overflow="hidden"
      bg={authBg}
    >
      {/* 3D Animated Background Particles */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        overflow="hidden"
        pointerEvents="none"
        style={{
          transform: `translateX(${mousePosition.x * 20}px) translateY(${mousePosition.y * 20}px)`,
          transition: 'transform 0.2s ease',
        }}
      >
        {particles.map((particle) => (
          <Box
            key={particle.id}
            position="absolute"
            left={particle.left}
            top={particle.top}
            w={`${particle.size}px`}
            h={`${particle.size}px`}
            borderRadius="full"
            bg={accentColor}
            opacity={0.1}
            filter="blur(2px)"
            animation={`${particleDrift} ${particle.duration}s linear infinite`}
            style={{
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </Box>

      {/* 3D Floating Shapes */}
      <Box
        position="absolute"
        top="10%"
        left="5%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="brand.500"
        filter="blur(80px)"
        opacity={0.1}
        animation={`${glowPulse} 8s ease-in-out infinite`}
        style={{
          transform: `translateX(${mousePosition.x * -30}px) translateY(${mousePosition.y * -30}px)`,
        }}
      />
      
      <Box
        position="absolute"
        bottom="10%"
        right="5%"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="purple.500"
        filter="blur(100px)"
        opacity={0.1}
        animation={`${glowPulse} 10s ease-in-out infinite reverse`}
        style={{
          transform: `translateX(${mousePosition.x * 30}px) translateY(${mousePosition.y * 30}px)`,
        }}
      />

      {/* 3D Grid Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.03}
        style={{
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `perspective(500px) rotateX(${mousePosition.y * 2}deg) translateZ(10px)`,
        }}
      />

      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          position="relative"
          w="100%"
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
          zIndex={2}
        >
          {getRoute() ? (
            <Box 
              mx="auto" 
              minH="100vh"
              position="relative"
            >
              {/* Glass morphism overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={glassBg}
                backdropFilter="blur(10px)"
                borderBottom="1px solid"
                borderColor={borderColor}
                pointerEvents="none"
              />

              {/* 3D decorative elements */}
              <Flex
                position="absolute"
                top="20px"
                right="40px"
                align="center"
                gap={3}
                zIndex={3}
                style={{
                  transform: `perspective(500px) translateZ(20px)`,
                }}
              >
                <Icon
                  as={BsHexagon}
                  color={accentColor}
                  fontSize="24px"
                  animation={`${rotate3D} 10s linear infinite`}
                />
                <Text color={textColor} fontWeight="500" fontSize="sm">
                  Secure Authentication
                </Text>
                <Icon
                  as={HiShieldCheck}
                  color={accentColor}
                  fontSize="24px"
                  animation={`${float3D} 4s ease-in-out infinite`}
                />
              </Flex>

              {/* Main content with 3D effect */}
              <Box
                position="relative"
                zIndex={2}
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                  transition: 'transform 0.2s ease',
                }}
              >
                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/"
                    element={<Navigate to="/auth/sign-in/default" replace />}
                  />
                </Routes>
              </Box>

              {/* Floating sparkles */}
              <Box
                position="absolute"
                bottom="20px"
                left="40px"
                zIndex={3}
              >
                <Flex align="center" gap={2}>
                  {[...Array(3)].map((_, i) => (
                    <Icon
                      key={i}
                      as={BsStars}
                      color={accentColor}
                      opacity={0.5}
                      animation={`${float3D} ${2 + i}s ease-in-out infinite`}
                      style={{
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                  <Text color={textColor} fontSize="sm" opacity={0.7}>
                    Enterprise Edition
                  </Text>
                </Flex>
              </Box>
            </Box>
          ) : null}
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}