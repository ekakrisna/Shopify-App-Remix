import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  await authenticate.admin(request);
  const apiKey = process.env.SHOPIFY_API_KEY
  const functionId = process.env.SHOPIFY_DELIVERY_CUSTOMIZATION_ID
  return json({ apiKey, functionId });
}
export default function App() {
  const { apiKey, functionId } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/qrcodes">Qrcodes</Link>
        <Link to="/app/hubs">Hubs</Link>
        <Link to="/app/locations">Locations</Link>
        <Link to={`/app/delivery-customization/${functionId}`}>Delivery</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
