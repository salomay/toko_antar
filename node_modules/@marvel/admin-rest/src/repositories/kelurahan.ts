import { typeKelurahan } from "@ts-types/generated";
import Base from "./base";

class Kelurahan extends Base<typeKelurahan, typeKelurahan> {
  fetchParent = async (url: string) => {
    return this.http(url, "get");
  };
}

export default new Kelurahan();
