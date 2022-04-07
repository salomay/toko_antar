import Input from "@components/ui/input";
import {
  Control,
  FieldErrors,
  useForm,
  useFormState,
  useWatch,
  Controller
} from "react-hook-form";
import Button from "@components/ui/button";
import TextArea from "@components/ui/text-area";
import Label from "@components/ui/label";
import Card from "@components/common/card";
import Description from "@components/ui/description";
import * as categoriesIcon from "@components/icons/category";
import { getIcon } from "@utils/get-icon";
import { useRouter } from "next/router";
import ValidationError from "@components/ui/form-validation-error";
import { useEffect, useState } from "react";
import { Category,parentCategories, categories, Type } from "@ts-types/generated";
import { useTypesQuery } from "@data/type/use-types.query";
import { useCategoriesWhereParentQuery } from "@data/category/use-categories-where-parent";
import { useParentCategoriesQuery } from "@data/category/use-parent-categories-query";
import { useUpdateCategoryMutation } from "@data/category/use-category-update.mutation";
import { useCreateCategoryMutation } from "@data/category/use-category-create.mutation";
import { categoryIcons } from "./category-icons";
import { useTranslation } from "next-i18next";
import FileInput from "@components/ui/file-input";
import SelectInput from "@components/ui/select-input";
import Select from "@components/ui/select/select";
import { yupResolver } from "@hookform/resolvers/yup";
import { categoryValidationSchema } from "./category-validation-schema";

export const updatedIcons = categoryIcons.map((item: any) => {
  item.label = (
    <div className="flex space-s-5 items-center">
      <span className="flex w-5 h-5 items-center justify-center">
        {getIcon({
          iconList: categoriesIcon,
          iconName: item.value,
          className: "max-h-full max-w-full",
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});




type FormValues = {
  name: string;
  details: string;
  fileImage: any;
  icon: any;
};

const defaultValues = {
  fileImage: [],
  name: "",
  details: "",
  icon: "",
};

type IProps = {
  initialValues?: Category | null;
};
export default function CreateOrUpdateCategoriesForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    setValue,

    formState: { errors },
  } = useForm<FormValues>({
    // shouldUnregister: true,
    //@ts-ignore
    defaultValues: initialValues ? {
      ...initialValues,
      fileImage:initialValues?.image,
      icon: initialValues?.icon
      ? categoryIcons.find(
          (singleIcon) => singleIcon.value === initialValues?.icon!
        )
      : "",
    } : defaultValues,
    resolver: yupResolver(categoryValidationSchema),
  });


  
  const [selectTypes,setTypes] = useState({
    id:initialValues?.type.id,
    name:initialValues?.type.name
  });

  const [selectParent,setParent] = useState({
    id:initialValues?.parent,
    name:initialValues?.parentName
  });
  
  const { data : data_type, isLoading : loading_type } = useTypesQuery();

  // const { data : data_parent, isLoading: loading_parent } = useParentCategoriesQuery({
  //   text:  selectParent?.id ,
  // });

  const { data : data_categories, isLoading: loading_categories } = useCategoriesWhereParentQuery({
    text:  selectTypes?.id,
  });

  const { mutate: createCategory, isLoading: creating } = useCreateCategoryMutation();
  const { mutate: updateCategory, isLoading: updating } = useUpdateCategoryMutation();

  


  
  function onChangeGroup(id: any,name: any){    

      setParent({
        ...selectParent,
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
      ...selectParent,
      id:id,
      name:name
    });
  

  }


  const onSubmit = async (values: FormValues) => {


    const input = {
      name: values.name,
      details: values.details,
      image: {
        thumbnail: values?.fileImage?.thumbnail,
        original: values?.fileImage?.original,
        id: values?.fileImage?.id,
      } || "",
      icon: values.icon?.value || "",
      parent: selectParent.id,
      type_id:selectTypes.id,
    };

    

    if (initialValues) {
      updateCategory({
        variables: {
          id: initialValues?.id,
          input: {
            ...input,
          },
        },
      });
    } else {
      createCategory({
        variables: {
          input,
        },
      });
    }
  };



  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap pb-8 border-b border-dashed border-border-base my-5 sm:my-8">
        <Description
          title={t("form:input-label-image")}
          details={t("form:category-image-helper-text")}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
        />
        <Card className="w-full sm:w-8/12 md:w-2/3">
          <FileInput name="fileImage" control={control} multiple={false} />
        </Card>
      </div>

      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t("form:input-label-description")}
          details={`${
            initialValues
              ? t("form:item-description-edit")
              : t("form:item-description-add")
          } ${t("form:category-description-helper-text")}`}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t("form:input-label-name")}
            {...register("name")}
            error={t(errors.name?.message!)}
            variant="outline"
            className="mb-5"
          />

          <TextArea
            label={t("form:input-label-details")}
            {...register("details")}
            variant="outline"
            className="mb-5"
          />

          <div className="mb-5">
            <Label>{t("form:input-label-select-icon")}</Label>
            <SelectInput
              name="icon"
              control={control}
              options={updatedIcons}
              isClearable={true}
            />
          </div>
          <div className="mb-5">
            <Label>{t("form:input-label-types")}</Label>
              
                  <Select
                    getOptionLabel={(option: any) => option.name}
                    getOptionValue={(option: any) => option.id}
                    options={data_type?.types!}
                    value={selectTypes.id ? selectTypes:null}
                    isLoading={loading_type}
                    onChange={(e: any)=> onChangeGroup(e.id,e.name)}
                 />
          
          </div>

          <div>
            <Label>{t("form:input-label-parent-category")}</Label>

         
                    <Select
                    getOptionLabel={(option: any) => option.name}
                    getOptionValue={(option: any) => option.id}
                    options={data_categories?.data_parent}
                    value={selectParent.id ? selectParent:null}
                    isClearable={true}
                    isLoading={loading_categories}
                    onChange={(e: any)=> onChangeParent(e.id,e.name)}
                  />  
          
          
          </div>
          {/* <SelectCategories control={control} setValue={setValue} /> */}
        </Card>
      </div>
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

        <Button loading={creating || updating}>
          {initialValues
            ? t("form:button-label-update-category")
            : t("form:button-label-add-category")}
        </Button>
      </div>
    </form>
  );
}
