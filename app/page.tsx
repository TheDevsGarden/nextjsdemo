import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <p className="text-4xl">Welcome to my product demo</p>
        <p>So this app does the following:</p>
        <ul>
          <li>
            <span className="font-bold">Fetch GraphQL Data</span> - Using
            GraphQL I get Orders and Products from Shopify. I created a next.js
            api route for each one.
          </li>
          <li>
            <span className="font-bold">
              Store Flattened GraphQL Data in Supabase
            </span>{" "}
            - I write the data into the database.
          </li>
          <li>
            <span className="font-bold">Dashboard</span> - Getting the data from
            Supabase, I chart it.
          </li>
          <li>
            <span className="font-bold">Products</span> - Using Supabase, I pull
            the products and display them.
          </li>
          <li>
            <span className="font-bold">Settings</span> - Left-over from
            testing, the buttons console log the outputs of api routes.
          </li>
        </ul>
        <p>
          The rest is visual - except the coffee button of course. If any
          questions, feel free to reach out -{" "}
          <span className="font-bold">iteratebelyaev@gmail.com</span>
        </p>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="mailto:iteratebelyaev@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Business Inquiries
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://ilyab.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to my website →
        </a>
      </footer>
    </div>
  );
}
