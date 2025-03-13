import Shopify from "shopify-api-node";
import { NextResponse } from "next/server";

export async function GET() {
  const shopify = new Shopify({
    shopName: process.env.SHOPIFY_STORE_NAME,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion: "2025-01",
  });

  const queryProducts = `{
        products(first: 250) {
            nodes {
            vendor
            variantsCount {
                count
            }
            totalInventory
            productType
            priceRangeV2 {
                maxVariantPrice {
                amount
                currencyCode
                }
                minVariantPrice {
                amount
                currencyCode
                }
            }
            onlineStorePreviewUrl
            id
            title
            status
            description(truncateAt: 1000)
            createdAt
            handle
            media(first: 10) {
                nodes {
                alt
                preview {
                    image {
                    id
                    url
                    }
                }
                }
            }
            }
        }
        }`;
  try {
    const data = await shopify.graphql(queryProducts);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Shopify API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop data" },
      { status: 500 }
    );
  }
}
