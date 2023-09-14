import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  reactExtension,
  TextField,
  BlockStack,
  useApplyMetafieldsChange,
  useMetafield,
  Checkbox,
} from "@shopify/ui-extensions-react/checkout";
import { Select, SkeletonText, Text } from "@shopify/ui-extensions/checkout";
import { Autocomplete, Icon } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";

// Set the entry point for the extension
export default reactExtension("purchase.checkout.contact.render-after", () => <App />);

function App() {
  // Set up the checkbox state
  const [checked, setChecked] = useState(false);

  // Define the metafield namespace and key
  const metafieldNamespace = "metafields.custom.hubon";
  const metafieldKey = "custom.hubon";

  // Get a reference to the metafield
  const deliveryInstructions = useMetafield({
    namespace: metafieldNamespace,
    key: metafieldKey,
  });
  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

  // Set a function to handle the Checkbox component's onChange event
  const handleChange = () => {
    setChecked(!checked);
  };

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define the API endpoint you want to fetch data from
    const apiUrl = 'https://hub-on-api--hub-on-gardeneur.sandboxes.run/api/v1/hubs';

    // Use the fetch API to make the GET request
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        console.log(data)
        // Update the state with the fetched data
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  // Render the extension components
  return (
    <BlockStack>
      <Text size="large" emphasis="bold" >
        App testing delivery
      </Text>
      {isLoading ?
        <SkeletonText />
        :
        <Select
          label="Select hub"
          value={2}
          options={data?.hubs?.map((hub) => ({ ...hub, label: hub.name }))}
          autocomplete
        />
      }
      {/* {checked && ( */}
      {/* <Autocomplete
        options={options}
        selected={selectedOptions}
        onSelect={updateSelection}
        textField={textField}
      /> */}
      {/* )}  */}
    </BlockStack>
  );
}