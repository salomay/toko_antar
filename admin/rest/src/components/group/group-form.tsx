import Input from "@components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import Button from "@components/ui/button";
import Description from "@components/ui/description";
import Card from "@components/common/card";
import { useRouter } from "next/router";
import { getIcon } from "@utils/get-icon";
import Label from "@components/ui/label";
import * as typeIcons from "@components/icons/type";
import { AttachmentInput, Type, TypeSettingsInput } from "@ts-types/generated";
import { useCreateTypeMutation } from "@data/type/use-type-create.mutation";
import { useUpdateTypeMutation } from "@data/type/use-type-update.mutation";
import { typeIconList } from "./group-icons";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { typeValidationSchema } from "./group-validation-schema";
import SelectInput from "@components/ui/select-input";
import FileInput from "@components/ui/file-input";
import Title from "@components/ui/title";
import Alert from "@components/ui/alert";
import TextArea from "@components/ui/text-area";
import RadioCard from "@components/ui/radio-card/radio-card";
import Checkbox from "@components/ui/checkbox/checkbox";

export const updatedIcons = typeIconList.map((item: any) => {
  item.label = (
    <div className="flex space-s-5 items-center">
      <span className="flex w-5 h-5 items-center justify-center">
        {getIcon({
          iconList: typeIcons,
          iconName: item.value,
          className: "max-h-full max-w-full",
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});


type BannerInput = {
  title: string;
  description: string;
  image: AttachmentInput;
};

type FormValues = {
  name?: string | null;
  icon?: any;
  promotional_sliders: AttachmentInput[];
  banners: BannerInput[];
  settings: TypeSettingsInput;
};

type IProps = {
  initialValues?: Type | null;
};
export default function CreateOrUpdateTypeForm({ initialValues }: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    resolver: yupResolver(typeValidationSchema),
    // @ts-ignore
    defaultValues: {
      ...initialValues,
      icon: initialValues?.icon
        ? typeIconList.find(
            (singleIcon) => singleIcon.value === initialValues?.icon
          )
        : "",
    },
  });

 

  const { mutate: createType, isLoading: creating } = useCreateTypeMutation();
  const { mutate: updateType, isLoading: updating } = useUpdateTypeMutation();
  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name!,
      icon: values.icon?.value,
    };
    if (!initialValues) {
      createType({
        variables: {
          input,
        },
      });
    } else {
      updateType({
        variables: {
          id: initialValues.id!,
          input,
        },
      });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t("form:item-description")}
          details={`${
            initialValues
              ? t("form:item-description-update")
              : t("form:item-description-add")
          } ${t("form:type-description-help-text")}`}
          className="w-full px-0 sm:pe-4 md:pe-5 pb-5 sm:w-4/12 md:w-1/3 sm:py-8"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t("form:input-label-name")}
            {...register("name")}
            error={t(errors.name?.message!)}
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
            ? t("form:button-label-update-group")
            : t("form:button-label-add-group")}
        </Button>
      </div>
    </form>
  );
}