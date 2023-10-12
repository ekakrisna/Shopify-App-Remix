import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Card,
  EmptyState,
  IndexTable,
  Layout,
  Page,
  Link,
  VerticalStack,
  Button,
  Pagination,
  Modal,
  Spinner,
  TextField,
  Grid,
  Divider,
  Icon,
  Text,
} from "@shopify/polaris";
import { DetailedPopUpMajor, FilterMajor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import { getHubApi } from "~/api";
import { useCustomFetch } from "~/libs/dataFetch";

export const loader = async ({ request }) => {
  const searchParams = new URLSearchParams(request.url.split('?')[1] || '');
  const page_size = Number(searchParams.get('page_size')) || 10;
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || "";
  const query = { page_size, page, search }
  return json({ query });
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

export default function HubsPage() {
  const { query } = useLoaderData();

  const [active, setActive] = useState(false);
  const [hubDetail, setHubDetail] = useState(null);

  const handleModal = useCallback((data) => {
    setHubDetail(data);
    setActive(!active);
  }, [active]);

  const navigate = useNavigate();

  const [filter, setFilter] = useState(query);
  const [hubs, setHubs] = useState([]);
  const [meta, setMeta] = useState({});

  const useFetchState = useCustomFetch(["myQueryKey", filter], () => getHubApi(filter), {
    // retry: 3,
    onSuccess: (data) => {
      setHubs(data.hubs);
      setMeta(data.meta);
    },
    onError: (error) => {
      console.error('Fetch error:', error);
    },
  });

  const { isLoading } = useFetchState();

  const handleFilter = useCallback((newValue) => setFilter((prev) => ({ ...prev, search: newValue })), []);
  const handleClearSearch = () => setFilter((prev) => ({ ...prev, search: "" }));

  return (
    <Page backAction={{ url: '/app' }}>
      <ui-title-bar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card>
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <FilterMajor width="24" />
                <Text as="p">Filter</Text>
              </div>
              <Divider />
            </div>
            <Grid columns={{ xs: 1, sm: 2, md: 2, lg: 2 }}>
              <TextField
                label={<span className="font-semibold">Search</span>}
                value={filter.search}
                onChange={handleFilter}
                autoComplete="off"
                clearButton
                onClearButtonClick={handleClearSearch}
                placeholder="Search hub by name, zipcode, city, or address"
              />
            </Grid>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            {isLoading ? (
              <VerticalStack inlineAlign="center">
                <Spinner accessibilityLabel="Spinner example" size="small" />
              </VerticalStack>
            ) : hubs.length === 0 ? (
              <EmptyHubState onAction={() => navigate("hubs/new")} />
            ) : (
              <>
                <HubsTable hubs={hubs} handleModal={handleModal} />
                <div className="float-right my-4">
                  <Pagination
                    hasPrevious={meta?.prev_page > 0}
                    onPrevious={() => setFilter(state => ({ ...state, page: state.page - 1 }))}
                    hasNext={meta?.next_page}
                    onNext={() => setFilter(state => ({ ...state, page: state.page + 1 }))}
                  />
                </div>
              </>
            )}
          </Card>
        </Layout.Section>
        {hubDetail && (
          <Modal
            open={active}
            onClose={handleModal}
            title={hubDetail.name}
          >
            <Modal.Section>
              <DisplayObject data={hubDetail} />

              {/* {Object.keys(hubDetail).map((key) => (
                <Grid key={key}>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <p>{key}</p>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <p>{hubDetail[key]}</p>
                  </Grid.Cell>
                </Grid>
              ))} */}
            </Modal.Section>
          </Modal>
        )}
        <Layout.Section>

        </Layout.Section>
      </Layout>
    </Page>
  );
}

