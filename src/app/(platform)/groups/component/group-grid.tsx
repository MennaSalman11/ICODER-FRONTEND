import { GroupResponse } from "../../../../types/group";
import GroupCard from "./group-card";

interface GroupsGridProps {
  groups: GroupResponse[];
}

const GroupsGrid = ({ groups }: GroupsGridProps) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.length > 0 ? (
        groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))
      ) : (
        <div className="col-span-full text-center py-10 text-gray-500">
          No groups found.
        </div>
      )}
    </div>
  );
};

export default GroupsGrid;
