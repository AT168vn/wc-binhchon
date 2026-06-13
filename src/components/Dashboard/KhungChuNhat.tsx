import Image from "next/image"
import { memo } from "react"

const UserCard = memo<{type:string}>(({type}) => {
  const getBackgroundColor = (type: string) => {
    switch(type.toLowerCase()) {
      case "công cụ hỗ trợ":
        return "bg-[#E3F2FD] border-[#1E88E5] border-l-4";
      case "chữ ký số":
        return "bg-[#E8F5E9] border-[#43A047] border-l-4";
      case "ds phiếu emr":
        return "bg-[#EDE7F6] border-[#5E35B1] border-l-4";
      case "tờ điều trị":
        return "bg-[#FFF3E0] border-[#FB8C00] border-l-4";
      default:
        return "bg-gray-50 border-gray-400 border-l-4";
    }
  };

  const getTextColor = (type: string) => {
    switch(type.toLowerCase()) {
      case "công cụ hỗ trợ":
        return "text-[#1565C0]";
      case "chữ ký số":
        return "text-[#2E7D32]";
      case "ds phiếu emr":
        return "text-[#4527A0]";
      case "tờ điều trị":
        return "text-[#EF6C00]";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className={`rounded-lg ${getBackgroundColor(type)} p-4 flex-1 min-w-[200px] shadow-md hover:shadow-lg transition-all duration-300`}>
      <div className="flex justify-between items-center">
        <span className="text-xs bg-white/90 px-3 py-1 rounded-full text-gray-600 font-medium shadow-sm">
          {new Date().toLocaleDateString('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit'
          })}
        </span>
        <Image src="/icons/more.png" alt="" width={20} height={20} className="opacity-70 hover:opacity-100 cursor-pointer"/>
      </div>
      <h1 className={`text-3xl font-bold my-4 ${getTextColor(type)}`}>1,234</h1>
      <h1 className={`capitalize text-sm ${getTextColor(type)} font-semibold`}>{type}</h1>
    </div>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;