import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiSave } from "react-icons/fi";

const UnsavedChangesModal = ({ 
  isOpen, 
  setIsOpen, 
  onSave,
  onDontSave,
}) => {
  const handleSave = () => {
    onSave();
    setIsOpen(false);
  };

  const handleDontSave = () => {
    onDontSave();
    setIsOpen(false);
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
            className="bg-gradient-to-br from-amber-600 to-orange-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <FiAlertCircle className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-amber-600 grid place-items-center mx-auto">
                <FiAlertCircle />
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">
                Unsaved Changes
              </h3>
              <p className="text-center mb-6">
                You have unsaved changes in your workflow. Would you like to save them before leaving?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDontSave}
                  className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-3 rounded border-2 border-white/40"
                >
                  Don't Save
                </button>
                <button
                  onClick={handleSave}
                  className="bg-white hover:opacity-90 transition-opacity text-amber-600 font-semibold w-full py-3 rounded flex items-center justify-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnsavedChangesModal;
