import SearchBox from '@components/ui/search/search-box';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import AutoSuggestionBox from '@framework/suggestions/suggestion';
import cn from 'classnames';

interface Props {
  label: string;
  className?: string;
  variant?: 'minimal' | 'normal' | 'with-shadow';
  [key: string]: unknown;
}

const SearchWithSuggestion: React.FC<Props> = ({
  label,
  className,
  variant,
  ...props
}) => {
  const { t } = useTranslation();
  const [searchTerm, updateSearchTerm] = useState('');

  const handleOnChange = (e: any) => {
    const { value: inputValue } = e.target;
    updateSearchTerm(inputValue);
  };

  const onSearch = (e: any) => {
    e.preventDefault();
    if (!searchTerm) return;
  };

  function clearSearch() {
    updateSearchTerm('');
  }

  return (
    <div className={cn('w-full relative', className)}>
      <SearchBox
        label={label}
        onSubmit={onSearch}
        onClearSearch={clearSearch}
        onChange={handleOnChange}
        value={searchTerm}
        name="search"
        placeholder={t('common:text-search-placeholder-minimal')}
        variant={variant}
        {...props}
      />

      <AutoSuggestionBox
        searchQuery={searchTerm}
        visible={Boolean(searchTerm.length > 2)}
      />
    </div>
  );
};

export default SearchWithSuggestion;
