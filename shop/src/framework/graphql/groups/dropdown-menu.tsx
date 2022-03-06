import { GroupsMenu } from '@components/layouts/menu/groups-menu';
import useHomepage from '@framework/utils/use-homepage';
import { useGroupsQuery } from './groups.graphql';

type GroupsDropdownMenuType = {
  variant?: 'colored' | 'minimal';
};

const GroupsDropdownMenu = ({ variant }: GroupsDropdownMenuType) => {
  const { data } = useGroupsQuery();
  const { homePage } = useHomepage();
  return (
    <GroupsMenu
      groups={data?.types!}
      defaultGroup={homePage!}
      variant={variant}
    />
  );
};

export default GroupsDropdownMenu;
