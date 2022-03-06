import { typeKecamatan } from "@ts-types/generated";
import Base from "./base";

class Kecamatan extends Base<typeKecamatan, typeKecamatan> {
  fetchParent = async (url: string) => {
    return this.http(url, "get");
  };
}

export default new Kecamatan();
