import { GroupsMenu } from '@components/layouts/menu/groups-menu';
import useHomepage from '@framework/utils/use-homepage';
import { useGroupsQuery } from './groups.query';

interface Props {
  variant?: 'colored' | 'minimal';
}

const GroupsDropdownMenu = ({ variant }: Props) => {
  const { isLoading: loading, data, error } = useGroupsQuery();
  const { homePage } = useHomepage();

  return (
    <GroupsMenu
      groups={data?.types}
      defaultGroup={homePage}
      variant={variant}
    />
  );
};

export default GroupsDropdownMenu;
