import { GroupResponse } from "../../../../types/group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faTrophy } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface GroupCardProps {
    group: GroupResponse;
}

const GroupCard = ({ group }: GroupCardProps) => {
    const { data: session } = useSession();
    const currentUser = session?.user?.id;
    const numericId = session?.user?.numericId;
    console.log("group", group);



    return (
        <Link href={`/groups/${group.id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 h-full">

                {/* Cover Image */}
                <div className="h-44 relative overflow-hidden">
                    <img
                        src={group.picture_url || `https://picsum.photos/seed/${group.id}/600/300`}
                        alt={group.name}
                        className="w-full h-full object-cover"
                    />

                    {/* Badge */}
                    <span
                        className={`absolute top-3 right-3 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md ${group.visibility === "public"
                            ? "bg-orange-50 text-orange-500 border border-orange-200"
                            : "bg-[#1b4583] text-white border border-[#1b4583]"
                            }`}
                    >
                        {group.visibility}

                    </span>
                </div>

                {/* Colored Divider Line */}
                <div
                    className={`h-[3px] ${group.visibility === "public"
                        ? "bg-orange-400"
                        : "bg-[#1b4583]"
                        }`}
                />

                {/* Content */}
                <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                        {group.name}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">
                        {group.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5" title="Members">
                                <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-xs" />
                                {group.group_members_count}
                            </span>
                            {/* Note: contestsCount is not in GroupResponse yet, using placeholder or omitting */}
                            <span className="flex items-center gap-1.5" title="Contests">
                                <FontAwesomeIcon icon={faTrophy} className="text-gray-400 text-xs" />
                                0 Contests
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">
                            leader: <strong className="text-gray-600 font-semibold">{group.owner_id === numericId ? "You" : group.owner_handle}</strong>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default GroupCard;
