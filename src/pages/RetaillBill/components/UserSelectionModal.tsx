import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { getCurrentUser } from '../../../helpers/auth';
import {
  Modal,
  Input,
  Typography,
  Table,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';

const { Title, Text } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  user_name: string;
  roleItems?: {
    name: string;
  };
  branchItems?: {
    branch_name: string;
  };
  organisationItems?: {
    name: string;
  };
}

interface UserSelectionModalProps {
  visible: boolean;
  onSelect: (user: User) => void;
  onCancel: () => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const { getEntityApi } = useApiActions();
  const BillingUsersApi = getEntityApi('BillingUsers');

  const { items: userList, loading: userLoading } = useDynamicSelector(
    BillingUsersApi.getIdentifier('GetAll')
  );

  // Extract items from userList if it exists
  const users = userList?.items || userList?.result || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  
  // Get current user from session storage
  const currentUser = useMemo(() => {
    return getCurrentUser();
  }, []);

  const searchInputRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return users.filter((user: User) =>
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.mobile?.toLowerCase().includes(searchLower) ||
      user.user_name?.toLowerCase().includes(searchLower) ||
      user.roleItems?.name?.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  // Consolidated keyboard navigation function
  const navigateToUser = useCallback(
    (direction: 'up' | 'down' | 'home' | 'end') => {
      if (filteredUsers.length === 0) return;

      let newIndex: number;
      switch (direction) {
        case 'up':
          newIndex =
            selectedRowIndex === -1
              ? filteredUsers.length - 1
              : Math.max(selectedRowIndex - 1, 0);
          break;
        case 'down':
          newIndex =
            selectedRowIndex === -1
              ? 0
              : Math.min(selectedRowIndex + 1, filteredUsers.length - 1);
          break;
        case 'home':
          newIndex = 0;
          break;
        case 'end':
          newIndex = filteredUsers.length - 1;
          break;
        default:
          return;
      }

      setSelectedRowIndex(newIndex);
      setSelectedUser(filteredUsers[newIndex]);

      // Scroll to the selected row
      setTimeout(() => {
        const rowElement = document.querySelector(
          `[data-row-key="${filteredUsers[newIndex]._id}"]`
        ) as HTMLElement;
        if (rowElement) {
          const scrollBehavior =
            direction === 'home'
              ? 'start'
              : direction === 'end'
                ? 'end'
                : 'nearest';
          rowElement.scrollIntoView({
            behavior: 'smooth',
            block: scrollBehavior,
          });
        }
      }, 100);
    },
    [filteredUsers, selectedRowIndex]
  );

  // Debounced search function
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (value.trim()) {
          BillingUsersApi('GetAll', { searchString: value.trim() });
        } else {
          BillingUsersApi('GetAll');
        }
      }, 300);
    },
    [BillingUsersApi]
  );

  // Handle user selection
  const handleUserSelect = useCallback(
    (user: User) => {
      setSelectedUser(user);
      onSelect(user);
      setTimeout(() => onCancel(), 100);
    },
    [onSelect, onCancel]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();

        const directionMap: Record<string, 'up' | 'down' | 'home' | 'end'> = {
          ArrowDown: 'down',
          ArrowUp: 'up',
          Home: 'home',
          End: 'end',
        };

        navigateToUser(directionMap[e.key]);
      }
    },
    [navigateToUser, onCancel]
  );

  // Global keyboard event handler
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!visible) return;

      // Don't interfere if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.classList.contains('ant-select-selector') ||
        target.closest('.ant-select-dropdown')
      ) {
        return;
      }

      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // Only handle navigation keys globally when not in form inputs
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();

        const directionMap: Record<string, 'up' | 'down' | 'home' | 'end'> = {
          ArrowDown: 'down',
          ArrowUp: 'up',
          Home: 'home',
          End: 'end',
        };

        navigateToUser(directionMap[e.key]);
      }
    },
    [visible, navigateToUser]
  );

  // Memoized table columns
  const columns = useMemo(
    () => [
      {
        title: '',
        key: 'select',
        width: 60,
        render: (text: string, record: User) => (
          <div
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => {
              setSelectedUser(record);
              const index = filteredUsers.findIndex(
                (u: User) => u._id === record._id
              );
              setSelectedRowIndex(index);
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border:
                  selectedUser?._id === record._id
                    ? '2px solid #1890ff'
                    : '2px solid #d9d9d9',
                backgroundColor:
                  selectedUser?._id === record._id ? '#1890ff' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {selectedUser?._id === record._id && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                  }}
                />
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: User) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <div>
              <Text strong>{text}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                @{record.user_name}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: 'Role',
        key: 'role',
        render: (text: string, record: User) => (
          <Tag color="blue">
            {record.roleItems?.name || 'No Role'}
          </Tag>
        ),
      },
      {
        title: 'Mobile',
        dataIndex: 'mobile',
        key: 'mobile',
        render: (text: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PhoneOutlined style={{ color: '#666' }} />
            <Text>{text}</Text>
          </div>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text: string) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MailOutlined style={{ color: '#666' }} />
            <Text>{text || '-'}</Text>
          </div>
        ),
      },
      {
        title: 'Branch',
        key: 'branch',
        render: (text: string, record: User) => (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.branchItems?.branch_name || '-'}
          </Text>
        ),
      },
    ],
    [selectedUser, filteredUsers]
  );

  // Memoized table row props
  const getRowProps = useCallback(
    (record: User, index?: number) => ({
      onClick: () => {
        setSelectedUser(record);
        setSelectedRowIndex(index ?? 0);
      },
      style: {
        cursor: 'pointer',
        backgroundColor:
          selectedUser?._id === record._id ? '#f0f8ff' : 'white',
        border:
          selectedUser?._id === record._id
            ? '2px solid #1890ff'
            : '1px solid #f0f0f0',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
      },
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        if (selectedUser?._id !== record._id) {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        if (selectedUser?._id !== record._id) {
          e.currentTarget.style.backgroundColor = 'white';
        }
      },
    }),
    [selectedUser]
  );

  // Load users on mount and handle modal close
  useEffect(() => {
    if (visible) {
      BillingUsersApi('GetAll');
      setSelectedUser(null);
      setSelectedRowIndex(-1);
    } else {
      setSearchTerm('');
      setSelectedUser(null);
      setSelectedRowIndex(-1);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [visible, BillingUsersApi]);

  // Auto-select current user when users are loaded
  useEffect(() => {
    if (visible && users.length > 0 && currentUser?._id && !selectedUser) {
      const currentUserInList = users.find((user: User) => user._id === currentUser._id);
      if (currentUserInList) {
        setSelectedUser(currentUserInList);
        const index = users.findIndex((user: User) => user._id === currentUser._id);
        setSelectedRowIndex(index);
        
        // Scroll to the selected user after a short delay
        setTimeout(() => {
          const rowElement = document.querySelector(
            `[data-row-key="${currentUserInList._id}"]`
          ) as HTMLElement;
          if (rowElement) {
            rowElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 200);
      }
    }
  }, [visible, users, currentUser?._id, selectedUser]);

  // Focus search input when modal becomes visible
  useEffect(() => {
    if (visible && searchInputRef.current) {
      const focusSearch = () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      };

      focusSearch();
      const timer = setTimeout(focusSearch, 100);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Global keyboard event listener
  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleGlobalKeyDown, true);
      return () =>
        document.removeEventListener('keydown', handleGlobalKeyDown, true);
    }
  }, [visible, handleGlobalKeyDown]);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setSelectedUser(null);
    setSelectedRowIndex(-1);
  }, []);

  return (
    <Modal
      title="Select User (Billed By)"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      style={{ top: 20 }}
      afterOpenChange={open => {
        if (open && searchInputRef.current) {
          setTimeout(() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
          }, 100);
        }
      }}
    >
      <div
        ref={modalRef}
        style={{ marginBottom: 16 }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <Input
          ref={searchInputRef}
          placeholder="Search users... (↑↓: Navigate, Enter: Select, Esc: Close)"
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: '100%' }}
          onKeyDown={e => {
            // Only handle Enter key in search input, let other keys bubble up
            if (e.key === 'Enter' && selectedUser) {
              handleUserSelect(selectedUser);
            }
          }}
          onFocus={handleSearchFocus}
          autoFocus
          onBlur={() => {
            // Auto-focus back to search if modal is still visible
            if (visible && searchInputRef.current) {
              setTimeout(() => {
                if (visible && searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 10);
            }
          }}
          suffix={
            searchTerm && userLoading ? (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Searching...
              </div>
            ) : null
          }
        />
      </div>

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {userLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text>Loading users...</Text>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">
              {searchTerm
                ? 'No users found matching your search.'
                : 'No users available.'}
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="_id"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
            onRow={getRowProps}
          />
        )}
      </div>
    </Modal>
  );
};

export default UserSelectionModal;
