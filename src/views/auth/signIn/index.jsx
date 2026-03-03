/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Divider,
  Image,
  useToast,
  keyframes,
  Spinner,
  CircularProgress,
} from "@chakra-ui/react";

import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye, MdArrowForward } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useAuth } from "contexts/AuthContext";
import promoImage from "assets/img/auth/auth1.png";

// Optimized animations with will-change for better performance
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const flipIn = keyframes`
  0% {
    opacity: 0;
    transform: perspective(400px) rotateX(90deg) scale(0.9);
  }
  40% {
    transform: perspective(400px) rotateX(-10deg) scale(1);
  }
  70% {
    transform: perspective(400px) rotateX(5deg);
  }
  100% {
    opacity: 1;
    transform: perspective(400px) rotateX(0) scale(1);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

function SignIn() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const toast = useToast();
  
  // Refs for performance
  const emailRef = useRef();
  const formRef = useRef();
  const timeoutRef = useRef();

  // State
  const [isRegister, setIsRegister] = useState(false);
  const [animationType, setAnimationType] = useState('fade');
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Memoized color values for performance
  const colors = useMemo(() => ({
    bgLeft: useColorModeValue("gray.50", "gray.900"),
    cardBg: useColorModeValue("white", "gray.800"),
    borderColor: useColorModeValue("gray.200", "gray.700"),
    textColor: useColorModeValue("gray.800", "white"),
    secondaryText: useColorModeValue("gray.500", "gray.400"),
  }), []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    emailRef.current?.focus();
  }, [isRegister]);

  // Optimized switch mode with animation
  const switchMode = useCallback(() => {
    setLoading(false);
    setGoogleLoading(false);
    setAnimationType('flip');
    setFormKey(prev => prev + 1);
    
    timeoutRef.current = setTimeout(() => {
      setIsRegister(prev => !prev);
    }, 150);
  }, []);

  // Handle Google login with spinner
  const handleGoogleLogin = useCallback(async () => {
    if (googleLoading || loading) return;
    
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading, loading, loginWithGoogle, toast]);

  // Handle email/password submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (loading || googleLoading) return;

    // Validation
    if (!email || !password || (isRegister && !name)) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        await registerWithEmail(name, email.trim(), password);
        toast({
          title: "Account Created!",
          description: "Welcome aboard! 🎉",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        switchMode();
      } else {
        await loginWithEmail(email.trim(), password);

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", btoa(email));
        } else {
          localStorage.removeItem("rememberedEmail");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, googleLoading, email, password, name, isRegister, rememberMe, loginWithEmail, registerWithEmail, toast, switchMode]);

  // Get animation style based on type
  const getAnimationStyle = useCallback(() => {
    switch(animationType) {
      case 'flip':
        return `${flipIn} 0.4s cubic-bezier(0.23, 1, 0.32, 1)`;
      case 'scale':
        return `${scaleIn} 0.3s ease-out`;
      default:
        return `${fadeInUp} 0.3s ease-out`;
    }
  }, [animationType]);

  return (
    <Flex minH="100vh" w="100%" overflow="hidden" bg={colors.bgLeft}>
      
      {/* LEFT SIDE */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        align="center"
        justify="center"
        p={{ base: 4, md: 8 }}
        zIndex={2}
      >
        <Box
          w="100%"
          maxW="420px"
          bg={colors.cardBg}
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          boxShadow="0 25px 50px -12px rgba(0,0,0,0.25)"
          border="1px solid"
          borderColor={colors.borderColor}
          position="relative"
          overflow="hidden"
          transition="box-shadow 0.2s ease"
          _hover={{
            boxShadow: "0 30px 60px -12px rgba(0,0,0,0.3)",
          }}
        >
          {/* Decorative gradient line */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="4px"
            bgGradient="linear(to-r, blue.400, purple.500)"
            borderRadius="2px 2px 0 0"
          />

          {/* Form container with animation */}
          <Box
            key={formKey}
            animation={getAnimationStyle()}
            style={{ willChange: 'transform, opacity' }}
          >
            <Heading 
              mb={2} 
              fontSize={{ base: "2xl", md: "3xl" }}
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              {isRegister ? "Create Account" : "Welcome Back"}
            </Heading>

            <Text mb={6} color={colors.secondaryText} fontSize="md">
              {isRegister
                ? "Start your journey with us today"
                : "Sign in to access your account"}
            </Text>

            {/* Google Button with Spinner */}
            <Button
              w="100%"
              mb={6}
              leftIcon={googleLoading ? <Spinner size="sm" /> : <Icon as={FcGoogle} boxSize={5} />}
              onClick={handleGoogleLogin}
              isLoading={googleLoading}
              loadingText="Connecting..."
              variant="outline"
              borderRadius="lg"
              h="50px"
              borderColor={colors.borderColor}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
                bg: colors.cardBg,
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.2s"
              isDisabled={loading}
              spinner={<CircularProgress size="24px" isIndeterminate color="blue.500" />}
            >
              Continue with Google
            </Button>

            <Flex align="center" mb={6}>
              <Divider borderColor={colors.borderColor} />
              <Text mx={4} fontSize="sm" color={colors.secondaryText} fontWeight="500">
                OR
              </Text>
              <Divider borderColor={colors.borderColor} />
            </Flex>

            <form onSubmit={handleSubmit} ref={formRef}>
              {isRegister && (
                <FormControl mb={4} isRequired>
                  <FormLabel fontWeight="600" color={colors.textColor} fontSize="sm">
                    Full Name
                  </FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    size="lg"
                    borderRadius="lg"
                    borderColor={colors.borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    transition="all 0.2s"
                    isDisabled={loading || googleLoading}
                  />
                </FormControl>
              )}

              <FormControl mb={4} isRequired>
                <FormLabel fontWeight="600" color={colors.textColor} fontSize="sm">
                  Email Address
                </FormLabel>
                <Input
                  ref={emailRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  size="lg"
                  borderRadius="lg"
                  borderColor={colors.borderColor}
                  type="email"
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                  transition="all 0.2s"
                  isDisabled={loading || googleLoading}
                />
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel fontWeight="600" color={colors.textColor} fontSize="sm">
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    borderRadius="lg"
                    borderColor={colors.borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px blue.400",
                    }}
                    transition="all 0.2s"
                    isDisabled={loading || googleLoading}
                  />
                  <InputRightElement>
                    <Icon
                      as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      cursor="pointer"
                      onClick={() => setShow(!show)}
                      color={colors.secondaryText}
                      _hover={{ color: "blue.400" }}
                      transition="color 0.2s"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {!isRegister && (
                <Flex justify="space-between" align="center" mb={4}>
                  <Checkbox
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    colorScheme="blue"
                    size="md"
                    isDisabled={loading || googleLoading}
                  >
                    <Text color={colors.secondaryText} fontSize="sm">Remember me</Text>
                  </Checkbox>
                  
                  <Text
                    as="span"
                    color="blue.500"
                    fontSize="sm"
                    fontWeight="600"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Forgot Password?
                  </Text>
                </Flex>
              )}

              <Button
                type="submit"
                w="100%"
                colorScheme="blue"
                isLoading={loading}
                loadingText={isRegister ? "Creating..." : "Signing in..."}
                rightIcon={!loading && <Icon as={MdArrowForward} />}
                size="lg"
                borderRadius="lg"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
                isDisabled={googleLoading}
                spinner={<CircularProgress size="24px" isIndeterminate color="white" />}
              >
                {isRegister ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <Box mt={6} textAlign="center">
              <Text fontSize="sm" color={colors.secondaryText}>
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <Text
                  as="span"
                  color="blue.500"
                  fontWeight="600"
                  cursor="pointer"
                  onClick={switchMode}
                  position="relative"
                  _hover={{
                    "&::after": {
                      width: "100%",
                    },
                  }}
                  _after={{
                    content: '""',
                    position: "absolute",
                    bottom: "-2px",
                    left: "0",
                    width: "0",
                    height: "2px",
                    bg: "blue.500",
                    transition: "width 0.2s ease",
                  }}
                >
                  {isRegister ? "Sign In" : "Create Account"}
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* RIGHT SIDE - OPTIMIZED */}
      <Box
        display={{ base: "none", md: "block" }}
        w="50%"
        position="relative"
        overflow="hidden"
        borderLeftRadius="60px"
        boxShadow="-15px 0 30px rgba(0,0,0,0.1)"
      >
        {/* Image with hardware acceleration */}
        <Box
          position="relative"
          h="100vh"
          overflow="hidden"
          style={{ willChange: 'transform' }}
        >
          <Image
            src={promoImage}
            objectFit="cover"
            w="100%"
            h="100%"
            loading="eager"
            fallback={<Box bg="gray.800" w="100%" h="100%" />}
          />

          {/* Gradient Overlay - Optimized */}
          <Box
            position="absolute"
            inset="0"
            bgGradient="linear(to-t, rgba(0,0,0,0.8), rgba(0,0,0,0.3))"
          />

          {/* Glass Card */}
          <Box
            position="absolute"
            bottom={{ base: "40px", xl: "80px" }}
            left={{ base: "30px", xl: "60px" }}
            right={{ base: "30px", xl: "60px" }}
            bg="rgba(255,255,255,0.1)"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="rgba(255,255,255,0.1)"
            p={{ base: 6, xl: 8 }}
            borderRadius="2xl"
            color="white"
            boxShadow="0 20px 40px rgba(0,0,0,0.3)"
            transition="transform 0.2s ease, box-shadow 0.2s ease"
            _hover={{
              transform: "translateY(-5px)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
            }}
            style={{ willChange: 'transform' }}
          >
            <Heading 
              size={{ base: "lg", xl: "xl" }} 
              mb={3}
              bgGradient="linear(to-r, white, blue.200)"
              bgClip="text"
            >
              Find Your Perfect Match
            </Heading>
            
            <Text fontSize={{ base: "sm", xl: "md" }} opacity={0.9}>
              Join thousands of happy couples who found love safely and securely.
            </Text>

            {/* Stats */}
            <Flex mt={4} gap={4}>
              <Box>
                <Text fontSize={{ base: "lg", xl: "xl" }} fontWeight="bold" color="blue.300">
                  50K+
                </Text>
                <Text fontSize="xs" opacity={0.7}>Happy Couples</Text>
              </Box>
              <Box>
                <Text fontSize={{ base: "lg", xl: "xl" }} fontWeight="bold" color="blue.300">
                  98%
                </Text>
                <Text fontSize="xs" opacity={0.7}>Success Rate</Text>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default SignIn;