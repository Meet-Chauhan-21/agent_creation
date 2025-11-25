import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheckCircle, FiTrash2, FiCopy, FiLogOut } from "react-icons/fi";

const ConfirmModal = ({ 
  isOpen, 
  setIsOpen, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, success, danger, info
}) => {
  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheckCircle />;
      case "danger":
        return <FiTrash2 />;
      case "info":
        return <FiCopy />;
      case "logout":
        return <FiLogOut />;
      default:
        return <FiAlertCircle />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case "success":
        return "from-green-600 to-emerald-600";
      case "danger":
        return "from-red-600 to-rose-600";
      case "info":
        return "from-blue-600 to-cyan-600";
      case "logout":
        return "from-orange-600 to-red-600";
      default:
        return "from-violet-600 to-indigo-600";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "danger":
        return "text-red-600";
      case "info":
        return "text-blue-600";
      case "logout":
        return "text-orange-600";
      default:
        return "text-indigo-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-gradient-to-br ${getGradient()} text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden`}
          >
            <div className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24">
              {getIcon()}
            </div>
            <div className="relative z-10">
              <div className={`bg-white w-16 h-16 mb-2 rounded-full text-3xl ${getIconColor()} grid place-items-center mx-auto`}>
                {getIcon()}
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">
                {title}
              </h3>
              <p className="text-center mb-6">
                {message}
              </p>
              <div className="flex gap-2">
                {cancelText && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className="bg-white hover:opacity-90 transition-opacity font-semibold w-full py-2 rounded"
                  style={{ color: type === "danger" ? "#dc2626" : type === "logout" ? "#ea580c" : type === "success" ? "#059669" : "#4f46e5" }}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
