"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  shopify_id: string;
  product_name: string;
  image_url: string;
  image_alt_text: string;
  min_price: number;
  max_price: number;
  currency: string;
  vendor: string;
  product_type: string;
  total_inventory: number;
  status: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  return (
    <div className="flex justify-center mt-8 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  const fetchProducts = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/dbGetProductData?page=${pageNum}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [page, limit, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price);
  };

  if (loading && products.length === 0) {
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
        <button
          onClick={() => fetchProducts(page)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            href={`/products/${encodeURIComponent(product.shopify_id)}`}
            key={product.shopify_id}
            className="group"
          >
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.image_alt_text || product.product_name}
                    width={500}
                    height={500}
                    className="object-cover object-center h-48 w-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-lg font-medium mb-1 truncate">
                  {product.product_name}
                </h2>
                <p className="text-sm text-gray-500 mb-2">{product.vendor}</p>

                <div className="flex justify-between items-center">
                  <p className="font-medium ">
                    {product.min_price === product.max_price
                      ? formatPrice(product.min_price, product.currency)
                      : `${formatPrice(
                          product.min_price,
                          product.currency
                        )} - ${formatPrice(
                          product.max_price,
                          product.currency
                        )}`}
                  </p>

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.total_inventory > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.total_inventory > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
