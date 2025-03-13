import RefreshProducts from "./components/RefreshProducts";
import RefreshOrders from "./components/RefreshOrders";
import SyncProducts from "./components/SyncProducts";
import SyncOrders from "./components/SyncOrders";
import GetProductsFromSupabase from "./components/GetProductsFromSupabase";
import GetOrdersFromSupabase from "./components/GetOrdersFromSupabase";

export default async function Page() {
  console.log("Initial data:", "");

  return (
    <>
      <div className="flex gap-2 p-4 pt-0">
        <RefreshProducts />
        <RefreshOrders />
        <SyncProducts />
        <SyncOrders />
        <GetProductsFromSupabase />
        <GetOrdersFromSupabase />
      </div>
      <span className="gap-2 p-4 pt-0">
        At the moment can view the console log for the data refresh confirmation
      </span>
      {/* display the data
      <div className="bg-slate-100 rounded-4xl h-[80vh] gap-2 m-4 p-4 pt-0">
        {JSON.stringify(initialData)}
      </div> */}
    </>
  );
}
