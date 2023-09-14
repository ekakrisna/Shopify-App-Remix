import db from "../db.server";

// export async function getQRCode(id, graphql) {
//   const qrCode = await db.qRCode.findFirst({ where: { id } });

//   if (!qrCode) {
//     return null;
//   }

//   return supplementOrders(qrCode, graphql);
// }

export async function getOrders(shop, graphql) {
  const orders = await supplementOrders(shop, graphql);

  return orders;
}

async function supplementOrders(shop, graphql) {
  const response = await graphql(
    `
      {
        orders(first: 5) {
          edges {
            node {
              id
              email
              name
              processedAt
              registeredSourceUrl
              taxesIncluded
              legacyResourceId
              fulfillable
              customerLocale
              phone
              displayFinancialStatus
              confirmed
              closed
              closedAt
              cancelReason
              cancelledAt
              createdAt
              updatedAt
              tags
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    image {
                      id
                      altText
                      url
                      width
                    }
                    name
                    nonFulfillableQuantity
                    originalTotalSet {
                      presentmentMoney {
                        amount
                        currencyCode
                      }
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    product {
                      id
                      productType
                      title
                      vendor
                      updatedAt
                      tags
                      publishedAt
                      handle
                      descriptionHtml
                      description
                      createdAt
                    }
                    quantity
                    sku
                    taxLines {
                      priceSet {
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      rate
                      ratePercentage
                      title
                    }
                    taxable
                    title
                    unfulfilledQuantity
                    variantTitle
                    variant {
                      barcode
                      compareAtPrice
                      createdAt
                      displayName
                      id
                      image {
                        id
                        altText
                        url
                        width
                      }
                      inventoryQuantity
                      price
                      title
                      updatedAt
                    }
                    vendor
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                  hasPreviousPage
                  startCursor
                }
              }
              fulfillments {
                createdAt
                deliveredAt
                displayStatus
                estimatedDeliveryAt
                id
                inTransitAt
                legacyResourceId
                location {
                  id
                  name
                }
                name
                status
                totalQuantity
                trackingInfo {
                  company
                  number
                  url
                }
              }
              totalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingLine {
                carrierIdentifier
                id
                title
                custom
                code
                phone
                originalPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                source
                shippingRateHandle
              }
              shippingAddress {
                address1
                address2
                city
                country
                firstName
                lastName
                phone
                province
                zip
              }
              billingAddress {
                address1
                address2
                city
                country
                firstName
                lastName
                phone
                province
                zip
              }
              fulfillments {
                id
                createdAt
                updatedAt
                deliveredAt
                displayStatus
                estimatedDeliveryAt
                legacyResourceId
                name
                status
                trackingInfo {
                  company
                  number
                  url
                }
                updatedAt
              }
              customer {
                canDelete
                createdAt
                displayName
                email
                firstName
                hasTimelineComment
                locale
                note
                updatedAt
                id
                lastName
              }
              currentSubtotalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
                shopMoney {
                  amount
                  currencyCode
                }
              }
              currentTaxLines {
                channelLiable
                priceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                rate
                ratePercentage
                title
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
        }
      }
    `
  );

  const data = await response.json();

  return data;
}
