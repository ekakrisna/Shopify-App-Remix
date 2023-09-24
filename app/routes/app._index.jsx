import { useEffect, Fragment, useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  List,
  Link,
  Spinner,
  Grid,
  TextField,
  IndexTable,
  EmptyState,
  Pagination,
  Modal,
} from "@shopify/polaris";

import shopify, { authenticate, sessionStorage } from "~/shopify.server";
import { useCustomFetch } from "~/libs/dataFetch";
import { addLocationApi, getHubApi, getHubPriceApi } from "~/api";
import { CashDollarMajor, DetailedPopUpMajor, FilterMajor } from "@shopify/polaris-icons";
import { getOrders } from "~/models/Order.server";

export const loader = async ({ request, context }) => {
  // console.log(request)
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const accessToken = session.accessToken;
  const searchParams = new URLSearchParams(request.url.split('?')[1] || '');
  console.log("---------=====================---------")
  console.log(context)

  console.log("---------=====================---------")
  const page_size = Number(searchParams.get('page_size')) || 10;
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || "";
  const query = { page_size, page, search }

  return json({ shop, query, accessToken, session });
};

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // const response = await admin.graphql(
  //   `mutation {
  //     locationAdd(input: {name: "New York Warehouses 1", address: {address1: "101 Liberty Street", city: "New York", provinceCode: "NY", countryCode: US, zip: "10006"}, fulfillsOnlineOrders: true}) {
  //       location {
  //         id
  //         name
  //         address {
  //           address1
  //           provinceCode
  //           countryCode
  //           zip
  //         }
  //         fulfillsOnlineOrders
  //       }
  //     }
  //   }`);

  // const response = await admin.graphql(
  //   `mutation createDeliveryProfile($profile: DeliveryProfileInput!) {
  //       deliveryProfileCreate(profile: $profile) {
  //         profile {
  //           id
  //           name
  //           profileLocationGroups {
  //             locationGroup {
  //               id
  //               locations(first: 5) {
  //                 nodes {
  //                   name
  //                   address {
  //                     country
  //                   }
  //                 }
  //               }
  //             }
  //             locationGroupZones(first: 2) {
  //               edges {
  //                 node {
  //                   zone {
  //                     id
  //                     name
  //                     countries {
  //                       code {
  //                         countryCode
  //                       }
  //                       provinces {
  //                         code
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //         userErrors {
  //           field
  //           message
  //         }
  //       }
  //     }`, {
  //   "variables": {
  //     "profile": {
  //       "name": "HubOn Delivery",
  //       "locationGroupsToCreate": [
  //         {
  //           "locationsToAdd": [
  //             "gid://shopify/Location/91666219288",
  //             "gid://shopify/Location/91882258712"
  //           ],
  //           "zonesToCreate": [
  //             {
  //               "name": "Canada Zone",
  //               "countries": [
  //                 {
  //                   "code": "CA",
  //                   "provinces": [
  //                     {
  //                       "code": "ON"
  //                     }
  //                   ]
  //                 }
  //               ],
  //               "methodDefinitionsToCreate": [
  //                 {
  //                   "name": "Standard",
  //                   "rateDefinition": {
  //                     "price": {
  //                       "amount": 7.0,
  //                       "currencyCode": "USD"
  //                     }
  //                   },
  //                   "weightConditionsToCreate": [
  //                     {
  //                       "operator": "GREATER_THAN_OR_EQUAL_TO",
  //                       "criteria": {
  //                         "value": 0,
  //                         "unit": "KILOGRAMS"
  //                       }
  //                     },
  //                     {
  //                       "operator": "LESS_THAN_OR_EQUAL_TO",
  //                       "criteria": {
  //                         "value": 15.0,
  //                         "unit": "KILOGRAMS"
  //                       }
  //                     }
  //                   ]
  //                 }
  //               ]
  //             }
  //           ]
  //         },
  //         {
  //           "locationsToAdd": [
  //             "gid://shopify/Location/91883536664"
  //           ],
  //           "zonesToCreate": [
  //             {
  //               "name": "USA Zone",
  //               "countries": {
  //                 "code": "US",
  //                 "provinces": [
  //                   {
  //                     "code": "CO"
  //                   }
  //                 ]
  //               },
  //               "methodDefinitionsToCreate": [
  //                 {
  //                   "name": "Standard",
  //                   "rateDefinition": {
  //                     "price": {
  //                       "amount": 7,
  //                       "currencyCode": "USD"
  //                     }
  //                   }
  //                 }
  //               ]
  //             },
  //             {
  //               "name": "Mexico Zone",
  //               "countries": {
  //                 "code": "MX",
  //                 "provinces": [
  //                   {
  //                     "code": "MOR"
  //                   }
  //                 ]
  //               },
  //               "methodDefinitionsToCreate": [
  //                 {
  //                   "name": "Standard",
  //                   "rateDefinition": {
  //                     "price": {
  //                       "amount": 7,
  //                       "currencyCode": "USD"
  //                     }
  //                   }
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   }
  // });

  const carrier_service = new admin.rest.resources.CarrierService({ session: session });
  carrier_service.id = 83630686530;
  carrier_service.name = "HubOn Delivery";
  carrier_service.callback_url = "https://testing-app.balibecikwedding.com/api/callback";
  carrier_service.service_discovery = true;
  // carrier_service.active = true;

  // const response = await admin.rest.resources.CarrierService.delete({ session: session, id: 83630686530 })
  const response = await admin.rest.resources.CarrierService.all({ session: session })

  // const response = await carrier_service.save({
  //   update: true
  // }).then((res) => {
  //   console.log("---------========SUCCESS========---------")
  //   console.log(res);
  //   console.log("---------=====================---------")
  //   const successResponse = {
  //     data: true,
  //     message: `Succesfully create ${carrier_service.name}`,
  //     statusCode: 200
  //   }
  //   return successResponse;
  // }).catch((err) => {
  //   console.log("---------========ERROR========---------")
  //   console.log(err.status);
  //   console.log("---------=====================---------")
  //   const errorResponse = {
  //     data: null,
  //     message: err.statusText || "Shipping Rate Provider is already configured",
  //     statusCode: err.status
  //   }
  //   return errorResponse;
  // });

  console.log("---------=====================---------")
  console.log(response);
  console.log("---------=====================---------")
  return json({
    location: response,
  });
}

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const EmptyHubState = ({ onAction }) => (
  <EmptyState
    heading="Create unique QR codes for your product"
    action={{
      content: "Create QR code",
      onAction,
    }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>Allow customers to scan codes and buy products using their phones.</p>
  </EmptyState>
);

const HubsTable = ({ hubs, handleModal }) => (
  <IndexTable
    resourceName={{
      singular: "QR code",
      plural: "QR codes",
    }}
    itemCount={hubs.length}
    headings={[
      { title: "ID" },
      { title: "Hub Name" },
      { title: "Address" },
      { title: "Status" },
      { title: "Contact" },
      { title: "Detail" },
    ]}
    selectable={false}
  >
    {hubs.map((hub) => (
      <HubsTableRow key={hub.id} hub={hub} handleModal={() => handleModal(hub)} />
    ))}
  </IndexTable>
);

const HubsTableRow = ({ hub, handleModal }) => (
  <IndexTable.Row id={hub.id} position={hub.id}>
    <IndexTable.Cell>
      <Link url={`${hub.id}`}>{hub.id}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Link url={`${hub.id}`}>{truncate(hub.name)}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <p title={hub.address}>
        {truncate(hub.address)}
      </p>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <p className="capitalize">{truncate(hub.status)}</p>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <p title={hub.contact}>
        {truncate(hub.contact)}
      </p>
    </IndexTable.Cell>
    <IndexTable.Cell>
      <Button primary size="slim" icon={DetailedPopUpMajor} onClick={() => handleModal(hub)} />
    </IndexTable.Cell>
  </IndexTable.Row>
);

function DisplayObject(props) {
  const { data } = props;

  const renderObject = (obj) => {
    const elements = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (Array.isArray(value)) {
          // If the value is an array, iterate through its objects
          elements.push(
            <div key={key}>
              <p>{key}:</p>
              <ul>
                {value.map((item, index) => (
                  <li key={index}>
                    <p>Index {index}:</p>
                    {renderObject(item)}
                  </li>
                ))}
              </ul>
            </div>
          );
        } else if (typeof value === 'object') {
          // If the value is an object, recursively render it
          elements.push(
            <div key={key}>
              <p>{key}:</p>
              {renderObject(value)}
            </div>
          );
        } else {
          // Otherwise, render the key-value pair as a <p> element
          elements.push(
            <Grid key={key}>
              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                <p className="mb-2 capitalize">{key} :</p>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                <p className="mb-2 capitalize">{value}</p>
              </Grid.Cell>
            </Grid>
          );
        }
      }
    }

    return elements;
  };

  return renderObject(data);
}
export default function Index() {
  const nav = useNavigation();
  const { shop, query, accessToken, session, response } = useLoaderData();
  // console.log(accessToken)
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();
  console.log(actionData?.location)
  const isLoadingLocation =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";


  const [active, setActive] = useState(false);
  const [hubDetail, setHubDetail] = useState(null);
  const handleModal = useCallback((data) => {
    setHubDetail(data);
    setActive(!active);
  }, [active]);


  const useFetchPrice = useCustomFetch("myQueryKey", getHubPriceApi);
  const { isLoading, data } = useFetchPrice();


  const [filter, setFilter] = useState(query);
  const [hubs, setHubs] = useState([]);
  const [meta, setMeta] = useState({});

  const useFetchHubs = useCustomFetch(["myQueryKey", filter], () => getHubApi(filter), {
    // retry: 3,
    onSuccess: (data) => {
      setHubs(data.hubs);
      setMeta(data.meta);
    },
    onError: (error) => {
      console.error('Fetch error:', error);
    },
  });

  const { isLoading: isLoadingHubs } = useFetchHubs();

  const handleFilter = useCallback((newValue) => setFilter((prev) => ({ ...prev, search: newValue })), []);
  const handleClearSearch = () => setFilter((prev) => ({ ...prev, search: "" }));

  const addLocation = async ({ shop, hubs, accessToken }) => {
    const payload = {
      carrier_service: {
        "name": "Shipping Rate Provider",
        "callback_url": "http://shipping.example.com",
        "service_discovery": true
      }
    }
    const data = await addLocationApi({ shop, carrier_service: payload, accessToken })
    console.log(data)
    // const carrier_service = new shopify.rest.CarrierService({ session: session });
    // carrier_service.name = "Shipping Rate Provider";
    // carrier_service.callback_url = "http://shipping.example.com";
    // carrier_service.service_discovery = true;
    // await carrier_service.save({
    //   update: true,
    // });
    // const locations = hubs?.map((hub, index) => ({
    //   // ...hub,
    //   name: hub.name,
    //   address1: hub.address,
    //   city: `City ${index + 1}`,
    //   province: `State ${index + 1}`,
    //   country: `Country ${index + 1}`,
    //   zip: hub.zipcode,
    //   active: true
    // }))
    // // locations.forEach(addLocationApi({ shop, location, accessToken }));
    // const data = await addLocationApi({ shop, location: locations[0], accessToken });
    // console.log(data)
    // // console.log(`Created location: ${data.name} (ID: ${data.id})`);
  }

  // useEffect(() => {
  //   if (productId) {
  //     shopify.toast.show("Product created");
  //   }
  // }, [productId]);

  const generateLocation = () => submit({}, { replace: true, method: "PUT" });
  // () => addLocation({ shop, hubs, accessToken })
  return (
    <Page>
      <ui-title-bar title="HubOn App" >
        <button variant="primary" onClick={generateLocation}>
          Sync Locations
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card>
            <VerticalStack gap="5">
              <VerticalStack gap="2">
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    <FilterMajor width="24" />
                    <Text as="p">Filter</Text>
                  </div>
                  <Divider />
                </div>
                <TextField
                  label={<span className="font-semibold">Search :</span>}
                  value={filter.search}
                  onChange={handleFilter}
                  autoComplete="off"
                  clearButton
                  onClearButtonClick={handleClearSearch}
                  placeholder="Search hub by name, zipcode, city, or address"
                />
              </VerticalStack>
              <VerticalStack gap="2">
                {isLoadingHubs ? (
                  <VerticalStack inlineAlign="center">
                    <Spinner accessibilityLabel="Spinner example" size="small" />
                  </VerticalStack>
                ) : hubs.length === 0 ? (
                  <EmptyHubState onAction={() => navigate("hubs/new")} />
                ) : (
                  <div className="w-full">
                    <HubsTable hubs={hubs} handleModal={handleModal} />
                    <div className="float-right my-4">
                      <Pagination
                        hasPrevious={meta?.prev_page > 0}
                        onPrevious={() => setFilter(state => ({ ...state, page: state.page - 1 }))}
                        hasNext={meta?.next_page}
                        onNext={() => setFilter(state => ({ ...state, page: state.page + 1 }))}
                      />
                    </div>
                    {hubDetail && (
                      <Modal
                        open={active}
                        onClose={handleModal}
                        title={hubDetail.name}
                      >
                        <Modal.Section>
                          <DisplayObject data={hubDetail} />
                        </Modal.Section>
                      </Modal>
                    )}
                  </div>
                )}
              </VerticalStack>
            </VerticalStack>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <VerticalStack gap="5">
            {/* <Card>
              <Button loading={isLoading || isLoadingHubs || isLoadingLocation} primary onClick={generateLocation} fullWidth>
                Sync Locations
              </Button>
            </Card> */}
            <Card>
              <VerticalStack gap="2" inlineAlign={isLoading ? "center" : "stretch"}>
                {isLoading ? <Spinner /> : (
                  <>
                    {/* <div className="flex items-center gap-1">
                      <CashDollarMajor width="24" />
                    </div> */}
                    <Text as="h2" variant="headingMd">HubOn Price</Text>
                    <VerticalStack gap="2">
                      <Divider />
                      {data?.prices.map((item) =>
                      (
                        <Fragment key={item.id}>
                          <HorizontalStack align="space-between">
                            <div className="flex justify-between w-full mb-2">
                              <p className="font-semibold capitalize">{item.type.replace("_", " ")}</p>
                              <p className="font-semibold capitalize">${item.value}</p>
                            </div>
                            <p>{item.description}</p>
                          </HorizontalStack>
                          <Divider />
                        </Fragment>
                      ))}

                    </VerticalStack>
                  </>
                )}
              </VerticalStack>
            </Card>
            <Card>
              <VerticalStack gap="2">
                <Text as="h2" variant="headingMd">
                  Contact Us
                </Text>
                <Divider />
                <Link url="https://testing.com">
                  admin@testing.com
                </Link>
                <Link
                  url="https://testing.com/legal/terms-of-use"
                  target="_blank"
                >
                  Terms of use
                </Link>
                <Link
                  url="https://testing.com/legal/terms-of-use"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </VerticalStack>
            </Card>
          </VerticalStack>
        </Layout.Section>
      </Layout >

    </Page >
  );
}