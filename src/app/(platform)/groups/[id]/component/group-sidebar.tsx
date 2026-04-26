"use client";
import { useState, useCallback } from "react";
import { groupService } from "@/src/lib/services/group-service";
import { useSession } from "next-auth/react";
import UpdatePictureModal from "./update-picture-modal";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import ViewImageModal from "./view-image-modal";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faGlobe,
    faLock,
    faUsers,
    faCalendarAlt,
    faCrown,
    faEye,
    faPenToSquare,
    faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { GroupMemberResponse } from "@/src/types/group";

interface GroupSidebarProps {
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
        members: GroupMemberResponse[];

    };
}

const GroupSidebar = ({ group }: GroupSidebarProps) => {
    const { data: session } = useSession();
    const numericId = session?.user?.numericId;
    const currentUserId = session?.user?.id;
    const isOwner = String(session?.user?.numericId) === String(group.owner_id);
    const [isUpdatePictureOpen, setIsUpdatePictureOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isViewImageOpen, setIsViewImageOpen] = useState(false);
    const [imageKey, setImageKey] = useState(0);
    const [currentPicture, setCurrentPicture] = useState<string | null>(group.picture);

    /** Re-fetches the picture URL from the server and updates the displayed image. */
    const refreshPicture = useCallback(async () => {
        try {
            const data = await groupService.getGroupPicture(Number(group.id));
            if (data?.picture_url) {
                setCurrentPicture(data.picture_url + `?v=${Date.now()}`);
            } else {
                // No picture on server — fall back to placeholder
                setCurrentPicture(null);
                setImageKey((prev) => prev + 1);
            }
        } catch {
            // On error keep whatever was showing
        }
    }, [group.id]);

    return (
        <div className="w-full   md:w-[240px] shrink-0 flex flex-col gap-0">
            {/* Back to Groups */}
            <Link
                href="/groups"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1b4583] transition-colors mb-3 font-medium"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                Back to Groups
            </Link>

            {/* Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Cover Image with hover overlay */}
                <div className="group/image relative h-44 overflow-hidden cursor-pointer">
                    <img
                        src={currentPicture || `https://picsum.photos/seed/${group.id}/600/300?v=${imageKey}`}
                        alt={group.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                    />

                    {/* Dark overlay + action icons (visible on hover) */}
                    {isOwner && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                            {/* View */}
                            <span
                                title="View"
                                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200 cursor-pointer"
                                onClick={() => setIsViewImageOpen(true)}
                            >
                                <FontAwesomeIcon icon={faEye} className="text-sm" />
                            </span>

                            {/* Update */}
                            <span
                                title="Update"
                                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200 cursor-pointer"
                                onClick={() => setIsUpdatePictureOpen(true)}
                            >
                                <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                            </span>

                            {/* Delete */}
                            <span
                                title="Delete"
                                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/70 transition-colors duration-200 cursor-pointer"
                                onClick={() => setIsDeleteConfirmOpen(true)}
                            >
                                <FontAwesomeIcon icon={faTrashCan} className="text-sm" />
                            </span>
                        </div>
                    )}
                    {/* Top border accent */}
                    <div className={group.isPublic ? "absolute top-0 left-0 right-0 h-[4px] bg-orange-400" : "absolute top-0 left-0 right-0 h-[4px] bg-[#1b4583]"} />
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 leading-tight">
                            {group.name}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {group.description}
                        </p>
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2">
                        {/* Visibility */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                                <FontAwesomeIcon
                                    icon={faGlobe}
                                    className="text-gray-400 text-xs w-4"
                                />
                                Visibility
                            </span>
                            <span
                                className={`text-xs font-bold uppercase tracking-wide ${group.isPublic
                                    ? "text-orange-500"
                                    : "text-[#1b4583]"
                                    }`}
                            >
                                {group.isPublic ? "PUBLIC" : "PRIVATE"}
                            </span>
                        </div>

                        {/* Join Policy */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                                <FontAwesomeIcon
                                    icon={faLock}
                                    className="text-gray-400 text-xs w-4"
                                />
                                Join Policy
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                                {group.joinPolicy}
                            </span>




                        </div>


                        <div>
                            {!group.isPublic && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-500">
                                        <FontAwesomeIcon
                                            icon={faLock}
                                            className="text-gray-400 text-xs w-4"
                                        />
                                        Invitation Code
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {group.code}
                                    </span>
                                </div>
                            )}
                        </div>



                        {/* Members */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                                <FontAwesomeIcon
                                    icon={faUsers}
                                    className="text-gray-400 text-xs w-4"
                                />
                                Members
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                                {group.membersCount} users
                            </span>
                        </div>

                        {/* Created */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    className="text-gray-400 text-xs w-4"
                                />
                                Created
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                                {group.createdAt.split("T")[0]}
                            </span>
                        </div>

                        {/* Leader */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-500">
                                <FontAwesomeIcon
                                    icon={faCrown}
                                    className="text-gray-400 text-xs w-4"
                                />
                                Leader
                            </span>
                            <span className="text-xs font-bold text-gray-800">
                                {group.owner_id === numericId ? "You" : group.leader}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* View Image Modal */}
            <ViewImageModal
                isOpen={isViewImageOpen}
                onClose={() => setIsViewImageOpen(false)}
                groupId={Number(group.id)}
                groupName={group.name}
            />

            {/* Update Picture Modal */}
            <UpdatePictureModal
                isOpen={isUpdatePictureOpen}
                onClose={() => setIsUpdatePictureOpen(false)}
                groupId={Number(group.id)}
                onSuccess={refreshPicture}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                groupId={Number(group.id)}
                onSuccess={() => setCurrentPicture(null)}
            />
        </div>
    );
};

export default GroupSidebar;
