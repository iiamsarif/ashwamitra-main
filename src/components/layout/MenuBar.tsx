import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Users } from "lucide-react";

const MenuBar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg border-b border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <Menubar className="border-none bg-transparent p-0 space-x-1">
              <MenubarMenu>
                
                <MenubarContent className="bg-white border-green-200 shadow-xl">
                  <MenubarItem onClick={() => handleNavigation("/farmer")} className="hover:bg-green-50 cursor-pointer">
                    Farmer Login
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNavigation("/farmer/dashboard")} className="hover:bg-green-50 cursor-pointer">
                    Farmer Dashboard
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => handleNavigation("/b2b")} className="hover:bg-green-50 cursor-pointer">
                    Business Login
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNavigation("/b2b/dashboard")} className="hover:bg-green-50 cursor-pointer">
                    B2B Dashboard
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => handleNavigation("/customer")} className="hover:bg-green-50 cursor-pointer">
                    Customer Login
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNavigation("/customer/dashboard")} className="hover:bg-green-50 cursor-pointer">
                    Customer Dashboard
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem className="hover:bg-green-50 cursor-pointer">
                    Registration Guide
                    <MenubarShortcut className="text-green-600">→</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
