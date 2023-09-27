import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";


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
    console.log("---------========SUCCESS========---------");
    // Response get metafields
    const responseMetaFields = await getMetaFields.json();
    // Extract the relevant data
    const metafieldDefinitions = responseMetaFields.data.metafieldDefinitions.edges.map((edge) => edge.node);
    // const meta field name
    const metaFieldName = "HubOn MetaField";
    // Check if any node has the key "hubon"
    const hasHubonKey = metafieldDefinitions.some((node) => node.name === metaFieldName);
    if (hasHubonKey) {
        console.log('At least one node has the key "hubon".');
    } else {
        // add meta field order
        const addMetaFieldOrder = await admin.graphql(
            `mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
            namespace
            key
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
                    "name": metaFieldName,
                    "namespace": "custom",
                    "key": "hubon",
                    "description": "A hub of used to make the order.",
                    "type": "json",
                    "ownerType": "ORDER"
                }
            }
        });

        const responseMetaField = await addMetaFieldOrder.json();
        const idMetaFieldHubOn = responseMetaField.data.metafieldDefinitionCreate?.createdDefinition?.id;

        // pin hubon meta field order
        if (idMetaFieldHubOn) {
            const pinMetaFieldOrder = await admin.graphql(
                `mutation metafieldDefinitionPin($definitionId: ID!) {
          metafieldDefinitionPin(definitionId: $definitionId) {
            pinnedDefinition {
              name
              key
              namespace
              pinnedPosition
            }
            userErrors {
              field
              message
            }
          }
        }`, {
                variables: {
                    "definitionId": idMetaFieldHubOn
                }
            });

            const responsePinMetaField = await pinMetaFieldOrder.json();
            console.log(responsePinMetaField);
        }
        console.log(responseMetaField.data.metafieldDefinitionCreate.createdDefinition.id);
    }
    console.log("---------========SUCCESS========---------");

    // get carrier services
    const responseGetCarrierServices = await admin.rest.resources.CarrierService.all({ session: session });
    const jsonDataCarrireServices = responseGetCarrierServices.data;
    console.log("=============jsonDataCarrireServices=================");
    console.log(jsonDataCarrireServices);
    console.log("=============jsonDataCarrireServices=================");
    if (jsonDataCarrireServices) {
        const hubonDeliveryService = "HubOn Delivery";
        const hubonCallbackUrl = 'https://testing-app.balibecikwedding.com/api/callback';
        const hasHubonDelivery = responseGetCarrierServices.data?.some((item) => item.name === hubonDeliveryService);
        if (hasHubonDelivery) {
            const response = await admin.rest.resources.CarrierService.delete({ session: session, id: 83991396674 });
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
            });
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
    };
    return json({ response });
}
