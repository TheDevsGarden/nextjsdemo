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
    const shopifyData = await shopify.graphql(queryOrders);
    const orders = shopifyData?.orders?.nodes;
    console.log(`Fetched ${orders?.length || 0} orders from Shopify`);

    if (!orders) {
      throw new Error("No orders found in Shopify response");
    }

    const transformedOrders = orders.map((order) => {
      const lineItems =
        order.lineItems?.nodes?.map((item) => ({
          name: item.name || "",
          id: item.id || "",
          quantity: item.quantity || 0,
          vendor: item.vendor || "",
        })) || [];

      return {
        shopify_id: order.id,
        order_name: order.name,
        created_at: new Date(order.createdAt).toISOString(),
        item_quantity: order.currentSubtotalLineItemsQuantity || 0,
        total_price: parseFloat(order.totalPriceSet?.shopMoney?.amount || 0),
        total_price_currency:
          order.totalPriceSet?.shopMoney?.currencyCode || order.currencyCode,
        total_received: parseFloat(
          order.totalReceivedSet?.shopMoney?.amount || 0
        ),
        total_received_currency:
          order.totalReceivedSet?.shopMoney?.currencyCode || order.currencyCode,
        total_refunded: parseFloat(
          order.totalRefundedSet?.shopMoney?.amount || 0
        ),
        total_refunded_currency:
          order.totalRefundedSet?.shopMoney?.currencyCode || order.currencyCode,
        unpaid: order.unpaid || false,
        confirmed: order.confirmed || false,
        currency_code: order.currencyCode,
        fully_paid: order.fullyPaid || false,
        refundable: order.refundable || false,
        requires_shipping: order.requiresShipping || false,
        restockable: order.restockable || false,
        email: order.email || "",
        line_items: lineItems,
      };
    });

    console.log(`Transformed ${transformedOrders.length} orders for database`);

    const { error } = await supabase.from("Orders").upsert(transformedOrders, {
      onConflict: "shopify_id",
      returning: "minimal",
    });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      sync_time: new Date().toISOString(),
      order_count: transformedOrders.length,
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
