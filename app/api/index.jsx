import axios from 'axios';
import httpClient from '~/libs/httpClient';

// ----------------------------------------
// --------------EXTERNAL API--------------
// ----------------------------------------
export const getHubApi = async (filter) => {
    try {
        const response = await httpClient.get("/hubs", {
            params: filter
        });
        return Promise.resolve(response.data);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const getHubPriceApi = async () => {
    try {
        const response = await httpClient.get("/prices");
        return Promise.resolve(response.data);
    } catch (error) {
        return Promise.reject(error);
    }
};

// ----------------------------------------
// --------------INTERNAL API--------------
// ----------------------------------------
const createLocationMutation = `
mutation {
    locationAdd(input: {name: "New York Warehouses", address: {address1: "101 Liberty Street", city: "New York", provinceCode: "NY", countryCode: US, zip: "10006"}, fulfillsOnlineOrders: true}) {
      location {
        id
        name
        address {
          address1
          provinceCode
          countryCode
          zip
        }
        fulfillsOnlineOrders
      }
    }
  }`

// Function to send the GraphQL mutation to create a location
export const addLocationApi = async ({ shop, carrier_service, accessToken }) => {
    console.log(shop)
    try {
        const response = await axios.post(
            `https://${shop}/admin/api/2023-07/carrier_services.json`,
            { carrier_service },
            {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = response.data.data;
        console.log(`Created location: ${data.name} (ID: ${data.id})`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}