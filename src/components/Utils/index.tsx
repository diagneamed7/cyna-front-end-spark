import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
 HiMiniXMark as X,
  HiMiniCheckCircle as CheckCircle,
  HiMiniInformationCircle as Info,
  HiMiniExclamationCircle as AlertCircle,
  HiMiniExclamationTriangle as AlertTriangle,
  HiMiniMagnifyingGlass as Search,
  HiMiniChevronDown as ChevronDown,
  HiMiniChevronUp as ChevronUp,
  HiMiniDocumentDuplicate as Copy,
  HiMiniArrowDownTray as Download,
  HiMiniShare as Share2,
  HiMiniEye as Eye,
  HiMiniEyeSlash as EyeOff,
  HiMiniCalendar as Calendar,
  HiMiniClock as Clock,
  HiMiniUser as User,
  HiMiniEnvelope as Mail,
  HiMiniPhone as Phone,
  HiMiniGlobeAlt as Globe,
  HiMiniStar as Star,
  HiMiniHeart as Heart,
  HiMiniBookmark as Bookmark,
  HiMiniFlag as Flag,
  HiMiniEllipsisVertical as MoreVertical,
  HiMiniArrowPath as Loader,
} from 'react-icons/hi2';

// =============================================================================
// NOTIFICATIONS CONTEXT & PROVIDER
// =============================================================================

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    const newNotification = { ...notification, id };
    setNotifications((prev) => [...prev, newNotification]);
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;
  const { notifications, removeNotification } = context;
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onClose={() => removeNotification(notification.id)} />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Info;
    }
  };
  const getColors = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  const Icon = getIcon();
  return (
    <div className={`${getColors()} border rounded-lg p-4 shadow-lg transition-all duration-300`}>
      <div className="flex items-start space-x-3">
        <Icon size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium mt-2 hover:underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

// =============================================================================
// MODAL
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full m-4';
      default: return 'max-w-lg';
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeOnBackdrop ? onClose : undefined}
        />
        {/* Modal */}
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${getSizeClasses()} max-h-[90vh] overflow-hidden`}>
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// LOADING
// =============================================================================

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
}
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Chargement...',
  overlay = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };
  const content = (
    <div className="flex flex-col items-center space-y-3">
      <Loader className={`${getSizeClasses()} animate-spin text-emerald-600`} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  return content;
};

// =============================================================================
// CONFIRMATION MODAL
// =============================================================================

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
  isLoading = false
}) => {
  const getButtonColors = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 text-white';
      default: return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };
  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertCircle className="text-red-600" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-600" size={24} />;
      case 'info': return <Info className="text-blue-600" size={24} />;
      default: return <AlertCircle className="text-red-600" size={24} />;
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closeOnBackdrop={!isLoading}>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${getButtonColors()}`}
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// =============================================================================
// DROPDOWN
// =============================================================================

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}
interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  searchable = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = searchable
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 ${
                      option.value === value ? 'bg-emerald-50 text-emerald-700' : 'text-gray-900'
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {Icon && <Icon size={16} />}
                    <span>{option.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-gray-500 text-center">Aucun résultat trouvé</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ACCORDION
// =============================================================================

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  icon?: React.ComponentType<any>;
}
export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen = false,
  onToggle,
  icon: Icon,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon size={20} className="text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};
AccordionItem.displayName = "AccordionItem";

interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
}
export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else {
        if (!allowMultiple) newSet.clear();
        newSet.add(index);
      }
      return newSet;
    });
  };
  return (
    <div className="space-y-2">
      {React.Children.map(children, (child, index) => {
        if (
          React.isValidElement(child) &&
          ((child.type as any).displayName === "AccordionItem" ||
            (child.type as any).name === "AccordionItem")
        ) {
          return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
            isOpen: openItems.has(index),
            onToggle: () => toggleItem(index),
          });
        }
        return child;
      })}
    </div>
  );
};

// =============================================================================
// TOOLTIP
// =============================================================================

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };
  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };
  const getPositionClasses = () => {
    switch (position) {
      case 'top': return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom': return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left': return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right': return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };
  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${getPositionClasses()} z-50`}>
          <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// BADGE
// =============================================================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'md': return 'px-2.5 py-1.5 text-sm';
      case 'lg': return 'px-3 py-2 text-base';
      default: return 'px-2.5 py-1.5 text-sm';
    }
  };
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {children}
    </span>
  );
};

// =============================================================================
// TABS
// =============================================================================

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  count?: number;
  disabled?: boolean;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {Icon && <Icon size={16} />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge variant="default" size="sm">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
};

// =============================================================================
// COPY TO CLIPBOARD
// =============================================================================

interface CopyToClipboardProps {
  text: string;
  children?: ReactNode;
  onCopy?: () => void;
  className?: string;
}
export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  children,
  onCopy,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const { addNotification } = useNotifications();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      addNotification({
        type: 'success',
        title: 'Copié !',
        message: 'Le texte a été copié dans le presse-papier',
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de copier le texte'
      });
    }
  };
  if (children) {
    return (
      <button onClick={handleCopy} className={className}>
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${className}`}
    >
      <Copy size={16} />
      <span>{copied ? 'Copié !' : 'Copier'}</span>
    </button>
  );
};

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mb-4">
          <Icon size={48} className="mx-auto text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// HOOKS: useModal & useConfirmation
// =============================================================================

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState<any>({});
  const openModal = (props?: any) => {
    setModalProps(props || {});
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setModalProps({});
  };
  return {
    isOpen,
    modalProps,
    openModal,
    closeModal
  };
};

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const confirm = (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmation({
      isOpen: true,
      ...params
    });
  };
  const closeConfirmation = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };
  const ConfirmationDialog = () => (
    <ConfirmationModal
      isOpen={confirmation.isOpen}
      onClose={closeConfirmation}
      onConfirm={() => {
        confirmation.onConfirm();
        closeConfirmation();
      }}
      title={confirmation.title}
      message={confirmation.message}
      type={confirmation.type}
    />
  );
  return {
    confirm,
    ConfirmationDialog
  };
};
