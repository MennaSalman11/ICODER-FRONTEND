import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faCheckCircle, faCalendarDays } from "@fortawesome/free-regular-svg-icons";

type ContestStatus = "running" | "ended" | "scheduled";

interface StatusBadgeProps {
    status: ContestStatus;
}

const config = {
    running: {
        label: "Running",
        icon: faCircle,
        cls: "bg-orange-100 text-orange-600 border border-orange-200",
        dotCls: "bg-orange-500 animate-pulse",
    },
    ended: {
        label: "Ended",
        icon: faCheckCircle,
        cls: "bg-red-50 text-red-500 border border-red-100",
        dotCls: null,
    },
    scheduled: {
        label: "Scheduled",
        icon: faCalendarDays,
        cls: "bg-gray-100 text-gray-500 border border-gray-200",
        dotCls: null,
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { label, icon, cls, dotCls } = config[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${cls}`}
        >
            {dotCls ? (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
            ) : (
                <FontAwesomeIcon icon={icon} className="text-[10px] shrink-0" />
            )}
            {label}
        </span>
    );
}
