import React, { useRef, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";
import { useItem, updateItem, createItem } from "util/db";

function EditItemModal(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const cancelButtonRef = useRef(null);

  const { register, handleSubmit, errors } = useForm();

  // This will fetch item if props.id is defined
  // Otherwise query does nothing and we assume
  // we are creating a new item.
  const { data: itemData, status: itemStatus } = useItem(props.id);

  // If we are updating an existing item
  // don't show modal until item data is fetched.
  if (props.id && itemStatus !== "success") {
    return null;
  }

  const onSubmit = (data) => {
    setPending(true);

    const query = props.id
      ? updateItem(props.id, data)
      : createItem({ owner: auth.user.uid, ...data });

    query
      .then(() => {
        // Let parent know we're done so they can hide modal
        props.onDone();
      })
      .catch((error) => {
        // Hide pending indicator
        setPending(false);
        // Show error alert message
        setFormAlert({
          type: "error",
          message: error.message,
        });
      });
  };

  return (
    <Transition appear={true} show={true}>
      <Dialog
        as="div"
        className="overflow-y-auto fixed inset-0 z-10"
        onClose={() => props.onDone()}
      >
        <div className="px-4 min-h-screen text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />
          </Transition.Child>
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-md text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {props.id ? "Update" : "Create"} Item
              </Dialog.Title>
              <div className="mt-4">
                {formAlert && (
                  <div className="mb-4 text-red-600">{formAlert.message}</div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <input
                    className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1"
                    name="name"
                    type="text"
                    placeholder="Name"
                    defaultValue={itemData && itemData.name}
                    ref={register({
                      required: "Please enter a name",
                    })}
                  />

                  {errors.name && (
                    <p className="mt-1 text-sm text-left text-red-600">
                      {errors.name.message}
                    </p>
                  )}

                  <div className="mt-4">
                    <button
                      className="inline-flex justify-center py-2 px-4 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      type="button"
                      onClick={() => props.onDone()}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                    <button
                      className="inline-flex justify-center py-2 px-4 ml-3 text-sm font-medium text-white bg-blue-500 rounded-md border border-transparent hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      type="submit"
                      disabled={pending}
                    >
                      {pending ? "..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditItemModal;
