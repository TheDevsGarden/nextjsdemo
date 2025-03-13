export const metadata = {
  title: "Products | jupiterconsulting",
  description: "Browse our collection of snowboards",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Products</h1>
      {children}
    </div>
  );
}
