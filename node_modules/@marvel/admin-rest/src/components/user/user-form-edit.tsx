import Button from "@components/ui/button";
import Input from "@components/ui/input";
import PasswordInput from "@components/ui/password-input";
import { useForm,Controller  } from "react-hook-form";
import Card from "@components/common/card";
import { useUpdateUserMutation } from "@data/user/use-user-update.mutation";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { customerValidationSchema } from "./user-validation-schema";
import { User, typeProvinsi,typeKabupaten,typeKecamatan, typeKelurahan} from "@ts-types/generated";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import ValidationError from "@components/ui/form-validation-error";
import { useProvinsiQuery } from "@data/wilayah/use-provinsi-query";
import { useKabupatenQuery } from "@data/wilayah/use-kabupaten-query";
import { useKecamatanQuery } from "@data/wilayah/use-kecamatan-query";
import { useKelurahanQuery } from "@data/wilayah/use-kelurahan-query";
import Label from "@components/ui/label";
import Select from "@components/ui/select/select";



type FormValues = {
  name: string;
  email: string;
  no_telp: string;
  password: string;
  kelurahan:typeKelurahan;
  provinsi:typeKelurahan;

};

const defaultValues = {
  email: "",
  password: "",
};





type IProps = {
  initialValues?: User | null;
};





const CustomerUpdateForm = ({initialValues}: IProps) => {
  const { t } = useTranslation();
  const { mutate: updateUser, isLoading: loading } = useUpdateUserMutation();

  
  

  const {
    register,
    control,
    setValue,
    handleSubmit,
    setError,

    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(customerValidationSchema),
    shouldUnregister: true,
     //@ts-ignore
    defaultValues: initialValues 
    
  });



  
  

  const [selectProv,setValueProv] = useState({
    id_prov:initialValues?.id_prov,
    nama:initialValues?.nama_provinsi
  });
  
  
  const [selectKab,setValueKab] = useState({
    id_kab:initialValues?.id_kab,
    nama:initialValues?.nama_kabupaten
  });
  
  
  const [selectKec,setValueKec] = useState({
    id_kec:initialValues?.id_kec,
    nama:initialValues?.nama_kecamatan
  });
  

  const [selectKel,setValueKel] = useState({
    id_kel:initialValues?.id_kel,
    nama:initialValues?.nama_kelurahan
  });
  
  

const { data : data_prov, isLoading: loading_prov } = useProvinsiQuery({

  limit: 200,
});

const { data : data_kab, isLoading: loading_kab } = useKabupatenQuery({
  text: selectProv.id_prov,
});

const { data : data_kec, isLoading: loading_kec } = useKecamatanQuery({
  text: selectKab.id_kab,
});

const { data : data_kel, isLoading: loading_kel } = useKelurahanQuery({
  text: selectKec.id_kec,
});


  


  function onChangeProv(id: any,nama: any){

    setValueProv({
      id_prov:id,
      nama:nama
    });

    setValueKab({
      id_kab:'',
      nama:''
    });

    
    setValueKec({
      id_kec:'',
      nama:''
    });

    setValueKel({
      id_kel:'',
      nama:''
    });


  }


  
  function onChangeKab(id: any,nama: any){

    setValueKab({
      id_kab:id,
      nama:nama
    });

    setValueKec({
      id_kec:'',
      nama:''
    });

    setValueKel({
      id_kel:'',
      nama:''
    });

  }
  

  
  function onChangeKec(id: any,nama: any){

    setValueKec({
      id_kec:id,
      nama:nama
    });

    setValueKel({
      id_kel:'',
      nama:''
    });

    setValueKel({
      id_kel:'',
      nama:''
    });


  }


  function onChangeKel(id : any,nama : any){

    setValueKel({
      id_kel:id,
      nama:nama
    });

    

  }




  
  async function onSubmit({ name, email, password, no_telp }: FormValues) {

    const id = initialValues?.id;
      
    let id_kel: string  = selectKel.id_kel!;
    
    

    updateUser(
      {
        variables: {
          id,
          name,
          email,
          password,
          no_telp,
          id_kel
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
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-wrap my-5 sm:my-8">
       

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={"Nama Pengguna"}
            {...register("name")}
            type="text"
            variant="outline"
            className="mb-4"
            error={t(errors.name?.message!)}
          />
          <Input
            label={"Email"}
            {...register("email")}
            type="email"
            variant="outline"
            className="mb-4"
            error={t(errors.email?.message!)}
          />

          <Input  
            label={"No Telp"}
            {...register("no_telp")}
            type="text"
            variant="outline"
            className="mb-4"
            error={t(errors.no_telp?.message!)}
          />

          <Input  
            label={"Password"}
            {...register("password")}
            type="password"
            variant="outline"
            className="mb-4"
            error={t(errors.password?.message!)}
          />


          <div className="mb-5">
                <Label>{"Provinsi"}*</Label>
                
                <Controller
                  name="provinsi"
                  control={control}
                  render={({ field }) =>
                    <Select
                    {...field} 
                      getOptionLabel={(option: any) => option.nama}
                      getOptionValue={(option: any) => option.id_prov}
                      options={data_prov?.data_provinsi}
                      isLoading={loading_prov}
                      value={selectProv.id_prov != '' ? selectProv : null}
                      onChange={(e: any)=> onChangeProv(e.id_prov,e.nama)}
                      />}
                />
                

           </div>

          
        
            <div className="mb-5">
                <Label>{"Kabupaten"}*</Label>
                
            

                <Select
                  name="kabupaten"
                  getOptionLabel={(option: any) => option.nama}
                  getOptionValue={(option: any) => option.id_kab}
                  options={data_kab?.data_kabupaten}
                  isLoading={loading_kab}
                  value={selectKab.id_kab != '' ? selectKab : null}
                  onChange={(e: any)=> onChangeKab(e.id_kab,e.nama)}
                 
                />
              
              </div>

         

            <div className="mb-5">
                <Label>{"Kecamatan"}*</Label>
               
                <Select
                  name="kecamatan"
                  getOptionLabel={(option: any) => option.nama}
                  getOptionValue={(option: any) => option.id_kec}
                  options={data_kec?.data_kecamatan}
                  isLoading={loading_kec}
                  value={selectKec.id_kec != '' ? selectKec : null}
                  onChange={(e: any)=> onChangeKec(e.id_kec,e.nama)}
                 
                />
               
            </div>



            <div className="mb-5">
                <Label>{"Kelurahan"}*</Label>
                

                <Select
                  name="kelurahan"
                  getOptionLabel={(option: any) => option.nama}
                  getOptionValue={(option: any) => option.id_kel}
                  options={data_kel?.data_kelurahan}
                  isLoading={loading_kel}
                  value={selectKel.id_kel != '' ? selectKel : null}
                  onChange={(e: any)=> onChangeKel(e.id_kel,e.nama)}
                 
                />
               
            </div>

            {/* <UserKabupatenInput control={control} setValue={setValue} /> */}
            {/* <UserKecamatanInput control={control} setValue={setValue} /> */}
          
              
          {/* <Card className="w-full sm:w-8/12 md:w-2/3">
              <UserKecamatanInput
                control={control}
                error={t((errors?.type as any)?.message)}
              />
          </Card> */}

        </Card> 

      </div>

      <div className="mb-4 text-start">
        <Button loading={loading} disabled={loading}>
          {'Update'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerUpdateForm;
