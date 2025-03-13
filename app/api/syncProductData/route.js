import Shopify from "shopify-api-node";
import { NextResponse } from "next/server";
import supabase from "../../utils/supabase-server";

export async function POST() {
  if (!process.env.SHOPIFY_STORE_NAME || !process.env.SHOPIFY_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Missing Shopify configuration" },
      { status: 500 }
    );
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  // Configure Shopify client
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
    const shopifyData = await shopify.graphql(queryProducts);
    const products = shopifyData?.products?.nodes;
    console.log(`Fetched ${products?.length || 0} products from Shopify`);

    if (!products) {
      throw new Error("No products found in Shopify response");
    }

    const transformedProducts = products.map((product) => {
      const mediaItems =
        product.media?.nodes?.map((media) => ({
          alt: media.alt || "",
          image_id:
            media.preview?.image?.id?.replace(
              "gid://shopify/ImageSource/",
              ""
            ) || "",
          image_url: media.preview?.image?.url || "",
        })) || [];

      return {
        shopify_id: product.id,
        product_name: product.title,
        handle: product.handle,
        vendor: product.vendor,
        variant_count: product.variantsCount?.count || 0,
        total_inventory: product.totalInventory,
        product_type: product.productType,
        max_price: parseFloat(
          product.priceRangeV2?.maxVariantPrice?.amount || 0
        ),
        min_price: parseFloat(
          product.priceRangeV2?.minVariantPrice?.amount || 0
        ),
        currency: product.priceRangeV2?.maxVariantPrice?.currencyCode || "CAD",
        preview_url: product.onlineStorePreviewUrl,
        status: product.status,
        description: product.description,
        created_at: new Date(product.createdAt).toISOString(),
        media: mediaItems,
        image_alt_text: product.media?.nodes?.[0]?.alt || "",
        image_id:
          product.media?.nodes?.[0]?.preview?.image?.id?.replace(
            "gid://shopify/ImageSource/",
            ""
          ) || "",
        image_url: product.media?.nodes?.[0]?.preview?.image?.url || "",
      };
    });

    console.log(
      `Transformed ${transformedProducts.length} products for database`
    );

    const { error } = await supabase
      .from("Products")
      .upsert(transformedProducts, {
        onConflict: "shopify_id",
        returning: "minimal",
      });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      sync_time: new Date().toISOString(),
      product_count: transformedProducts.length,
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
