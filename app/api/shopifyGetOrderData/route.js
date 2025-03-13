import Shopify from "shopify-api-node";
import { NextResponse } from "next/server";

export async function GET() {
  const shopify = new Shopify({
    shopName: process.env.SHOPIFY_STORE_NAME,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion: "2025-01",
  });

  const queryOrders = `{
        orders(sortKey: CREATED_AT, reverse: true, first: 10) {
            nodes {
            createdAt
            currentSubtotalLineItemsQuantity
            totalPriceSet {
                shopMoney {
                amount
                currencyCode
                }
            }
            totalReceivedSet {
                shopMoney {
                amount
                currencyCode
                }
            }
            totalRefundedSet {
                shopMoney {
                amount
                currencyCode
                }
            }
            unpaid
            confirmed
            currencyCode
            id
            fullyPaid
            name
            refundable
            requiresShipping
            restockable
            lineItems(first: 50) {
                nodes {
                name
                id
                quantity
                vendor
                }
            }
            email
            }
        }
        }`;

  try {
    const data = await shopify.graphql(queryOrders);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Shopify API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop data" },
      { status: 500 }
    );
  }
}
