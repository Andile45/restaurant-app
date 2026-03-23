import { useCategories } from './categories/useCategories';
import { CategoriesTable } from './categories/CategoriesTable';
import { CategoryModal } from './categories/CategoryModal';

export const Categories: React.FC = () => {
  const {
    categories,
    loading,
    saving,
    showAddModal,
    editingCategory,
    categoryName,
    setCategoryName,
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    closeModal,
    errorMessage,
    dismissError,
  } = useCategories();

  if (loading) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Menu &gt; Categories</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {errorMessage && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 body text-sm">
          {errorMessage}
          <button
            type="button"
            onClick={dismissError}
            className="ml-3 underline text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      <CategoriesTable
        categories={categories}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showAddModal && (
        <CategoryModal
          editingCategory={editingCategory}
          categoryName={categoryName}
          onCategoryNameChange={setCategoryName}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
};
