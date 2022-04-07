import Input from "@components/ui/input";
import TextArea from "@components/ui/text-area";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@components/ui/button";
import Description from "@components/ui/description";
import Card from "@components/common/card";
import Label from "@components/ui/label";
import Radio from "@components/ui/radio/radio";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import FileInput from "@components/ui/file-input";
import { productValidationSchema } from "./product-validation-schema";
import groupBy from "lodash/groupBy";
import ProductVariableForm from "./product-variable-form";
import ProductSimpleForm from "./product-simple-form";
import ProductGroupInput from "./product-group-input";
import ProductCategoryInput from "./product-category-input";
import orderBy from "lodash/orderBy";
import sum from "lodash/sum";
import cloneDeep from "lodash/cloneDeep";
import ProductTypeInput from "./product-type-input";
import {
  Type,
  ProductType,
  Category,
  AttachmentInput,
  ProductStatus,
  Product,
  VariationOption,
  Tag,
} from "@ts-types/generated";
import { useCreateProductMutation } from "@data/product/product-create.mutation";
import { useTranslation } from "next-i18next";
import { useUpdateProductMutation } from "@data/product/product-update.mutation";
import { useShopQuery } from "@data/shop/use-shop.query";
import ProductTagInput from "./product-tag-input";
import Alert from "@components/ui/alert";
import { useState } from "react";
import { animateScroll } from "react-scroll";
import Select from "@components/ui/select/select";
import { useTypesQuery } from "@data/type/use-types.query";
import { useCategoriesWhereParentQuery } from "@data/category/use-categories-where-parent";
import tag from "@repositories/tag";


type Variation = {
  formName: number;
};

type FormValues = {
  // sku: string;
  name: string;
  type: Type;
  product_type: ProductType;
  description: string;
  unit: string;
  price: number;
  min_price: number;
  max_price: number;
  sale_price: number;
  quantity: number;
  categories: Category[];
  tags: Tag[];
  in_stock: boolean;
  is_taxable: boolean;
  image: AttachmentInput;
  gallery: AttachmentInput[];
  status: ProductStatus;
  width: string;
  height: string;
  length: string;
  isVariation: boolean;
  variations: Variation[];
  variation_options: Product["variation_options"];
  [key: string]: any;
};
const defaultValues = {
  // sku: "",
  name: "",
  type: "",
  description: "",
  unit: "",
  price: "",
  sale_price: "",
  quantity: "",
  categories: [],
  tags: [],
  in_stock: true,
  is_taxable: false,
  image: [],
  gallery: [],
  status: ProductStatus.Publish,
  width: "",
  height: "",
  length: "",
  isVariation: false,
  variations: [],
  variation_options: [],
};

type IProps = {
  initialValues?: Product | null;
};


function getFormattedVariations(variations: any) {
  const variationGroup = groupBy(variations, "attribute.slug");
  return Object.values(variationGroup)?.map((vg) => {
    return {
      attribute: vg?.[0]?.attribute,
      value: vg?.map((v) => ({ id: v.id, value: v.value })),
    };
  });
}

function processOptions(options: any) {
  try {
    return JSON.parse(options);
  } catch (error) {
    return options;
  }
}

function calculateMaxMinPrice(variationOptions: any) {
  if (!variationOptions || !variationOptions.length) {
    return {
      min_price: null,
      max_price: null,
    };
  }
  const sortedVariationsByPrice = orderBy(variationOptions, ["price"]);
  const sortedVariationsBySalePrice = orderBy(variationOptions, ["sale_price"]);
  return {
    min_price:
      sortedVariationsBySalePrice?.[0].sale_price <
      sortedVariationsByPrice?.[0]?.price
        ? Number(sortedVariationsBySalePrice?.[0].sale_price)
        : Number(sortedVariationsByPrice?.[0]?.price),
    max_price: Number(
      sortedVariationsByPrice?.[sortedVariationsByPrice?.length - 1]?.price
    ),
  };
}

function calculateQuantity(variationOptions: any) {
  return sum(
    variationOptions?.map(({ quantity }: { quantity: number }) => quantity)
  );
}



export default function CreateOrUpdateProductForm({ initialValues }: IProps) {

  // console.log(initialValues)
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { t } = useTranslation();
  // const { data: shopData } = useShopQuery(router.query.shop as string, {
  //   enabled: !!router.query.shop,
  // });
  // const shopId = shopData?.shop?.id!;
  const methods = useForm<FormValues>({
    resolver: yupResolver(productValidationSchema),
    shouldUnregister: true,
    //@ts-ignore
    defaultValues: initialValues
      ? cloneDeep({
          ...initialValues,
          fileImage: {
            thumbnail: initialValues?.image?.thumbnail,
            original: initialValues?.image?.original,
            id: initialValues?.image?.id,
          },
           isVariation:
          initialValues.variations?.length &&
          initialValues.variation_options?.length
            ? true
            : false,
        variations: getFormattedVariations(initialValues?.variations),
          
        })
      : defaultValues,
  });


  

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = methods;


  
  const [selectTypes,setTypes] = useState({
    id:initialValues?.type.id,
    name:initialValues?.type.name
  });

  const [selectCategories,setParent] = useState({
    id:initialValues?.categories.id,
    name:initialValues?.categories.name
  });
  
  const { data : data_type, isLoading : loading_type } = useTypesQuery();

  const { data : data_categories, isLoading: loading_categories } = useCategoriesWhereParentQuery({
    text:  selectTypes?.id,
  });


  const { mutate: createProduct, isLoading: creating } =
    useCreateProductMutation();
  const { mutate: updateProduct, isLoading: updating } =
    useUpdateProductMutation();

  const onSubmit = async (values: FormValues) => {
    const { type } = values;

  
   

    const inputValues: any = {
      description: values.description,
      height: values.height,
      length: values.length,
      name: values.name,
      // sku: values.sku,
      status: values.status,
      unit: values.unit,
      width: values.width,
      quantity: values?.quantity,
      product_type: values.productTypeValue?.value,
      type_id: selectTypes.id,
      price: Number(values.price),
      sale_price: values.sale_price ? Number(values.sale_price) : null,
      categories: selectCategories.id,
      tags: values?.tags?.map(({ id }: any) => id),
      image: {
        thumbnail: values?.fileImage?.thumbnail,
        original: values?.fileImage?.original,
        id: values?.fileImage?.id,
      },
      gallery: values.gallery?.map(({ thumbnail, original, id }: any) => ({
        thumbnail,
        original,
        id,
      })),
      variation_options: {
        upsert: values?.variation_options?.map(
          ({ options, ...rest }: any) => ({
            ...rest,
            options: processOptions(options).map(
              ({ name, value }: VariationOption) => ({
                name,
                value,
              })
            ),
          })
        ),
        delete: initialValues?.variation_options
          ?.map((initialVariationOption) => {
            const find = values?.variation_options?.find(
              (variationOption) =>
                variationOption?.id === initialVariationOption?.id
            );
            if (!find) {
              return initialVariationOption?.id;
            }
          })
          .filter((item) => item !== undefined),
      },
      ...calculateMaxMinPrice(values?.variation_options),
    };

   

    if (initialValues) {
      updateProduct(
        {
          variables: {
            id: initialValues.id,
            input: inputValues,
          },
        },
        {
          onError: (error: any) => {
            Object.keys(error?.response?.data).forEach((field: any) => {
              setError(field, {
                type: "manual",
                message: error?.response?.data[field][0],
              });
            });
          },
        }
      );
    } else {

      createProduct(
        {
          ...inputValues,
        },
        {
          onError: (error: any) => {
            if (error?.response?.data?.message) {
              setErrorMessage(error?.response?.data?.message);
              animateScroll.scrollToTop();
            } else {
              Object.keys(error?.response?.data).forEach((field: any) => {
                setError(field, {
                  type: "manual",
                  message: error?.response?.data[field][0],
                });
              });
            }
          },
        }
      );
    }
  };
  // const productTypeValue = watch("productTypeValue");




  function onChangeGroup(id: any,name: any){    

    setParent({
      ...selectCategories,
      id:'',
      name:''
    });


 
  setTypes({
    ...selectTypes,
    id:id,
    name:name
  })

}


function onChangeParent(id: any,name:any){

  setParent({
    ...selectCategories,
    id:id,
    name:name
  });


}

  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
            <Description
              title={t("form:featured-image-title")}
              details={t("form:featured-image-help-text")}
              className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="fileImage" control={control} multiple={false} />
            </Card>
          </div>

          {/* <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
            <Description
              title={t("form:gallery-title")}
              details={t("form:gallery-help-text")}
              className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="gallery" control={control} />
            </Card>
          </div> */}

          <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
            <Description
              title={t("form:type-and-category")}
              details={t("form:type-and-category-help-text")}
              className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
                   
            <div className="mb-5">
              <Label>{t("form:input-label-group")}*</Label>
                <Select
                    getOptionLabel={(option: any) => option.name}
                    getOptionValue={(option: any) => option.id}
                    options={data_type?.types!}
                    value={selectTypes.id ? selectTypes:null}
                    isLoading={loading_type}
                    onChange={(e: any)=> onChangeGroup(e.id,e.name)}
                 />
            </div>

            <div className="mb-5">
              <Label>{t("form:input-label-categories")}</Label>

                <Select
                    getOptionLabel={(option: any) => option.name}
                    getOptionValue={(option: any) => option.id}
                    options={data_categories?.data_parent}
                    value={selectCategories.id ? selectCategories:null}
                    isClearable={true}
                    isLoading={loading_categories}
                    onChange={(e: any)=> onChangeParent(e.id,e.name)}
                  />  
            </div>


           
              {/* <ProductCategoryInput control={control} setValue={setValue} /> */}
              <ProductTagInput control={control} setValue={setValue} />
            </Card>
          </div>

          <div className="flex flex-wrap my-5 sm:my-8">
            <Description
              title={t("form:item-description")}
              details={`${
                initialValues
                  ? t("form:item-description-edit")
                  : t("form:item-description-add")
              } ${t("form:product-description-help-text")}`}
              className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <Input
                label={`${t("form:input-label-name")}*`}
                {...register("name")}
                error={t(errors.name?.message!)}
                variant="outline"
                className="mb-5"
              />

              <Input
                label={`${t("form:input-label-unit")}*`}
                {...register("unit")}
                error={t(errors.unit?.message!)}
                variant="outline"
                className="mb-5"
              />

              <TextArea
                label={t("form:input-label-description")}
                {...register("description")}
                error={t(errors.description?.message!)}
                variant="outline"
                className="mb-5"
              />

              <div>
                <Label>{t("form:input-label-status")}</Label>
                <Radio
                  {...register("status")}
                  label={t("form:input-label-published")}
                  id="published"
                  value="publish"
                  className="mb-2"
                />
                <Radio
                  {...register("status")}
                  id="draft"
                  label={t("form:input-label-draft")}
                  value="draft"
                />
              </div>
            </Card>
          </div>

      

          {/* Simple Type */}
          
          <ProductSimpleForm initialValues={initialValues} />

          {/* Variation Type */}
          
            <ProductVariableForm
              initialValues={initialValues}
            />
          
         


          <div className="mb-4 text-end">
            {initialValues && (
              <Button
                variant="outline"
                onClick={router.back}
                className="me-4"
                type="button"
              >
                {t("form:button-label-back")}
              </Button>
            )}
            <Button loading={updating || creating}>
              {initialValues
                ? t("form:button-label-update-product")
                : t("form:button-label-add-product")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
