import cn from 'classnames';
import { Image } from '@components/ui/image';
import { productPlaceholder } from '@lib/placeholders';

interface BreadcrumbButtonProps {
  text: string;
  image?: any;
  onClick: () => void;
}

const BreadcrumbButton: React.FC<BreadcrumbButtonProps> = ({
  text,
  image,
  onClick,
}) => (
  <button
    className={cn(
      'h-14 px-7 text-base font-semibold text-heading bg-light relative rounded-lg transition-shadow shadow-downfall-xs hover:shadow-downfall-sm',
      {
        'pe-24': image,
      }
    )}
    onClick={onClick}
  >
    <span className="whitespace-nowrap">{text}</span>
    {image && (
      <span className="absolute bottom-0 end-0 w-14 h-full rounded-lg rounded-s-none overflow-hidden">
        <Image
          className="w-full h-full"
          src={image ?? productPlaceholder}
          alt={text ?? ''}
          layout="responsive"
          width={60}
          height={60}
        />
      </span>
    )}
  </button>
);

export default BreadcrumbButton;
