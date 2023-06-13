import {
  useQuery,
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from "react-query";
import supabase from "./supabase";

// React Query client
const client = new QueryClient();

/**** USERS ****/

// Fetch user data
// Note: This is called automatically in `auth.js` and data is merged into `auth.user`
export function useUser(uid) {
  // Manage data fetching with React Query: https://react-query.tanstack.com/overview
  return useQuery(
    // Unique query key: https://react-query.tanstack.com/guides/query-keys
    ["user", { uid }],
    // Query function that fetches data
    () =>
      supabase
        .from("users")
        .select(`*, customers ( * )`)
        .eq("id", uid)
        .single()
        .then(handle),
    // Only call query function if we have a `uid`
    { enabled: !!uid }
  );
}

// Fetch user data (non-hook)
// Useful if you need to fetch data from outside of a component
export function getUser(uid) {
  return supabase
    .from("users")
    .select(`*, customers ( * )`)
    .eq("id", uid)
    .single()
    .then(handle);
}

// Update an existing user
export async function updateUser(uid, data) {
  const response = await supabase
    .from("users")
    .update(data)
    .eq("id", uid)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(["user", { uid }]);
  return response;
}

/**** ITEMS ****/
/* Example query functions (modify to your needs) */

// Fetch item data
export function useItem(id) {
  return useQuery(
    ["item", { id }],
    () => supabase.from("items").select().eq("id", id).single().then(handle),
    { enabled: !!id }
  );
}

// Fetch all items by owner
export function useItemsByOwner(owner) {
  return useQuery(
    ["items", { owner }],
    () =>
      supabase
        .from("items")
        .select()
        .eq("owner", owner)
        .order("createdAt", { ascending: false })
        .then(handle),
    { enabled: !!owner }
  );
}

// Create a new item
export async function createItem(data) {
  const response = await supabase.from("items").insert([data]).then(handle);
  // Invalidate and refetch queries that could have old data
  await client.invalidateQueries(["items"]);
  return response;
}

// Update an item
export async function updateItem(id, data) {
  const response = await supabase
    .from("items")
    .update(data)
    .eq("id", id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(["item", { id }]),
    client.invalidateQueries(["items"]),
  ]);
  return response;
}

// Delete an item
export async function deleteItem(id) {
  const response = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .then(handle);
  // Invalidate and refetch queries that could have old data
  await Promise.all([
    client.invalidateQueries(["item", { id }]),
    client.invalidateQueries(["items"]),
  ]);
  return response;
}

/**** HELPERS ****/

// Get response data or throw error if there is one
function handle(response) {
  if (response.error) throw response.error;
  return response.data;
}

// React Query context provider that wraps our app
export function QueryClientProvider(props) {
  return (
    <QueryClientProviderBase client={client}>
      {props.children}
    </QueryClientProviderBase>
  );
}
