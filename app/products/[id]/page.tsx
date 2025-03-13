"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  shopify_id: string;
  product_name: string;
  description: string;
  image_url: string;
  image_alt_text: string;
  min_price: number;
  max_price: number;
  currency: string;
  vendor: string;
  product_type: string;
  total_inventory: number;
  status: string;
  handle: string;
  preview_url: string;
  media: {
    alt: string;
    image_id: string;
    image_url: string;
  }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const response = await fetch(`/api/dbGetProductData?id=${productId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error: {error}</p>
        <Link href="/products" className="mt-2 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
        <Link href="/products" className="mt-2 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-md">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/products" className="inline-flex items-center text-blue-600 mb-6">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.image_alt_text || product.product_name}
              width={600}
              height={600}
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-200 rounded-lg">
              <span className="text-gray-400">No image available</span>
            </div>
          )}

          {product.media && product.media.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.media.slice(0, 4).map((item, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-md">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.alt || `Product image ${index + 1}`}
                      width={150}
                      height={150}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{product.product_name}</h1>
          <p className="text-gray-600 mb-4">{product.vendor}</p>

          <div className="mb-4">
            <p className="text-xl font-medium">
              {product.min_price === product.max_price
                ? formatPrice(product.min_price, product.currency)
                : `${formatPrice(product.min_price, product.currency)} - ${formatPrice(product.max_price, product.currency)}`}
            </p>
          </div>

          <div className="flex items-center mb-6">
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                product.total_inventory > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.total_inventory > 0 ? "In Stock" : "Out of Stock"}
            </span>
            {product.total_inventory > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                {product.total_inventory} in stock
              </span>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          <div className="space-y-4">
            {product.product_type && (
              <div className="flex">
                <span className="text-gray-500 w-24">Type:</span>
                <span>{product.product_type}</span>
              </div>
            )}
            <div className="flex">
              <span className="text-gray-500 w-24">Status:</span>
              <span>{product.status}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-24">SKU:</span>
              <span>{product.shopify_id.split('/').pop()}</span>
            </div>
          </div>

          <a
            href={product.preview_url || `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME}.myshopify.com/products/${product.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            View on Shopify
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
