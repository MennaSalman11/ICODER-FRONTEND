import { ReactNode } from "react";
import GroupsHeader from "./component/group-header";

interface GroupsLayoutProps {
  children: ReactNode;
}

const GroupsLayout = ({ children }: GroupsLayoutProps) => {
  return (
    <div className=" bg-gray-50 border-b-2 border-gray-200 pb-10 mt-10">
      
     

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
       
        {children}
      </div>
    </div>
  );
};

export default GroupsLayout;
