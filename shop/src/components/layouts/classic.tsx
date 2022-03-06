import Banner from '@framework/app/banner';
import PromotionSliders from '@framework/app/promotions';
// import CategoriesWithProducts from '@framework/categories-with-products/categories-with-products';
import Categories from '@framework/categories/categories';
import Products from '@framework/products/products';
import { Element } from 'react-scroll';
import FilterBar from './filter-bar';

const Classic = () => {
  return (
    <>
      <Banner layout="classic" />
      <PromotionSliders />
      <FilterBar />
      <Element
        name="grid"
        className="flex flex-1 border-t border-solid border-border-200 border-opacity-70"
      >
        <Categories layout="classic" />
        <Products />
      </Element>
      {/* <CategoriesWithProducts /> */}
    </>
  );
};

export default Classic;
