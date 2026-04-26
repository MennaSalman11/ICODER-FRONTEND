"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrophy,
    faPenToSquare,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { group } from "console";
import { useSession } from "next-auth/react";
import { GroupMemberResponse } from "@/src/types/group";





interface GroupActionButtonsProps {
    group: {
        id: string;
        name: string;
        description: string;
        isPublic: boolean;
        joinPolicy: string;
        membersCount: number;
        createdAt: string;
        owner_id: string;
        code: string;
        leader: string;
        numericId: string;
        picture: string | null;
        contest_coordinator_type: string;

    };
    members: GroupMemberResponse[];
    onArrangeContest?: () => void;
    onUpdateGroup?: () => void;
    onInviteMembers?: () => void;
}


const GroupActionButtons = ({
    members,
    group,
    onArrangeContest,
    onUpdateGroup,
    onInviteMembers,
}: GroupActionButtonsProps) => {

    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const numericId = session?.user?.numericId;
    const isLeader = String(numericId) === String(group.owner_id);

    // Role values from API are lowercase: "owner" | "manager" | "member"
    const isManager = members.some((m) => m.role === "manager" && String(m.user_id) === String(numericId));
    const isMember = members.some((m) => m.role === "member" && String(m.user_id) === String(numericId));

    const contestCoordinatorType = group.contest_coordinator_type;

    // leader       → only the group leader
    // leader_manager → leader OR any manager
    // ALL_MEMBERS  → everyone (leader, manager, or regular member)
  const canArrangeContest =
    isLeader || 
    (contestCoordinatorType === "leader_manager" && isManager) ||
    (contestCoordinatorType === "all_members");



    return (
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
            {/* Arrange Contest */}
            {(canArrangeContest) && (
                <button
                    onClick={onArrangeContest}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1b4583] text-white rounded-lg text-sm font-semibold hover:bg-[#163a6e] transition-colors cursor-pointer"
                >
                    <FontAwesomeIcon icon={faTrophy} className="text-sm" />
                    Arrange Contest
                </button>
            )}

            {/* Update Group */}
            {(isLeader) && (
                <button
                    onClick={onUpdateGroup}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-sm text-gray-500" />
                    Update Group
                </button>
            )}

            {/* Invite Members */}
            <button

                onClick={onInviteMembers}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
                <FontAwesomeIcon icon={faEnvelope} className="text-sm text-gray-500" />
                Invite Members
            </button>

        </div>
    );
};

export default GroupActionButtons;
