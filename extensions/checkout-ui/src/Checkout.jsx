import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  reactExtension,
  BlockStack,
  useApplyMetafieldsChange,
  useMetafield,
  useApplyShippingAddressChange,
  Button, Select, SkeletonText, Text, useApplyAttributeChange, useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";

// Set the entry point for the extension
export default reactExtension("purchase.checkout.contact.render-after", () => <App />);

function App() {
  // Define the metafield namespace and key
  const metafieldNamespace = "custom";
  const metafieldKey = "hubon";

  // Get a reference to the metafield
  const deliveryInstructions = useMetafield({
    namespace: metafieldNamespace,
    key: metafieldKey,
  });
  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

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
        // Update the state with the fetched data
        const newArray = [];
        for (let i = 0; i < 10; i++) {
          newArray.push(data.hubs[i % data.hubs.length]);
        }
        // console.log(newArray);
        setData({ ...data, hubs: newArray });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  const applyAttributeChange = useApplyAttributeChange();

  // 3. Call API methods to modify the checkout
  async function onCheckboxChange(isChecked) {
    const result = await applyAttributeChange({
      key: 'requestedFreeGift',
      type: 'updateAttribute',
      value: isChecked ? 'yes' : 'no',
    });
    console.log(
      'applyAttributeChange result',
      result,
    );
  }

  // const applyShippingAddressChange = useApplyShippingAddressChange();
  // // Handler to apply the shipping address changes
  // const handleShippingAddressChange = () => {
  //   // Define the new shipping address object
  //   const newShippingAddress = {
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     address1: '123 New Street',
  //     city: 'Cityville',
  //     province: 'PV',
  //     postalCode: '12345',
  //     country: 'CA',
  //   };

  //   // Apply the changes to the shipping address
  //   applyShippingAddressChange(newShippingAddress)
  //     .then((result) => {
  //       console.log(result)
  //       if (result.success) {
  //         console.log('Shipping address changes applied successfully.');
  //       } else {
  //         console.error('Failed to apply shipping address changes:', result.error);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('An error occurred while applying shipping address changes:', error);
  //     });
  // };

  // Render the extension components
  return (
    <BlockStack>
      <Text size="large" emphasis="bold" >
        HubOn Delivery
      </Text>
      {/* <Button
        onPress={handleShippingAddressChange}
      >
        Pay now
      </Button> */}

      {/* <Checkbox onChange={onCheckboxChange}>
        I would like to receive a free gift with my
        order
      </Checkbox> */}
      {isLoading ?
        <SkeletonText />
        :
        <Select
          label="Select hub"
          value={deliveryInstructions?.value}
          options={data?.hubs?.map((hub) => ({ ...hub, label: `${hub.name} $7`, value: hub.id }))}
          autocomplete
          onChange={(value) => {
            // Apply the change to the metafield
            applyMetafieldsChange({
              type: "updateMetafield",
              namespace: metafieldNamespace,
              key: metafieldKey,
              valueType: "string",
              value,
            });
          }}
        />
      }
      {/* <ScrollView maxBlockSize={300}>
        <ChoiceList
          name="choice"
          value={deliveryInstructions?.value}
          onChange={(value) => {
            console.log(
              `onChange event with value: ${value}`,
            );
            applyMetafieldsChange({
              type: "updateMetafield",
              namespace: metafieldNamespace,
              key: metafieldKey,
              valueType: "string",
              value,
            });
          }}
        >
          <BlockStack>
            {data?.hubs?.map((hub) => (
              // <Choice id={hub.id} key={hub.id}>{hub.name}</Choice>
              <Choice id={hub.id} key={hub.id}>
                {hub.name} $7
              </Choice>
            ))}
          </BlockStack>
        </ChoiceList>
      </ScrollView> */}
      {/* <Checkbox checked={checked} onChange={handleChange}>
        Provide delivery instructions
      </Checkbox>
      {checked && (
        <TextField
          label="Delivery instructions"
          multiline={3}
          onChange={(value) => {
            // Apply the change to the metafield
            applyMetafieldsChange({
              type: "updateMetafield",
              namespace: metafieldNamespace,
              key: metafieldKey,
              valueType: "string",
              value,
            });
          }}
          value={deliveryInstructions?.value}
        />
      )} */}
    </BlockStack >
  );
}