import { typeKabupaten } from "@ts-types/generated";
import Base from "./base";

class Kabupaten extends Base<typeKabupaten, typeKabupaten> {
  fetchParent = async (url: string) => {
    return this.http(url, "get");
  };
}

export default new Kabupaten();
