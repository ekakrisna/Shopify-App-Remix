import { useEffect, Fragment, useState, useCallback } from "react";
import { json } from "@remix-run/node";
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
  Divider,
  Link,
  Spinner,
  Grid,
  TextField,
  IndexTable,
  EmptyState,
  Pagination,
  Modal,
  Banner,
} from "@shopify/polaris";

import { authenticate } from "~/shopify.server";
import { useCustomFetch } from "~/libs/dataFetch";
import { getHubApi, getHubPriceApi } from "~/api";
import { DetailedPopUpMajor, FilterMajor } from "@shopify/polaris-icons";

export const loader = async ({ request }) => {
  const { session, } = await authenticate.admin(request);
  const shop = session.shop;
  const accessToken = session.accessToken;
  const searchParams = new URLSearchParams(request.url.split('?')[1] || '');
  const page_size = Number(searchParams.get('page_size')) || 10;
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || "";
  const query = { page_size, page, search }

  return json({ shop, query, accessToken, session });
};

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const getMetaFields = await admin.graphql(
    `query {
      metafieldDefinitions(first: 250, ownerType: ORDER) {
        edges {
          node {
            name
          }
        }
      }
    }`
  );
  console.log("---------========SUCCESS========---------")
  // Response get metafields
  const responseMetaFields = await getMetaFields.json();
  // Extract the relevant data
  const metafieldDefinitions = responseMetaFields.data.metafieldDefinitions.edges.map((edge) => edge.node);
  // const meta field name
  const metaFieldName = "HubOn MetaField"
  // Check if any node has the key "hubon"
  const hasHubonKey = metafieldDefinitions.some((node) => node.name === metaFieldName);
  if (hasHubonKey) {
    console.log('At least one node has the key "hubon".');
  } else {
    const addMetaFieldOrder = await admin.graphql(
      `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
          }
          userErrors {
            field
            message
            code
          }
        }
      }`, {
      variables: {
        "definition": {
          "name": "HubOn MetaField",
          "namespace": "custom",
          "key": "hubon",
          "description": "A hub of used to make the order.",
          "type": "json",
          "ownerType": "ORDER"
        }
      }
    });

    const responseMetaField = await addMetaFieldOrder.json();
    console.log(responseMetaField);
  }
  console.log("---------========SUCCESS========---------")

  // get carrier services
  const responseGetCarrierServices = await admin.rest.resources.CarrierService.all({ session: session })
  const jsonDataCarrireServices = responseGetCarrierServices.data;
  console.log("=============jsonDataCarrireServices=================");
  console.log(jsonDataCarrireServices);
  console.log("=============jsonDataCarrireServices=================");
  if (jsonDataCarrireServices) {
    const hubonDeliveryService = "HubOn Delivery";
    const hubonCallbackUrl = 'https://testing-app.balibecikwedding.com/api/callback';
    const hasHubonDelivery = responseGetCarrierServices.data?.some((item) => item.name === hubonDeliveryService);
    if (hasHubonDelivery) {
      // const response = await admin.rest.resources.CarrierService.delete({ session: session, id: 83630686530 })
      console.log('HubOn Delivery Available');
      // console.log(response);
      // console.log('HubOn Delivery Available');
    } else {
      const carrierService = new admin.rest.resources.CarrierService({ session: session });
      carrierService.name = hubonDeliveryService;
      carrierService.callback_url = hubonCallbackUrl;
      carrierService.service_discovery = true;
      const responseCarrierService = await carrierService.save({
        update: true
      })
      // const dataCarrierService = await responseCarrierService;
      console.log("=============dataCarrierService=================");
      console.log(responseCarrierService);
      console.log("=============dataCarrierService=================");
    }

  }
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

  // console.log("---------=====================---------")
  // console.log(response);
  // console.log("---------=====================---------")
  // return redirect("/app");
  const response = {
    data: true,
    statusCode: 200
  }
  return json({ response });
}

function truncate(str, { length = 25 } = {}) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

const EmptyHubState = ({ onAction }) => (
  <EmptyState
    heading="No hub is found"
    // action={{
    //   content: "Create QR code",
    //   onAction,
    // }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    {/* <p>No hub is found</p> */}
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
  const { query } = useLoaderData();

  const submit = useSubmit();

  const response = useActionData()?.response || { data: false };

  const [showBanner, setShowBanner] = useState(response?.data);
  const toggleBanner = useCallback(() => setShowBanner((active) => !active), []);

  const showBannerElement = showBanner ? <Layout.Section>
    <Banner title="HubOn Delivery" status="success" onDismiss={toggleBanner}>
      <p>HubOn delivery configured successfully!</p>
    </Banner>
  </Layout.Section> : null;

  useEffect(() => {
    if (response.data) setShowBanner(response.data)
  }, [response])

  const nav = useNavigation();
  const isLoadingSync =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const generateLocation = () => submit({}, { replace: true, method: "POST" });

  const navigate = useNavigate();

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

  return (
    <Page
      title="HubOn Delivery App"
      primaryAction={{
        content: 'Active HubOn Delivery',
        onAction: generateLocation,
        loading: isLoadingSync
      }
      }
    >
      <Layout>
        {showBannerElement}
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