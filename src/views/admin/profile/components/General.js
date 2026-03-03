// Chakra imports
import {
  SimpleGrid,
  Text,
  useColorModeValue,
  Button,
  VStack,
  Spinner
} from "@chakra-ui/react";

// Custom components
import Card from "components/card/Card.js";
import React, { useState } from "react";
import Information from "views/admin/profile/components/Information";

// 🔥 Import your global apiFetch
import { apiFetch } from "utils/apiFetch";

export default function GeneralInformation(props) {
  const { ...rest } = props;

  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "unset"
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // 🔥 Test API Call
  const handleTestApi = async () => {
    try {
      setLoading(true);
      setResult("");

      const data = await apiFetch("/api/profile");

      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card mb={{ base: "0px", "2xl": "20px" }} {...rest}>
      <Text
        color={textColorPrimary}
        fontWeight="bold"
        fontSize="2xl"
        mt="10px"
        mb="4px"
      >
        General Information
      </Text>

      <Text color={textColorSecondary} fontSize="md" mb="20px">
        Test global apiFetch + refresh logic below.
      </Text>

      {/* 🔥 Test Button Section */}
      <VStack align="start" spacing={4} mb="30px">
        <Button
          colorScheme="blue"
          onClick={handleTestApi}
          isLoading={loading}
        >
          Test Protected API
        </Button>

        {loading && <Spinner size="sm" />}

        {result && (
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {result}
          </Text>
        )}
      </VStack>

      {/* Existing Grid */}
      <SimpleGrid columns="2" gap="20px">
        <Information
          boxShadow={cardShadow}
          title="Education"
          value="Stanford University"
        />
        <Information
          boxShadow={cardShadow}
          title="Languages"
          value="English, Spanish, Italian"
        />
        <Information
          boxShadow={cardShadow}
          title="Department"
          value="Product Design"
        />
        <Information
          boxShadow={cardShadow}
          title="Work History"
          value="Google, Facebook"
        />
        <Information
          boxShadow={cardShadow}
          title="Organization"
          value="Simmmple Web LLC"
        />
        <Information
          boxShadow={cardShadow}
          title="Birthday"
          value="20 July 1986"
        />
      </SimpleGrid>
    </Card>
  );
}