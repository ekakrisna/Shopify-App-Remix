import { useCallback, useEffect, useState } from "react";
import {
  reactExtension,
  BlockStack,
  useApplyMetafieldsChange,
  useMetafield,
  Text,
  ScrollView,
  TextField,
  Choice,
  ChoiceList,
  useApplyShippingAddressChange,
  TextBlock,
  Banner,
  SkeletonTextBlock,
} from "@shopify/ui-extensions-react/checkout";


// Set the entry point for the extension
export default reactExtension("purchase.checkout.contact.render-after", () => <App />);

function App() {
  // custom state data
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const onChangeSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Define the API endpoint you want to fetch data from
    let apiUrl = 'https://hub-on-api--hub-on-gardeneur.sandboxes.run/api/v1/hubs';
    if (search) apiUrl += `?search=${search}`

    // Use the fetch API to make the GET request
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        const hubs = data.hubs.map((hub) => JSON.stringify(hub));
        setData({ ...data, hubs });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, [search]);

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

  const applyShippingAddressChange = useApplyShippingAddressChange();
  const handleChangeList = async (value) => {
    const jsonParse = JSON.parse(value);
    // Define the new shipping address object
    const newShippingAddress = {
      name: jsonParse.name,
      firstName: jsonParse.name,
      lastName: 'Doe',
      address1: jsonParse.address,
      address2: undefined,
      city: 'Cityville',
      province: 'PV',
      postalCode: '12345',
      country: 'CA',
      company: undefined,
      countryCode: "ID",
      phone: "",
      provinceCode: "KR",
      zip: jsonParse.zipcode,
    };

    // Apply the changes to the shipping address
    const updateShippingAddress = await applyShippingAddressChange({ type: "updateShippingAddress", address: newShippingAddress })

    if (updateShippingAddress.type === "success") {
      applyMetafieldsChange({
        type: "updateMetafield",
        namespace: metafieldNamespace,
        key: metafieldKey,
        valueType: "json_string",
        value: value,
      });
    }
  }

  // Render the extension components
  return (
    <BlockStack>
      <Text size="large" emphasis="bold" >
        HubOn delivery
      </Text>
      <TextField label="Search hub by name, zipcode, city, or address" value={search} onChange={onChangeSearch} />
      {isLoading ?
        <>
          <SkeletonTextBlock />
          <SkeletonTextBlock />
        </>
        : data?.hubs?.length > 0 ? (
          <ScrollView maxBlockSize={250}>
            <ChoiceList
              name="hubon"
              value={deliveryInstructions?.value || ""}
              onChange={handleChangeList}
            >
              <BlockStack>
                {data?.hubs?.map((hub) => (
                  <Choice id={hub} key={JSON.parse(hub).id}>
                    {/* <InlineStack>
                        <TextBlock size="base">
                          {hub.name}
                        </TextBlock>
                        {hub?.categories.map((category) => (
                          <Image source={category.icon_url} key={category.id} />
                        ))}
                      </InlineStack> */}
                    <TextBlock size="base">
                      {JSON.parse(hub).name}
                    </TextBlock>
                    <Text size="extraSmall">{JSON.parse(hub).address}</Text>
                    <TextBlock size="base">
                      {JSON.parse(hub).contact}
                    </TextBlock>
                  </Choice>
                ))}
              </BlockStack>
            </ChoiceList>
          </ScrollView>
        ) :
          <Banner
            status="info"
            title="No hub is found"
          />
      }
    </BlockStack >
  );
}