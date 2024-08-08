import UserInfo from "@/components/UserInfo";

const Header = () => {
  return (
    <header className="flex items-center justify-between space-between px-2 lg:px-4 h-16 border-b w-full max-w-7xl mx-auto border border-gray-100 rounded-md shadow-sm">
      <div className="flex w-full items-center gap-4">
        <UserInfo />
      </div>
    </header>
  );
};

export default Header;
