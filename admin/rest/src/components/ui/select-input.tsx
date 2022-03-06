import Select from "@components/ui/select/select";
import { useEffect,useState } from "react";
import { Controller } from "react-hook-form";

interface SelectInputProps {
  control: any;
  rules?: any;
  name: string;
  options: object[];
  // defaultValue : {id:string,nama:string};
  [key: string]: unknown;
  // onChange:any;
}

const SelectInput = ({
  control,
  options,
  name,
  rules,
  getOptionLabel,
  getOptionValue,
  isMulti,
  isClearable,
  isLoading,
  // defaultValue,
  // onChange,
  ...rest
}: SelectInputProps) => {

  
  // {console.log("Pronvinsi",options)} 

  return (
   
    <Controller
      control={control}
      name={name}
      rules={rules}
      
      {...rest}
      render={({ field }) => ( 
               
        <Select
          {...field}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          isMulti={isMulti}
          isClearable={isClearable}
          isLoading={isLoading}
          options={options}
          // value={defaultValue}
          // onChange={onchange}
           
         
        />
      )}
    />
    
  );
};

export default SelectInput;
