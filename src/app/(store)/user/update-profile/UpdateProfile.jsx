"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

//internal import

import Label from "@components/form/Label";
import Error from "@components/form/Error";
import useCustomToast from "@hooks/useCustomToast";
import ErrorTwo from "@components/form/ErrorTwo";
import { getUserSession } from "@lib/auth-client";
import InputAreaTwo from "@components/form/InputAreaTwo";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CloudinaryUploader from "@components/admin/CloudinaryUploader";
import SubmitButton from "@components/user-dashboard/SubmitButton";
import { updateCustomer } from "@services/ServerActionServices";

const UpdateProfile = ({ storeCustomizationSetting }) => {
  const [imageUrl, setImageUrl] = useState("");
  const { showingTranslateValue } = useUtilsFunction();
  const userInfo = getUserSession();
  const { data: session, update } = useSession();
  
  // State to store fresh customer data from database
  const [customerData, setCustomerData] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);

  const [state, formAction] = useActionState(
    updateCustomer.bind(null, userInfo),
    undefined
  );

  // Fetch fresh customer data from database
  useEffect(() => {
    const fetchCustomerData = async () => {
      const customerId = userInfo?.id || userInfo?._id;
      if (!customerId) {
        setIsLoadingCustomer(false);
        return;
      }

      try {
        const { baseURL } = await import("@services/CommonService");
        const token = userInfo?.token;

        const response = await fetch(`${baseURL}/customer/${customerId}`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const customer = await response.json();
          setCustomerData(customer);
        }
      } catch (err) {
        console.error("[UpdateProfile] Failed to fetch customer data:", err);
      } finally {
        setIsLoadingCustomer(false);
      }
    };

    fetchCustomerData();
  }, [userInfo?.id, userInfo?._id]);

  // Use customer data from database if available, otherwise fall back to userInfo from cookie
  const displayUserInfo = customerData || userInfo;
  
  // Extract address: prefer customer.address, fallback to shippingAddress.address
  const displayAddress = customerData?.address || customerData?.shippingAddress?.address || userInfo?.address || "";

  const defaultImg = imageUrl ? imageUrl : displayUserInfo?.image;

  const { formRef } = useCustomToast(state);

  // Sync imageUrl with hidden form field
  useEffect(() => {
    if (formRef?.current && imageUrl) {
      const imageUrlInput = formRef.current.querySelector('input[name="imageUrl"]');
      if (imageUrlInput) {
        imageUrlInput.value = imageUrl;
      }
    }
  }, [imageUrl, formRef]);

  // console.log("data", session);

  useEffect(() => {
    if (state?.user) {
      // console.log("update session");
      update({
        ...session,
        user: {
          ...session.user,
          name: state.user.name,
          address: state.user.address,
          phone: state.user.phone,
          image: state.user.image,
        },
      });
      // Update imageUrl state when profile is successfully updated
      if (state.user.image) {
        setImageUrl(state.user.image);
      }
      
      // Update userInfo cookie with fresh data
      const updatedUserInfo = {
        ...userInfo,
        name: state.user.name,
        address: state.user.address,
        phone: state.user.phone,
        image: state.user.image,
        email: state.user.email || userInfo?.email,
      };
      
      Cookies.set("userInfo", JSON.stringify(updatedUserInfo), { expires: 30 });
      
      // Dispatch custom event to notify components (like ProfileDropDown) to refresh
      window.dispatchEvent(new Event('profileUpdated'));
      
      formRef?.current?.reset();
    }
  }, [state?.user, update, session, formRef, setImageUrl, userInfo]);

  return (
    <>
      <div className="max-w-screen-2xl">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h2 className="text-xl font-semibold mb-5">
                {showingTranslateValue(
                  storeCustomizationSetting?.dashboard?.update_profile
                )}
              </h2>
            </div>
          </div>
        </div>
        <form ref={formRef} action={formAction}>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="bg-white shadow sm:rounded-lg py-4 px-2">
              <div className="space-y-6">
                <div>
                  <Label label="Photo" />
                  <div>
                    <div className="mt-1">
                      <CloudinaryUploader
                        imageUrl={defaultImg || ""}
                        setImageUrl={setImageUrl}
                        multiple={false}
                        maxFiles={1}
                      />
                    </div>
                    <ErrorTwo errors={state?.errors?.image} />
                  </div>

                  {/* passing image url to submit form */}
                  <div className="form-group hidden">
                    <InputAreaTwo
                      label="imageUrl"
                      name="imageUrl"
                      type="text"
                      defaultValue={imageUrl || defaultImg || ""}
                      placeholder="imageUrl"
                      readOnly={true}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 sm:mt-0">
                <div className="md:grid-cols-6 md:gap-6">
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="lg:mt-6 mt-4">
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-3">
                          <InputAreaTwo
                            // register={register}
                            label={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.full_name
                            )}
                            name="name"
                            type="text"
                            placeholder={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.full_name
                            )}
                            defaultValue={displayUserInfo?.name || ""}
                          />

                          <Error errorName={state?.errors?.name?.join(" ")} />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <InputAreaTwo
                            // register={register}
                            label={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.address
                            )}
                            name="address"
                            type="text"
                            placeholder={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.address
                            )}
                            defaultValue={displayAddress}
                          />

                          <Error
                            errorName={state?.errors?.address?.join(" ")}
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <InputAreaTwo
                            // register={register}
                            label={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.user_phone
                            )}
                            name="phone"
                            type="tel"
                            placeholder={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.user_phone
                            )}
                            defaultValue={displayUserInfo?.phone || ""}
                          />

                          <ErrorTwo errors={state?.errors?.phone} />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <InputAreaTwo
                            // register={register}
                            readOnly={true}
                            name="email"
                            type="email"
                            defaultValue={displayUserInfo?.email}
                            label={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.user_email
                            )}
                            placeholder={showingTranslateValue(
                              storeCustomizationSetting?.dashboard?.user_email
                            )}
                          />
                          {/* <Error errorName={errors.email} /> */}
                          <Error errorName={state?.errors?.email?.join(" ")} />
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-3 mt-5 text-right">
                        <SubmitButton
                          title={showingTranslateValue(
                            storeCustomizationSetting?.dashboard?.update_button
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateProfile;
