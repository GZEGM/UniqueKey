import React, { useState } from "react";
import {
  Home,
  Link,
  BarChart2,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Copy,
  BarChartHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

// --- Dữ liệu giả (Mock Data) ---
const initialLinkGroups = [
  {
    id: 1,
    name: 'Chiến dịch "Back to School 2024"',
    links: [
      {
        id: "a1",
        key: "/ytb",
        originalUrl: "https://youtube.com/ten-chien-dich",
        clicks: 1200,
        status: "active",
      },
      {
        id: "a2",
        key: "/fb",
        originalUrl: "https://facebook.com/ten-chien-dich",
        clicks: 2500,
        status: "active",
      },
      {
        id: "a3",
        key: "/tiktok",
        originalUrl: "https://tiktok.com/ten-chien-dich",
        clicks: 10500,
        status: "active",
      },
    ],
    isExpanded: true,
  },
  {
    id: 2,
    name: "Links Mạng Xã Hội (Chung)",
    links: [
      {
        id: "b1",
        key: "/website",
        originalUrl: "https://trang-cua-ban.com",
        clicks: 50,
        status: "archived",
      },
      {
        id: "b2",
        key: "/blog",
        originalUrl: "https://trang-cua-ban.com/blog",
        clicks: 230,
        status: "active",
      },
    ],
    isExpanded: false,
  },
];

// --- Component Chính ---
export default function App() {
  const [view, setView] = useState("dashboard"); // 'dashboard', 'globalStats', 'keyStats'
  const [selectedKey, setSelectedKey] = useState(null); // Dùng cho 'keyStats'
  const [linkGroups, setLinkGroups] = useState(initialLinkGroups);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mặc định mở trên desktop

  // State cho Modals
  const [modal, setModal] = useState({
    type: null, // 'editGroup', 'deleteGroup', 'editLink', 'deleteLink'
    data: null,
  });

  // --- Hàm xử lý cho Groups & Links ---
  const toggleGroup = (groupId) => {
    setLinkGroups(
      linkGroups.map((group) =>
        group.id === groupId
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  const handleCopy = (text) => {
    // Logic copy. Tạm thời dùng 'prompt' vì 'navigator.clipboard' có thể bị chặn
    console.log("Copied:", text);
    alert(`Đã copy: ${text}`);
  };

  // --- Hàm CRUD ---
  const handleUpdateGroup = (groupId, newName) => {
    setLinkGroups(
      linkGroups.map((group) =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
    setModal({ type: null, data: null });
  };

  const handleDeleteGroup = (groupId) => {
    setLinkGroups(linkGroups.filter((group) => group.id !== groupId));
    setModal({ type: null, data: null });
  };

  const handleUpdateLink = (groupId, linkId, updatedLink) => {
    setLinkGroups(
      linkGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            links: group.links.map((link) =>
              link.id === linkId ? { ...link, ...updatedLink } : link
            ),
          };
        }
        return group;
      })
    );
    setModal({ type: null, data: null });
  };

  const handleDeleteLink = (groupId, linkId) => {
    setLinkGroups(
      linkGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            links: group.links.filter((link) => link.id !== linkId),
          };
        }
        return group;
      })
    );
    setModal({ type: null, data: null });
  };

  // --- Hàm điều hướng ---
  const navigateToKeyStats = (link) => {
    setSelectedKey(link);
    setView("keyStats");
  };

  const navigate = (newView) => {
    setView(newView);
    setSelectedKey(null); // Reset key khi chuyển view
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        currentView={view}
        navigate={navigate}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {view === "dashboard" && (
            <DashboardView
              linkGroups={linkGroups}
              toggleGroup={toggleGroup}
              handleCopy={handleCopy}
              onEditGroup={(group) =>
                setModal({ type: "editGroup", data: group })
              }
              onDeleteGroup={(group) =>
                setModal({ type: "deleteGroup", data: group })
              }
              onEditLink={(link, groupId) =>
                setModal({ type: "editLink", data: { ...link, groupId } })
              }
              onDeleteLink={(link, groupId) =>
                setModal({ type: "deleteLink", data: { ...link, groupId } })
              }
              onKeyClick={navigateToKeyStats}
            />
          )}
          {view === "globalStats" && <GlobalStatsView />}
          {view === "keyStats" && selectedKey && (
            <KeyStatsView linkKey={selectedKey} />
          )}
        </main>
      </div>

      {/* Render Modals */}
      {modal.type && (
        <ModalManager
          modal={modal}
          onClose={() => setModal({ type: null, data: null })}
          onUpdateGroup={handleUpdateGroup}
          onDeleteGroup={handleDeleteGroup}
          onUpdateLink={handleUpdateLink}
          onDeleteLink={handleDeleteLink}
        />
      )}
    </div>
  );
}

// --- Components Con ---

function Sidebar({ isSidebarOpen, currentView, navigate }) {
  const navItemClass =
    "flex items-center px-4 py-3 text-gray-600 hover:bg-sky-100 hover:text-sky-700 rounded-lg transition-colors duration-200";
  const activeNavItemClass =
    "flex items-center px-4 py-3 bg-sky-100 text-sky-700 font-medium rounded-lg";

  return (
    <div
      className={`transition-all duration-300 bg-white shadow-lg ${
        isSidebarOpen ? "w-64" : "w-20"
      } h-screen flex flex-col`}
    >
      <div
        className={`flex items-center ${
          isSidebarOpen ? "justify-between" : "justify-center"
        } px-6 h-16 border-b`}
      >
        {isSidebarOpen && (
          <span className="text-2xl font-bold text-sky-700">LinkFlow</span>
        )}
        <BarChartHorizontal className="text-sky-700" />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={<Home size={20} />}
          label="Dashboard"
          isSidebarOpen={isSidebarOpen}
          isActive={currentView === "dashboard"}
          onClick={() => navigate("dashboard")}
        />
        <NavItem
          icon={<BarChart2 size={20} />}
          label="Thống kê tổng"
          isSidebarOpen={isSidebarOpen}
          isActive={currentView === "globalStats"}
          onClick={() => navigate("globalStats")}
        />
        <NavItem
          icon={<Link size={20} />}
          label="Tất cả links"
          isSidebarOpen={isSidebarOpen}
          isActive={currentView === "allLinks"}
          onClick={() => navigate("allLinks")} // Giả sử có view này
        />
        <NavItem
          icon={<Settings size={20} />}
          label="Cài đặt"
          isSidebarOpen={isSidebarOpen}
          isActive={currentView === "settings"}
          onClick={() => navigate("settings")} // Giả sử có view này
        />
      </nav>
      <div className="p-4 border-t">
        <NavItem
          icon={<div className="w-8 h-8 bg-gray-300 rounded-full"></div>}
          label="Tài khoản"
          isSidebarOpen={isSidebarOpen}
          isActive={false}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, isSidebarOpen, isActive, onClick }) {
  const baseClass =
    "flex items-center py-3 text-gray-600 hover:bg-sky-100 hover:text-sky-700 rounded-lg transition-colors duration-200";
  const activeClass = "bg-sky-100 text-sky-700 font-medium";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${isActive ? activeClass : ""} ${
        isSidebarOpen ? "px-4" : "px-6 justify-center"
      }`}
    >
      {icon}
      {isSidebarOpen && <span className="ml-4">{label}</span>}
    </button>
  );
}

function Header({ toggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <button
        onClick={toggleSidebar}
        className="text-gray-600 hover:text-sky-700"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200 flex items-center space-x-2">
          <Plus size={18} />
          <span>Tạo Link mới</span>
        </button>
      </div>
    </header>
  );
}

// --- Views (Components cho từng trang) ---

function DashboardView({
  linkGroups,
  toggleGroup,
  handleCopy,
  onEditGroup,
  onDeleteGroup,
  onEditLink,
  onDeleteLink,
  onKeyClick,
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      {linkGroups.map((group) => (
        <div
          key={group.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Header của Group */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => toggleGroup(group.id)}
          >
            <div className="flex items-center">
              {group.isExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
              <h2 className="text-xl font-semibold text-gray-700 ml-3">
                {group.name}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditGroup(group);
                }}
                className="text-gray-500 hover:text-blue-600"
                title="Sửa nhóm"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(group);
                }}
                className="text-gray-500 hover:text-red-600"
                title="Xóa nhóm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Danh sách link (nếu mở) */}
          {group.isExpanded && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL Gốc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lượt click
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.links.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onKeyClick(link)}
                          className="text-sky-600 hover:text-sky-800 font-medium hover:underline"
                        >
                          {link.key}
                        </button>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-bold">
                        {link.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            link.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {link.status === "active" ? "Hoạt động" : "Lưu trữ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handleCopy(`your-domain.com${link.key}`)
                          }
                          className="text-gray-500 hover:text-sky-600"
                          title="Copy"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => onEditLink(link, group.id)}
                          className="text-gray-500 hover:text-blue-600"
                          title="Sửa link"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => onDeleteLink(link, group.id)}
                          className="text-gray-500 hover:text-red-600"
                          title="Xóa link"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GlobalStatsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Thống kê tổng</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cho các card thống kê */}
        <StatCard title="Tổng lượt click" value="1,2M" />
        <StatCard title="Tổng số links" value="150" />
        <StatCard title="Links hoạt động" value="125" />
        <StatCard title="Chiến dịch" value="12" />
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Lượt click theo thời gian
        </h2>
        <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">
            [Biểu đồ đường (Line Chart) ở đây]
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Nguồn truy cập</h2>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">
              [Biểu đồ tròn (Pie Chart) ở đây]
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Top Links</h2>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">[Danh sách top links ở đây]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyStatsView({ linkKey }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Thống kê chi tiết cho:{" "}
        <span className="text-sky-600">{linkKey.key}</span>
      </h1>
      <p className="text-gray-600">
        URL Gốc:{" "}
        <a
          href={linkKey.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {linkKey.originalUrl}
        </a>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng lượt click"
          value={linkKey.clicks.toLocaleString()}
        />
        <StatCard title="Click (24h)" value="150" /> {/* Dữ liệu giả */}
        <StatCard title="Click (7 ngày)" value="820" /> {/* Dữ liệu giả */}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Lượt click theo thời gian
        </h2>
        <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">
            [Biểu đồ chi tiết cho {linkKey.key} ở đây]
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Nguồn truy cập (Referrers)
          </h2>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">
              [Biểu đồ nguồn truy cập cho {linkKey.key}]
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Vị trí địa lý</h2>
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">
              [Bản đồ vị trí cho {linkKey.key}]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}

// --- Quản lý Modals ---

function ModalManager({
  modal,
  onClose,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateLink,
  onDeleteLink,
}) {
  if (!modal.type) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">
            {
              {
                editGroup: "Sửa nhóm link",
                deleteGroup: "Xác nhận xóa nhóm",
                editLink: "Sửa link (key)",
                deleteLink: "Xác nhận xóa link",
              }[modal.type]
            }
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Modal */}
        {modal.type === "editGroup" && (
          <EditGroupForm
            group={modal.data}
            onSubmit={onUpdateGroup}
            onClose={onClose}
          />
        )}
        {modal.type === "deleteGroup" && (
          <DeleteConfirmation
            item={modal.data}
            itemName={modal.data.name}
            onDelete={() => onDeleteGroup(modal.data.id)}
            onClose={onClose}
            message="Bạn có chắc chắn muốn xóa nhóm này? Tất cả các link bên trong cũng sẽ bị xóa."
          />
        )}
        {modal.type === "editLink" && (
          <EditLinkForm
            link={modal.data}
            onSubmit={onUpdateLink}
            onClose={onClose}
          />
        )}
        {modal.type === "deleteLink" && (
          <DeleteConfirmation
            item={modal.data}
            itemName={modal.data.key}
            onDelete={() => onDeleteLink(modal.data.groupId, modal.data.id)}
            onClose={onClose}
            message="Bạn có chắc chắn muốn xóa link (key) này?"
          />
        )}
      </div>
    </div>
  );
}

function EditGroupForm({ group, onSubmit, onClose }) {
  const [name, setName] = useState(group.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(group.id, name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6">
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-gray-700"
        >
          Tên nhóm
        </label>
        <input
          type="text"
          id="groupName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          required
        />
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
        >
          Lưu
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

function EditLinkForm({ link, onSubmit, onClose }) {
  const [key, setKey] = useState(link.key);
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim() && originalUrl.trim()) {
      onSubmit(link.groupId, link.id, {
        key: key.trim(),
        originalUrl: originalUrl.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-4">
        <div>
          <label
            htmlFor="linkKey"
            className="block text-sm font-medium text-gray-700"
          >
            Key (VD: /fb)
          </label>
          <input
            type="text"
            id="linkKey"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="linkUrl"
            className="block text-sm font-medium text-gray-700"
          >
            URL Gốc
          </label>
          <input
            type="url"
            id="linkUrl"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            required
          />
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
        >
          Lưu
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmation({ item, itemName, message, onDelete, onClose }) {
  return (
    <div>
      <div className="p-6">
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-center font-semibold text-lg my-4 text-red-700 break-words">
          {itemName}
        </p>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={onDelete}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
        >
          Xóa
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
