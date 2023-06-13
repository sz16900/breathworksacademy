import React, { useState } from "react";
import EditItemModal from "components/EditItemModal";
import { useAuth } from "util/auth";
import { updateItem, deleteItem, useItemsByOwner } from "util/db";

function DashboardItems(props) {
  const auth = useAuth();

  const {
    data: items,
    status: itemsStatus,
    error: itemsError,
  } = useItemsByOwner(auth.user.uid);

  const [creatingItem, setCreatingItem] = useState(false);

  const [updatingItemId, setUpdatingItemId] = useState(null);

  const itemsAreEmpty = !items || items.length === 0;

  const canUseStar =
    auth.user.planIsActive &&
    (auth.user.planId === "pro" || auth.user.planId === "business");

  const handleStarItem = (item) => {
    if (canUseStar) {
      updateItem(item.id, { featured: !item.featured });
    } else {
      alert("You must upgrade to the pro or business plan to use this feature");
    }
  };

  return (
    <>
      {itemsError && (
        <div className="mb-4 text-red-600">{itemsError.message}</div>
      )}

      <div>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-xl">Items</span>
          <button
            className="py-2 px-4 bg-gray-200 rounded border-0 hover:bg-gray-300 focus:outline-none"
            onClick={() => setCreatingItem(true)}
          >
            Add Item
          </button>
        </div>

        {(itemsStatus === "loading" || itemsAreEmpty) && (
          <div className="p-8">
            {itemsStatus === "loading" && <>Loading...</>}

            {itemsStatus !== "loading" && itemsAreEmpty && (
              <>Nothing yet. Click the button to add your first item.</>
            )}
          </div>
        )}

        {itemsStatus !== "loading" && items && items.length > 0 && (
          <>
            {items.map((item, index) => (
              <div
                className={
                  "flex p-4 border-b border-gray-200" +
                  (item.featured ? " bg-gray-100" : "")
                }
                key={index}
              >
                {item.name}
                <div className="ml-auto space-x-2">
                  <button
                    className="text-blue-600"
                    onClick={() => handleStarItem(item)}
                  >
                    {item.featured ? "unstar" : "star"}
                  </button>
                  <button
                    className="text-blue-600"
                    onClick={() => setUpdatingItemId(item.id)}
                  >
                    edit
                  </button>
                  <button
                    className="text-blue-600"
                    onClick={() => deleteItem(item.id)}
                  >
                    delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {creatingItem && <EditItemModal onDone={() => setCreatingItem(false)} />}

      {updatingItemId && (
        <EditItemModal
          id={updatingItemId}
          onDone={() => setUpdatingItemId(null)}
        />
      )}
    </>
  );
}

export default DashboardItems;
