"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faUserPlus,
    faUserMinus,
    faTrashCan,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import RemoveMemberModal from "./remove-member-modal";
import { groupService } from "@/src/lib/services/group-service";
import { toast } from "sonner";

type MemberRole = "owner" | "manager" | "member";

interface Member {
    id: string;
    role: MemberRole;
    nickname: string;
    username: string;
    joinedAt: string;
}

interface GroupMembersTableProps {
    members: Member[];
    totalCount: number;
    isLeader: boolean;
    groupId: number;
    onMemberPromoted?: () => void;
    onMemberDemoted?: () => void;
    onMemberRemoved?: () => void;
}

const roleStyles: Record<MemberRole, string> = {
    owner: "bg-orange-100 text-orange-600 border border-orange-200",
    manager: "bg-blue-100 text-blue-700 border border-blue-200",
    member: "bg-gray-100 text-gray-600 border border-gray-200",
};

const GroupMembersTable = ({
    members,
    totalCount,
    isLeader,
    groupId,
    onMemberPromoted,
    onMemberDemoted,
    onMemberRemoved,
}: GroupMembersTableProps) => {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    // State for the remove member modal
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<{ handle: string; nickname: string } | null>(null);

    // State for promote/demote loading (tracks the member ID currently being processed)
    const [promotingMemberId, setPromotingMemberId] = useState<string | null>(null);
    const [demotingMemberId, setDemotingMemberId] = useState<string | null>(null);

    const isActionPending = (memberId: string) => promotingMemberId === memberId || demotingMemberId === memberId;

    const handleRemoveClick = (member: Member) => {
        setSelectedMember({ handle: member.username, nickname: member.nickname });
        setIsRemoveModalOpen(true);
    };

    const handleRemoveSuccess = () => {
        setSelectedMember(null);
        onMemberRemoved?.();
    };

    const handlePromote = async (member: Member) => {
        setPromotingMemberId(member.id);
        try {
            await groupService.promoteMember(member.username, groupId);
            toast.success(`"${member.nickname}" has been promoted to Manager!`);
            onMemberPromoted?.();
        } catch (error: any) {
            console.error("Failed to promote member:", error);
            const errorMessage = error?.response?.data?.message || "Failed to promote member. Please try again.";
            toast.error(errorMessage);
        } finally {
            setPromotingMemberId(null);
        }
    };

    const handleDemote = async (member: Member) => {
        setDemotingMemberId(member.id);
        try {
            await groupService.demoteMember(member.username, groupId);
            toast.success(`"${member.nickname}" has been demoted to Member.`);
            onMemberDemoted?.();
        } catch (error: any) {
            console.error("Failed to demote member:", error);
            const errorMessage = error?.response?.data?.message || "Failed to demote member. Please try again.";
            toast.error(errorMessage);
        } finally {
            setDemotingMemberId(null);
        }
    };

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                            icon={faUsers}
                            className="text-gray-700 text-base"
                        />
                        <h2 className="text-base font-bold text-gray-800">
                            Members
                        </h2>
                    </div>
                    <span className="text-sm text-gray-500">
                        {totalCount} members total
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm md:text-base md:px-5 md:py-3 sm:px-2 sm:py-2">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                    Role
                                </th>
                                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                    Nickname
                                </th>
                                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                    Username
                                </th>
                                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                    Joined
                                </th>
                                {isLeader && (
                                    <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isLeader ? 5 : 4}
                                        className="text-center py-8 text-gray-400 text-sm"
                                    >
                                        No members found.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                    >
                                        {/* Role Badge */}
                                        <td className="px-5 py-3">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${roleStyles[member.role]}`}
                                            >
                                                {member.role}
                                            </span>
                                        </td>

                                        {/* Nickname */}
                                        <td className="px-5 py-3 font-medium text-gray-800">
                                            {member.nickname}
                                        </td>

                                        {/* Username */}
                                        <td className="px-5 py-3 text-gray-500">
                                            @{member.username}
                                        </td>

                                        {/* Joined Date */}
                                        <td className="px-5 py-3 text-gray-400">
                                            {member.joinedAt}
                                        </td>

                                        {/* Actions (leader only, not for self) */}
                                        {isLeader && (member.username !== currentUserId) && (
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Promote button — only for members */}
                                                    {member.role === "member" && (
                                                        <button
                                                            onClick={() => handlePromote(member)}
                                                            disabled={isActionPending(member.id)}
                                                            title="Promote to Manager"
                                                            className="text-gray-400 hover:text-[#1b4583] transition-colors cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={promotingMemberId === member.id ? faSpinner : faUserPlus}
                                                                className={`text-sm ${promotingMemberId === member.id ? "animate-spin" : ""}`}
                                                            />
                                                        </button>
                                                    )}
                                                    {/* Demote button — only for managers */}
                                                    {member.role === "manager" && (
                                                        <button
                                                            onClick={() => handleDemote(member)}
                                                            disabled={isActionPending(member.id)}
                                                            title="Demote to Member"
                                                            className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={demotingMemberId === member.id ? faSpinner : faUserMinus}
                                                                className={`text-sm ${demotingMemberId === member.id ? "animate-spin" : ""}`}
                                                            />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveClick(member)}
                                                        disabled={isActionPending(member.id)}
                                                        title="Remove Member"
                                                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrashCan}
                                                            className="text-sm"
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        )}

                                        {/* Empty action cell for OWNER row to keep alignment */}
                                        {isLeader && member.role === "owner" && (
                                            <td className="px-5 py-3" />
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Remove Member Confirmation Modal */}
            {selectedMember && (
                <RemoveMemberModal
                    isOpen={isRemoveModalOpen}
                    onClose={() => {
                        setIsRemoveModalOpen(false);
                        setSelectedMember(null);
                    }}
                    groupId={groupId}
                    memberHandle={selectedMember.handle}
                    memberNickname={selectedMember.nickname}
                    onSuccess={handleRemoveSuccess}
                />
            )}
        </>
    );
};

export default GroupMembersTable;
