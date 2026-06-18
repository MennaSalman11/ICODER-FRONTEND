"use client";

import { useEffect, useState } from "react";
import GroupSidebar from "./component/group-sidebar";
import GroupActionButtons from "./component/group-action-buttons";
import GroupContestsTable from "./component/group-contests-table";
import GroupMembersTable from "./component/group-members-table";
import UpdateGroupModal from "./component/update-group-modal";
import InviteMemberModal from "./component/invite-member-modal";
import CreateContestModal from "./component/create-contest-modal";
import { groupService } from "@/src/lib/services/group-service";
import { GroupResponse, GroupMemberResponse } from "@/src/types/group";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GroupPage() {
    const params = useParams();
    const id = Number(params.id);
    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLeader, setIsLeader] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isContestModalOpen, setIsContestModalOpen] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const { data: session } = useSession();
    const numericId = session?.user?.numericId;

    // Derive membership status from the members list
    const isMember = members.some(
        (m) => String(m.user_id) === String(numericId)
    );


    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const groupData = await groupService.getGroupById(id);
                setGroup(groupData);

                const membersData = await groupService.getMembers(id);
                setMembers(membersData.content || []);



                // Simplified leader check - in real app, compare with current user profile
                // This should be dynamic
            } catch (error) {
                console.error("Failed to fetch group data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4583]"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Group not found </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="max-w-7xl mx-auto pt-10">
                <div className="flex flex-col md:flex-row gap-6  items-center justify-center ">

                    {/* ─── Left Sidebar ─── */}
                    <GroupSidebar group={{
                        id: group.id.toString(),
                        name: group.name,
                        description: group.description,
                        isPublic: group.visibility === "public" ? true : false,
                        joinPolicy: group.visibility === "public" ? "Free join" : "Code required",
                        membersCount: group.group_members_count,
                        owner_id: group.owner_id,
                        createdAt: group.created_at,
                        code: group.code,
                        leader: group.owner_handle,
                        numericId: group.id.toString(),
                        picture: group.picture_url,
                        members: members,

                    }} />

                    {/* ─── Right Content ─── */}
                    <div className="flex-1 flex flex-col gap-4">

                        {/* ─── Guest: Join Group Button (public groups only) ─── */}
                        {!isMember && group.visibility === "public" && (
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                                <button
                                    disabled={isJoining}
                                    onClick={async () => {
                                        setIsJoining(true);
                                        try {
                                            await groupService.joinGroup(Number(group.id));
                                            // Optimistically add the current user to the members list
                                            // so the UI switches immediately without a full page refresh
                                            const freshMembers = await groupService.getMembers(id);
                                            setMembers(freshMembers.content || []);
                                            toast.success("You have joined the group!");
                                        } catch (error) {
                                            console.error("Failed to join group:", error);
                                            toast.error("Failed to join the group. Please try again.");
                                        } finally {
                                            setIsJoining(false);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#1b4583] text-white rounded-lg text-sm font-semibold hover:bg-[#163a6e] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isJoining ? (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : null}
                                    {isJoining ? "Joining…" : "Join Group"}
                                </button>
                            </div>
                        )}

                        {/* ─── Member: Action Buttons (preserves all internal permission logic) ─── */}
                        {isMember && (
                            <GroupActionButtons
                                group={{
                                    id: group.id.toString(),
                                    name: group.name,
                                    description: group.description,
                                    isPublic: group.visibility === "public" ? true : false,
                                    joinPolicy: group.visibility === "public" ? "Free join" : "Code required",
                                    membersCount: group.group_members_count,
                                    owner_id: group.owner_id,
                                    createdAt: group.created_at,
                                    code: group.code,
                                    leader: group.owner_handle,
                                    numericId: group.id.toString(),
                                    picture: group.picture_url,
                                    contest_coordinator_type: group.contest_coordinator_type,
                                }}
                                members={members}
                                onArrangeContest={() => setIsContestModalOpen(true)}
                                onUpdateGroup={() => setIsUpdateModalOpen(true)}
                                onInviteMembers={() => setIsInviteModalOpen(true)}
                            />
                        )}

                        {/* Group Contests Table */}
                        <GroupContestsTable
                            groupName={group.name}
                            token={(session as any)?.accessToken}
                        />

                        {/* Group Members Table */}
                        <GroupMembersTable
                            members={members.map(m => ({
                                id: m.user_id.toString(),
                                role: (m.role === "owner" ? "owner" : m.role) as "owner" | "manager" | "member",
                                nickname: m.nickname,
                                username: m.handle,
                                joinedAt: "N/A"
                            }))}
                            totalCount={group.group_members_count}
                            isLeader={group.owner_id === numericId ? true : false}
                            groupId={Number(group.id)}
                            onMemberPromoted={async () => {
                                try {
                                    const membersData = await groupService.getMembers(id);
                                    setMembers(membersData.content || []);
                                } catch (error) {
                                    console.error("Failed to refresh members:", error);
                                }
                            }}
                            onMemberDemoted={async () => {
                                try {
                                    const membersData = await groupService.getMembers(id);
                                    setMembers(membersData.content || []);
                                } catch (error) {
                                    console.error("Failed to refresh members:", error);
                                }
                            }}
                            onMemberRemoved={async () => {
                                try {
                                    const [updatedGroup, membersData] = await Promise.all([
                                        groupService.getGroupById(id),
                                        groupService.getMembers(id),
                                    ]);
                                    setGroup(updatedGroup);
                                    setMembers(membersData.content || []);
                                } catch (error) {
                                    console.error("Failed to refresh data:", error);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Update Group Modal */}
            <UpdateGroupModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                groupId={group.id.toString()}
                onSuccess={async () => {
                    try {
                        const updatedGroup = await groupService.getGroupById(id);
                        setGroup(updatedGroup);
                    } catch (error) {
                        console.error("Failed to refresh group data:", error);
                    }
                }}
                initialData={{
                    name: group.name,
                    visibility: group.visibility?.toUpperCase() || "PUBLIC",
                    code_enabled: !!group.code,
                    contest_coordinator_type: group.contest_coordinator_type || "LEADER",
                    description: group.description || "",
                }}
            />

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                groupCode={group.code || "N/A"}
                groupId={Number(group.id)}
            />

            {/* Create Contest Modal */}
            <CreateContestModal
                isOpen={isContestModalOpen}
                onClose={() => setIsContestModalOpen(false)}
            />
        </div>
    );
}