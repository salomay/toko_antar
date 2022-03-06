import Input from "@components/ui/input";
import { useFieldArray, useFormContext } from "react-hook-form";
import Button from "@components/ui/button";
import Description from "@components/ui/description";
import Card from "@components/common/card";
import Label from "@components/ui/label";
import Title from "@components/ui/title";

import Checkbox from "@components/ui/checkbox/checkbox";
import SelectInput from "@components/ui/select-input";
import { cartesian } from "@utils/cartesian";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { Product } from "@ts-types/generated";
import { useTranslation } from "next-i18next";
import { useAttributesQuery } from "@data/attributes/use-attributes.query";
import Select from "@components/ui/select/select";

type IProps = {
  initialValues?: Product | null;
  // shopId: string | undefined;
};

function filteredAttributes(attributes: any, variations: any) {
  let res = [];
  res = attributes?.filter((el: any) => {
    return !variations.find((element: any) => {
      return element?.attribute?.slug === el?.slug;
    });
  });
  return res;
}

function getCartesianProduct(values: any) {

  // console.log("TEST",values)

  // const formattedValues = values?.map((v: any) =>
  //     v.variation_options.options?.map((a: any) => ({ name: a.name, value: a.value })) 
  //     ).filter((i: any) => i !== undefined);
 
  // if (isEmpty(formattedValues)) return [];
  // var data = formattedValues;
  // console.log("CARTESIAN",formattedValues)
  // return formattedValues;
  return [];

}

function getVariationGroup(values: any) {

  // console.log("TEST",values)

  const formattedValues = values?.map((v: any) => ({name:v.attribute.name, id: v.id, value: v.value })
      );
 
  // if (isEmpty(formattedValues)) return [];
  // var data = formattedValues;
  // console.log("CARTESIAN",formattedValues)
  // return formattedValues;
  console.log("TEST",formattedValues.filter((x: any, index: any) => values.indexOf(x) !== index))
  return []; 

}

export default function ProductVariableForm({  initialValues }: IProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useAttributesQuery({
    // product_id: initialValues  ? initialValues?.id : '' ,
    product_id: '' ,
  });


  // const { data_attribute_value, isLoading_attribute_value } = useAttributesQuery({
  //   // product_id: initialValues  ? initialValues?.id : '' ,
  //   product_id: '' ,
  // });



  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  // This field array will keep all the attribute dropdown fields
  const { fields, append, remove } = useFieldArray({
    shouldUnregister: true,
    control,
    name: "variations",
  });

  

  
  const cartesianProduct = getCartesianProduct(fields);
  const variationGroup = getVariationGroup(fields);
  const variations = watch("variations");
  // var data_cartesian = [];
  // data_cartesian.push(cartesianProduct[0])

  const attributes = data?.attributes;
  // console.log("DATA",fields)
//   data_cartesian.map((v :any)=>{
//     console.log(v)
//   })


  // function onChangeAttributeValue(id: any,name: any,index: any){     

  // }

  // console.log("TEST",attributes);
  return (
    <div className="flex flex-wrap my-5 sm:my-8">
      <Description
        title={t("form:form-title-variation-product-info")}
        details={`${
          initialValues
            ? t("form:item-description-update")
            : t("form:item-description-choose")
        } ${t("form:form-description-variation-product-info")}`}
        className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
      />
      <Card className="w-full sm:w-8/12 md:w-2/3 p-0 md:p-0">
        <div className="border-t border-dashed border-border-200 mb-5 md:mb-8">
          <Title className="text-lg uppercase text-center px-5 md:px-8 mb-0 mt-8">
            {t("form:form-title-options")}
          </Title>
          <div>
            
            {fields?.map((field: any, index: number) => {


              return (
                <div
                  key={field.id}
                  className="border-b border-dashed border-border-200 last:border-0 p-5 md:p-8"
                  >
                  <div className="flex items-center justify-between">
                    <Title className="mb-0">
                      {t("form:form-title-options")} {index + 1}
                    </Title>
                    <button
                      onClick={() => remove(index)}
                      type="button"
                      className="text-sm text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                    >
                      {t("form:button-label-remove")}
                    </button>
                  </div>

                  <div className="grid grid-cols-fit gap-5">
                    <div className="mt-5">
                      <Label>{t("form:input-label-attribute-name")}*</Label>
                      <Select
                        name={`variations[${index}].attribute`}
                        defaultValue={field.attribute}
                        getOptionLabel={(option: any) => option.name}
                        getOptionValue={(option: any) => option.id}
                        options={attributes}
                        isLoading={isLoading}
                        // onChange={(e: any)=> onChangeAttributeValue(e.id,e.name,index)}
                      />
                    </div>

                    <div className="mt-5 col-span-2">
                      <Label>{t("form:input-label-attribute-value")}*</Label>
                      <Select
                        isMulti
                        name={`variations[${index}].value`}                        
                        // defaultValue={field.variation_options.options}
                        getOptionLabel={(option: any) => option.value}
                        getOptionValue={(option: any) => option.id}
                        options={
                          // watch(`variations[${index}].value`)?.
                          field.attribute.values
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
         

          <div className="px-5 md:px-8">
            <Button
              disabled={fields.length === attributes?.length}
              onClick={(e: any) => {
                e.preventDefault();
                append({ attribute: "", value: "",variations_options:"" });
              }}
              type="button"
            >
              {t("form:button-label-add-option")}
            </Button>
          </div>

          {/* Preview generation section start */}
        
           {/* {console.log(!!cartesianProduct?.length)}  */}
          {!!cartesianProduct?.length && (
            <div className="border-t border-dashed border-border-200 pt-5 md:pt-8 mt-5 md:mt-8">
              <Title className="text-lg uppercase text-center px-5 md:px-8 mb-0">
                {cartesianProduct?.length} {t("form:total-variation-added")}
              </Title>
              {cartesianProduct.map(
                (fieldAttributeValue: any, index: number) => {

                  console.log("DATANYA",fieldAttributeValue);
                  
                  return (
                    <div
                      key={`fieldAttributeValues-${index}`}
                      className="border-b last:border-0 border-dashed border-border-200 p-5 md:p-8 md:last:pb-0 mb-5 last:mb-8 mt-5"
                    >
                      
                      <Title className="!text-lg mb-8">
                        {t("form:form-title-variant")}:{" "}
                        <span className="text-blue-600 font-normal">
                          {Array.isArray(fieldAttributeValue)
                            ? fieldAttributeValue?.map((a) => a.value).join("/")
                            : fieldAttributeValue.value}
                        </span>
                      </Title>
                      <TitleAndOptionsInput
                        register={register}
                        setValue={setValue}
                        index={index}
                        fieldAttributeValue={fieldAttributeValue}
                      />

                      <input
                        {...register(`variations.${index}.variation_options.options.id`)}
                        type="hidden"
                      />


                      <div className="grid grid-c ols-2 gap-5">
                        <Input
                          label={`${t("form:input-label-price")}*`}
                          type="number"
                          {...register(`variations.${index}.variation_options.price`)}
                          error={t(
                            errors.variation_options?.[index]?.price?.message
                          )}
                          variant="outline"
                          className="mb-5"
                        />
                        <Input
                          label={t("form:input-label-sale-price")}
                          type="number"
                          {...register(`variations.${index}.variation_options.sale_price`)}
                          error={t(
                            errors.variation_options?.[index]?.sale_price
                              ?.message
                          )}
                          variant="outline"
                          className="mb-5"
                        />
                        <Input
                          label={`${t("form:input-label-sku")}*`}
                          {...register(`variations.${index}.variation_options.sku`)}
                          error={t(
                            errors.variation_options?.[index]?.sku?.message
                          )}
                          variant="outline"
                          className="mb-5"
                        />
                        <Input
                          label={`${t("form:input-label-quantity")}*`}
                          type="number"
                          {...register(`variations.${index}.variation_options.quantity`)}
                          error={t(
                            errors.variation_options?.[index]?.quantity?.message
                          )}
                          variant="outline"
                          className="mb-5"
                        />
                      </div>
                      <div className="mb-5 mt-5">
                        <Checkbox
                          {...register(`variations.${index}.variation_options.is_disable`)}
                          error={t(
                            errors.variation_options?.[index]?.is_disable
                              ?.message
                          )}
                          label={t("form:input-label-disable-variant")}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export const TitleAndOptionsInput = ({
  fieldAttributeValue,
  index,
  setValue,
  register,
}: any) => {
  const title = Array.isArray(fieldAttributeValue)
    ? fieldAttributeValue.map((a) => a.value).join("/")
    : fieldAttributeValue.value;
  const options = Array.isArray(fieldAttributeValue)
    ? JSON.stringify(fieldAttributeValue)
    : JSON.stringify([fieldAttributeValue]);
  useEffect(() => {
    setValue(`variation_options.${index}.title`, title);
    setValue(`variation_options.${index}.options`, options);
  }, [fieldAttributeValue]);
  return (
    <>
      <input {...register(`variation_options.${index}.title`)} type="hidden" />
      <input
        {...register(`variation_options.${index}.options`)}
        type="hidden"
      />
    </>
  );
};
