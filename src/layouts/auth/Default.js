/**
 * layouts/auth/Default.js  (AuthIllustration wrapper)
 *
 * Used by any auth sub-page that still needs the old
 * "left content + right illustration" shell.
 * Redesigned to match the NikaahLink matrimonial aesthetic.
 *
 * NOTE: Your new SignIn page renders its own full layout
 * and does NOT use this wrapper. Keep this file for any
 * future auth pages (forgot password, email verify, etc.)
 */

import React from "react";
import PropTypes from "prop-types";
import { Box, Flex, Icon, Text, Image } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FaChevronLeft, FaHeart } from "react-icons/fa";
import Footer from "components/footer/FooterAuth";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";

function AuthIllustration({ children, illustrationBackground }) {
  return (
    <Flex
      minH="100vh"
      w="100%"
      bg="#FDF8F3"
      position="relative"
      overflow="hidden"
    >
      {/* ── LEFT: content area ──────────────────────────── */}
      <Flex
        w={{ base: "100%", lg: "50%" }}
        direction="column"
        px={{ base: 6, md: 12, xl: 16 }}
        py={10}
        position="relative"
        zIndex={2}
      >
        {/* Back link */}
        <NavLink to="/admin" style={{ width: "fit-content", marginBottom: "32px" }}>
          <Flex
            align="center"
            gap={2}
            color="#9B7B6B"
            _hover={{ color: "#B5451B" }}
            transition="color 0.15s"
            w="fit-content"
          >
            <Icon as={FaChevronLeft} fontSize="11px" />
            <Text fontSize="sm" fontWeight="500">
              Back to dashboard
            </Text>
          </Flex>
        </NavLink>

        {/* Brand mark */}
        <Flex align="center" gap={2} mb={10}>
          <Box
            w="32px"
            h="32px"
            borderRadius="9px"
            bg="linear-gradient(135deg, #E8927C, #B5451B)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 12px rgba(181,69,27,0.3)"
          >
            <Icon as={FaHeart} color="white" fontSize="14px" />
          </Box>
          <Text
            fontFamily="'Georgia', serif"
            fontSize="lg"
            fontWeight="700"
            color="#2D1B0E"
            letterSpacing="-0.2px"
          >
            Nikaah<Text as="span" color="#B5451B">Link</Text>
          </Text>
        </Flex>

        {/* Page content (children) */}
        <Box flex={1}>
          {children}
        </Box>

        <Footer />
      </Flex>

      {/* ── RIGHT: illustration panel ───────────────────── */}
      <Box
        display={{ base: "none", lg: "block" }}
        w="50%"
        position="relative"
        overflow="hidden"
        borderLeftRadius="40px"
        boxShadow="-20px 0 60px rgba(45,27,14,0.15)"
      >
        {illustrationBackground ? (
          <Image
            src={illustrationBackground}
            objectFit="cover"
            w="100%"
            h="100%"
            position="absolute"
            inset={0}
          />
        ) : (
          <Box
            w="100%"
            h="100%"
            bg="linear-gradient(160deg, #2D1B0E 0%, #7A3B1E 50%, #B5451B 100%)"
            position="absolute"
            inset={0}
          />
        )}

        {/* Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(160deg, rgba(45,27,14,0.6) 0%, rgba(181,69,27,0.2) 60%, rgba(45,27,14,0.65) 100%)"
        />

        {/* Accent line */}
        <Box
          position="absolute"
          top={0}
          left={0}
          w="3px"
          h="100%"
          bg="linear-gradient(to bottom, transparent 0%, #E8927C 30%, #B5451B 60%, transparent 100%)"
        />

        {/* Floating quote card */}
        <Box
          position="absolute"
          bottom={{ base: "40px", xl: "60px" }}
          left={{ base: "30px", xl: "50px" }}
          right={{ base: "30px", xl: "50px" }}
          bg="rgba(15,8,4,0.55)"
          backdropFilter="blur(16px)"
          border="1px solid rgba(232,146,124,0.2)"
          p={{ base: 5, xl: 7 }}
          borderRadius="20px"
          color="white"
          boxShadow="0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)"
        >
          <Box
            h="2px"
            w="40px"
            bg="linear-gradient(to right, #E8927C, #B5451B)"
            borderRadius="full"
            mb={4}
          />
          <Text
            fontFamily="'Georgia', serif"
            fontSize={{ base: "sm", xl: "md" }}
            color="rgba(245,230,211,0.85)"
            fontStyle="italic"
            lineHeight="1.75"
            mb={4}
          >
            "And of His signs is that He created for you from yourselves mates
            that you may find tranquillity in them."
          </Text>
          <Text fontSize="xs" color="rgba(232,146,124,0.8)" fontWeight="600" letterSpacing="0.5px">
            — Quran 30:21
          </Text>
        </Box>

        {/* Top badge */}
        <Box
          position="absolute"
          top="28px"
          right="28px"
          bg="rgba(15,8,4,0.55)"
          backdropFilter="blur(12px)"
          border="1px solid rgba(232,146,124,0.2)"
          px={4}
          py={2}
          borderRadius="full"
        >
          <Flex align="center" gap={2}>
            <Icon as={FaHeart} color="#E8927C" fontSize="12px" />
            <Text fontSize="xs" color="#F5E6D3" fontWeight="600" letterSpacing="0.5px">
              Shariah Compliant
            </Text>
          </Flex>
        </Box>
      </Box>

      <FixedPlugin />
    </Flex>
  );
}

AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
};

export default AuthIllustration;